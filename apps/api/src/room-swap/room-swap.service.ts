import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomSwapService {
  constructor(private prisma: PrismaService) {}

  async createListing(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        allotment: {
          include: {
            room: { include: { floor: { include: { hostel: true } } } },
          },
        },
      },
    });

    if (!student || !student.allotment || !student.allotment.isPossessed) {
      throw new BadRequestException(
        'You must have a possessed room allotment to list for swap.',
      );
    }

    const existingListing = await this.prisma.roomSwapRequest.findUnique({
      where: { studentId: student.id },
    });

    if (existingListing) {
      throw new BadRequestException('You already have an active swap listing.');
    }

    return this.prisma.roomSwapRequest.create({
      data: {
        studentId: student.id,
        hostelId: student.allotment.room.floor.hostel.id,
        status: 'ACTIVE',
      },
    });
  }

  async removeListing(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.roomSwapRequest.delete({
      where: { studentId: student.id },
    });
  }

  async getMyListing(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.roomSwapRequest.findUnique({
      where: { studentId: student.id },
    });
  }

  async getListings(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        allotment: {
          include: {
            room: { include: { floor: { include: { hostel: true } } } },
          },
        },
      },
    });

    if (!student || !student.allotment) {
      throw new BadRequestException('No allotment found.');
    }

    const hostelId = student.allotment.room.floor.hostel.id;

    return this.prisma.roomSwapRequest.findMany({
      where: {
        hostelId: hostelId,
        status: 'ACTIVE',
        studentId: { not: student.id }, // Exclude self
      },
      include: {
        student: {
          select: {
            name: true,
            uniqueId: true,
            allotment: {
              include: {
                room: {
                  include: {
                    floor: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async sendInvite(userId: string, targetStudentId: string) {
    const sender = await this.prisma.student.findUnique({ where: { userId } });
    if (!sender) throw new NotFoundException('Student not found');

    // Check compatibility (e.g. same gender, same hostel is enforced by getListings logic)
    // Check if invite already exists
    const existing = await this.prisma.roomSwapInvite.findFirst({
      where: {
        OR: [
          { senderId: sender.id, receiverId: targetStudentId },
          { senderId: targetStudentId, receiverId: sender.id },
        ],
        status: 'PENDING',
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A pending invite already exists between you.',
      );
    }

    return this.prisma.roomSwapInvite.create({
      data: {
        senderId: sender.id,
        receiverId: targetStudentId,
        status: 'PENDING',
      },
    });
  }

  async getMyInvites(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    const sent = await this.prisma.roomSwapInvite.findMany({
      where: { senderId: student.id },
      include: {
        receiver: {
          select: {
            name: true,
            uniqueId: true,
            allotment: { include: { room: true } },
          },
        },
      },
    });

    const received = await this.prisma.roomSwapInvite.findMany({
      where: { receiverId: student.id },
      include: {
        sender: {
          select: {
            name: true,
            uniqueId: true,
            allotment: { include: { room: true } },
          },
        },
      },
    });

    return { sent, received };
  }

  async respondToInvite(
    userId: string,
    inviteId: string,
    status: 'ACCEPTED' | 'REJECTED',
  ) {
    const invite = await this.prisma.roomSwapInvite.findUnique({
      where: { id: inviteId },
      include: {
        sender: { include: { allotment: true } },
        receiver: { include: { allotment: true } },
      },
    });

    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.receiver.userId !== userId)
      throw new BadRequestException('Not authorized to respond to this invite');
    if (invite.status !== 'PENDING')
      throw new BadRequestException('Invite is not pending');

    if (status === 'REJECTED') {
      return this.prisma.roomSwapInvite.update({
        where: { id: inviteId },
        data: { status: 'REJECTED' },
      });
    }

    // EXECUTE SWAP
    // 1. Verify both students still have their allotments
    if (!invite.sender.allotment || !invite.receiver.allotment) {
      throw new BadRequestException(
        'One or both students have lost their allotment. Swap failed.',
      );
    }

    const senderAllotmentId = invite.sender.allotment.id;
    const receiverAllotmentId = invite.receiver.allotment.id;
    const senderRoomId = invite.sender.allotment.roomId;
    const receiverRoomId = invite.receiver.allotment.roomId;

    return this.prisma.$transaction(async (tx) => {
      // Update Invite Status
      await tx.roomSwapInvite.update({
        where: { id: inviteId },
        data: { status: 'ACCEPTED' },
      });

      // Swap Rooms
      await tx.allotment.update({
        where: { id: senderAllotmentId },
        data: { roomId: receiverRoomId },
      });

      await tx.allotment.update({
        where: { id: receiverAllotmentId },
        data: { roomId: senderRoomId },
      });

      // Mark Swap Requests as Completed (Optional, or leave them active? Let's mark COMPLETED)
      // Or better, delete them so they don't show up in listings anymore
      await tx.roomSwapRequest.deleteMany({
        where: {
          studentId: { in: [invite.senderId, invite.receiverId] },
        },
      });

      // Cancel other pending invites involving these two
      await tx.roomSwapInvite.updateMany({
        where: {
          OR: [
            { senderId: invite.senderId, status: 'PENDING' },
            { receiverId: invite.senderId, status: 'PENDING' },
            { senderId: invite.receiverId, status: 'PENDING' },
            { receiverId: invite.receiverId, status: 'PENDING' },
          ],
          id: { not: inviteId },
        },
        data: { status: 'REJECTED' },
      });

      return { message: 'Swap successful' };
    });
  }
}
