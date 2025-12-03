import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async findOne(userId: string) {
        // Removed 'payments: true' to prevent errors if payment relation is empty or problematic
        return this.prisma.student.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { email: true, role: true }
                },
                // payments: true, // Temporarily disabled to avoid startup errors
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
        });
    }

    async update(userId: string, data: any) {
        return this.prisma.student.update({
            where: { userId },
            data,
        });
    }

    async savePreferences(userId: string, preferences: any[]) {
        const student = await this.findOne(userId);
        if (!student) throw new Error('Student not found');

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

    async updateProfile(userId: string, data: any) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student) throw new Error('Student not found');

        if (student.isProfileFrozen) {
            throw new ForbiddenException('Profile is frozen. Request edit access to make changes.');
        }

        const { cgpa, distance, ...rest } = data;

        const updateData: any = { ...rest };

        if (cgpa !== undefined || distance !== undefined) {
            const existingMeta = (student.profileMeta as any) || {};

            updateData.profileMeta = {
                ...existingMeta,
                ...(cgpa !== undefined && { cgpa }),
                ...(distance !== undefined && { distance }),
            };
        }

        const updatedStudent = await this.prisma.student.update({
            where: { userId },
            data: updateData,
        });

        // Check if all mandatory fields are filled to freeze the profile
        const mandatoryFields = [
            'name', 'uniqueId', 'phone', 'gender', 'program', 'year', 'category',
            'addressLine1', 'city', 'state', 'pincode', 'country'
        ];

        const isComplete = mandatoryFields.every(field => {
            const value = updatedStudent[field];
            return value !== null && value !== undefined && value !== '';
        });

        if (isComplete) {
            await this.prisma.student.update({
                where: { id: student.id },
                data: { isProfileFrozen: true }
            });
        }

        return updatedStudent;
    }

    async requestEditAccess(userId: string, reason: string) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student) throw new Error('Student not found');

        return this.prisma.profileEditRequest.create({
            data: {
                studentId: student.id,
                reason,
                status: 'PENDING'
            }
        });
    }

    async generateUniqueId(userId: string) {
        const student = await this.findOne(userId);
        if (!student) throw new Error('Student not found');
        if (student.uniqueId) return student; // Already has ID

        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const uniqueId = `DTU-${year}-${random}`;

        return this.prisma.student.update({
            where: { userId },
            data: { uniqueId },
        });
    }
}
