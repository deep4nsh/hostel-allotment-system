import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DistanceService } from '../utils/distance.service';
import { Prisma } from '@prisma/client';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private distanceService: DistanceService,
  ) { }

  async findOne(userId: string) {
    // Removed 'payments: true' to prevent errors if payment relation is empty or problematic
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true, role: true },
        },
        payments: true,
        refundRequests: true,
        fines: true,
        documents: true,
        allotment: {
          include: {
            room: {
              include: {
                floor: {
                  include: {
                    hostel: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      // Lazy creation for users who don't have a student record
      console.log(
        `Student record not found for user ${userId}.Creating default record.`,
      );

      // Verify user exists first
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const newStudent = await this.prisma.student.create({
        data: {
          userId,
          name: user.email.split('@')[0] || 'Student', // Fallback name from email
          gender: 'OTHER',
        },
        include: {
          user: {
            select: { email: true, role: true },
          },
        },
      });
      return newStudent;
    }

    return student;
  }

  async update(userId: string, data: Prisma.StudentUpdateInput) {
    return this.prisma.student.update({
      where: { userId },
      data,
    });
  }

  async savePreferences(userId: string, preferences: CreatePreferenceDto[]) {
    const student = await this.findOne(userId);
    if (!student) throw new NotFoundException('Student not found');

    // Delete existing preferences
    await this.prisma.preference.deleteMany({
      where: { studentId: student.id },
    });

    // Create new preferences
    return this.prisma.preference.createMany({
      data: preferences.map((pref) => ({
        studentId: student.id,
        floorId: pref.floorId,
        rank: pref.rank,
        year: student.year || 1, // Default to 1 if not set
      })),
    });
  }

  async updateProfile(userId: string, data: UpdateStudentDto) {
    console.log('Updating profile for user:', userId);
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    if (student.isProfileFrozen) {
      throw new ForbiddenException(
        'Profile is frozen. Request edit access to make changes.',
      );
    }

    const { distance, ...rest } = data;

    const updateData: Prisma.StudentUpdateInput = { ...rest };

    // Handle profileMeta fields (currently only distance)
    if (distance !== undefined) {
      const existingMeta = (student.profileMeta as Record<string, any>) || {};

      updateData.profileMeta = {
        ...existingMeta,
        distance,
      };
    }

    const updatedStudent = await this.prisma.student.update({
      where: { userId },
      data: updateData,
    });

    // Check if all mandatory fields are filled to freeze the profile
    const requiredFields = [
      'name',
      'uniqueId',
      'phone',
      'gender',
      'program',
      'year',
      'category',
      'addressLine1',
      'city',
      'state',
      'pincode',
      'country',
    ];

    const isComplete = requiredFields.every((field) => {
      const value = updatedStudent[field as keyof typeof updatedStudent];
      return value !== null && value !== undefined && value !== '';
    });

    if (isComplete) {
      await this.prisma.student.update({
        where: { id: student.id },
        data: { isProfileFrozen: true },
      });
      updatedStudent.isProfileFrozen = true;
    }

    return updatedStudent;
  }

  async requestEditAccess(userId: string, reason: string) {
    console.log('Requesting edit access for user:', userId);
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.profileEditRequest.create({
      data: {
        studentId: student.id,
        reason,
        status: 'PENDING',
      },
    });
  }

  async getAllPendingEditRequests() {
    return this.prisma.profileEditRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        student: {
          select: {
            name: true,
            uniqueId: true,
            program: true,
            year: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveEditRequest(requestId: string) {
    const request = await this.prisma.profileEditRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');

    // Update request status
    await this.prisma.profileEditRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    // Unfreeze profile
    return this.prisma.student.update({
      where: { id: request.studentId },
      data: { isProfileFrozen: false },
    });
  }

  async rejectEditRequest(requestId: string) {
    const request = await this.prisma.profileEditRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');

    return this.prisma.profileEditRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  async getEditRequests(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.profileEditRequest.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateUniqueId(userId: string) {
    const student = await this.findOne(userId);
    if (!student) throw new NotFoundException('Student not found');
    if (student.uniqueId) return student; // Already has ID

    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const uniqueId = `DTU - ${year} -${random} `;

    return this.prisma.student.update({
      where: { userId },
      data: { uniqueId },
    });
  }
  async calculateDistance(addressData: {
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  }) {
    const fullAddress = `${addressData.addressLine1}, ${addressData.city}, ${addressData.state}, ${addressData.pincode}, India`;
    console.log(`Calculating distance for: ${fullAddress}`);

    const coords = await this.distanceService.geocodeAddress(fullAddress);
    if (!coords) {
      throw new NotFoundException('Could not geocode address');
    }

    const distance = this.distanceService.calculateDistanceFromDTU(
      coords.lat,
      coords.lng,
    );
    return { distance, coords };
  }
  async searchStudents(params: {
    search?: string;
    hostelId?: string;
    roomNumber?: string;
    year?: number;
  }) {
    const { search, hostelId, roomNumber, year } = params;

    return this.prisma.student.findMany({
      where: {
        AND: [
          search
            ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { uniqueId: { contains: search, mode: 'insensitive' } },
                {
                  user: { email: { contains: search, mode: 'insensitive' } },
                },
              ],
            }
            : {},
          year ? { year: year } : {},
          hostelId || roomNumber
            ? {
              allotment: {
                room: {
                  ...(roomNumber ? { number: roomNumber } : {}),
                  ...(hostelId ? { floor: { hostelId } } : {}),
                },
              },
            }
            : {},
        ],
      },
      include: {
        user: { select: { email: true } },
        payments: true,
        refundRequests: true,
        allotment: {
          include: {
            room: {
              include: {
                floor: {
                  include: {
                    hostel: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 50,
    });
  }
}
