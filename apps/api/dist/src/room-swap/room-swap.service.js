"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSwapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RoomSwapService = class RoomSwapService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createListing(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { allotment: { include: { room: { include: { floor: { include: { hostel: true } } } } } } }
        });
        if (!student || !student.allotment || !student.allotment.isPossessed) {
            throw new common_1.BadRequestException('You must have a possessed room allotment to list for swap.');
        }
        const existingListing = await this.prisma.roomSwapRequest.findUnique({
            where: { studentId: student.id }
        });
        if (existingListing) {
            throw new common_1.BadRequestException('You already have an active swap listing.');
        }
        return this.prisma.roomSwapRequest.create({
            data: {
                studentId: student.id,
                hostelId: student.allotment.room.floor.hostel.id,
                status: 'ACTIVE'
            }
        });
    }
    async removeListing(userId) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        return this.prisma.roomSwapRequest.delete({
            where: { studentId: student.id }
        });
    }
    async getMyListing(userId) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        return this.prisma.roomSwapRequest.findUnique({
            where: { studentId: student.id }
        });
    }
    async getListings(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { allotment: { include: { room: { include: { floor: { include: { hostel: true } } } } } } }
        });
        if (!student || !student.allotment) {
            throw new common_1.BadRequestException('No allotment found.');
        }
        const hostelId = student.allotment.room.floor.hostel.id;
        return this.prisma.roomSwapRequest.findMany({
            where: {
                hostelId: hostelId,
                status: 'ACTIVE',
                studentId: { not: student.id }
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
                                        floor: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    async sendInvite(userId, targetStudentId) {
        const sender = await this.prisma.student.findUnique({ where: { userId } });
        if (!sender)
            throw new common_1.NotFoundException('Student not found');
        const existing = await this.prisma.roomSwapInvite.findFirst({
            where: {
                OR: [
                    { senderId: sender.id, receiverId: targetStudentId },
                    { senderId: targetStudentId, receiverId: sender.id }
                ],
                status: 'PENDING'
            }
        });
        if (existing) {
            throw new common_1.BadRequestException('A pending invite already exists between you.');
        }
        return this.prisma.roomSwapInvite.create({
            data: {
                senderId: sender.id,
                receiverId: targetStudentId,
                status: 'PENDING'
            }
        });
    }
    async getMyInvites(userId) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const sent = await this.prisma.roomSwapInvite.findMany({
            where: { senderId: student.id },
            include: {
                receiver: {
                    select: { name: true, uniqueId: true, allotment: { include: { room: true } } }
                }
            }
        });
        const received = await this.prisma.roomSwapInvite.findMany({
            where: { receiverId: student.id },
            include: {
                sender: {
                    select: { name: true, uniqueId: true, allotment: { include: { room: true } } }
                }
            }
        });
        return { sent, received };
    }
    async respondToInvite(userId, inviteId, status) {
        const invite = await this.prisma.roomSwapInvite.findUnique({
            where: { id: inviteId },
            include: {
                sender: { include: { allotment: true } },
                receiver: { include: { allotment: true } }
            }
        });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.receiver.userId !== userId)
            throw new common_1.BadRequestException('Not authorized to respond to this invite');
        if (invite.status !== 'PENDING')
            throw new common_1.BadRequestException('Invite is not pending');
        if (status === 'REJECTED') {
            return this.prisma.roomSwapInvite.update({
                where: { id: inviteId },
                data: { status: 'REJECTED' }
            });
        }
        if (!invite.sender.allotment || !invite.receiver.allotment) {
            throw new common_1.BadRequestException('One or both students have lost their allotment. Swap failed.');
        }
        const senderAllotmentId = invite.sender.allotment.id;
        const receiverAllotmentId = invite.receiver.allotment.id;
        const senderRoomId = invite.sender.allotment.roomId;
        const receiverRoomId = invite.receiver.allotment.roomId;
        return this.prisma.$transaction(async (tx) => {
            await tx.roomSwapInvite.update({
                where: { id: inviteId },
                data: { status: 'ACCEPTED' }
            });
            await tx.allotment.update({
                where: { id: senderAllotmentId },
                data: { roomId: receiverRoomId }
            });
            await tx.allotment.update({
                where: { id: receiverAllotmentId },
                data: { roomId: senderRoomId }
            });
            await tx.roomSwapRequest.deleteMany({
                where: {
                    studentId: { in: [invite.senderId, invite.receiverId] }
                }
            });
            await tx.roomSwapInvite.updateMany({
                where: {
                    OR: [
                        { senderId: invite.senderId, status: 'PENDING' },
                        { receiverId: invite.senderId, status: 'PENDING' },
                        { senderId: invite.receiverId, status: 'PENDING' },
                        { receiverId: invite.receiverId, status: 'PENDING' }
                    ],
                    id: { not: inviteId }
                },
                data: { status: 'REJECTED' }
            });
            return { message: 'Swap successful' };
        });
    }
};
exports.RoomSwapService = RoomSwapService;
exports.RoomSwapService = RoomSwapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomSwapService);
//# sourceMappingURL=room-swap.service.js.map