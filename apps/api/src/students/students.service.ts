import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async findOne(userId: string) {
        return this.prisma.student.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { email: true, role: true }
                },
                payments: true,
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
        return this.prisma.student.update({
            where: { userId },
            data,
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
