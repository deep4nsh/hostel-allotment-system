import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, data: { category: string; description: string }) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        allotment: {
          include: {
            room: {
              include: {
                floor: {
                  include: { hostel: true }
                }
              }
            }
          }
        }
      }
    });

    if (!student) throw new BadRequestException('Student not found');

    const hostelId = student.allotment?.room?.floor?.hostelId;

    return this.prisma.maintenanceRequest.create({
      data: {
        studentId: student.id,
        hostelId: hostelId, // Optional: Can be null if not allotted, but usually complaints are for residents
        category: data.category,
        description: data.description,
        status: 'OPEN',
      }
    });
  }

  async findAllByStudent(userId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: { student: { userId } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllForWarden(userId: string) {
    // In Phase 4, we could filter by assigned hostel
    // For now, return all requests associated with hostels (ignoring general ones if needed)
    return this.prisma.maintenanceRequest.findMany({
      where: {
         hostelId: { not: null }
      },
      include: {
        student: true,
        hostel: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status }
    });
  }
}
