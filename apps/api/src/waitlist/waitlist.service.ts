import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitlistService {
    constructor(private prisma: PrismaService) { }

    async joinWaitlist(userId: string) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { payments: true },
        });

        if (!student) throw new Error('Student not found');

        // Check if already in waitlist
        const existingEntry = await this.prisma.waitlistEntry.findUnique({
            where: { studentId: student.id },
        });

        if (existingEntry) return { message: 'Already in waitlist', entry: existingEntry };

        // Verify Payment
        const payment = student.payments.find(
            (p: any) => p.purpose === 'ALLOTMENT_REQUEST' && p.status === 'COMPLETED',
        );

        if (!payment) throw new Error('Payment of ₹1000 not found');

        // Create Waitlist Entry
        // Position is initially count + 1, but will be dynamic based on distance
        const count = await this.prisma.waitlistEntry.count({ where: { status: 'ACTIVE' } });

        return this.prisma.waitlistEntry.create({
            data: {
                studentId: student.id,
                position: count + 1,
                status: 'ACTIVE',
            },
        });
    }

    async getPriorityWaitlist() {
        // Fetch all active waitlist entries with student details
        const entries = await this.prisma.waitlistEntry.findMany({
            where: { status: 'ACTIVE' },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        uniqueId: true,
                        program: true,
                        year: true,
                        profileMeta: true, // Contains distance
                        payments: {
                            where: { purpose: 'ALLOTMENT_REQUEST', status: 'COMPLETED' },
                            select: { createdAt: true } // Payment time for tie-breaking
                        }
                    }
                }
            }
        });

        // Sort by Distance (Desc) then Payment Time (Asc)
        return entries.sort((a, b) => {
            const distA = (a.student.profileMeta as any)?.distance || 0;
            const distB = (b.student.profileMeta as any)?.distance || 0;

            if (distB !== distA) {
                return distB - distA; // Higher distance first
            }

            // Tie-breaker: Earlier payment first
            const timeA = a.student.payments[0]?.createdAt.getTime() || 0;
            const timeB = b.student.payments[0]?.createdAt.getTime() || 0;
            return timeA - timeB;
        });
    }

    async getWaitlistPosition(userId: string) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student) return { status: 'NOT_REGISTERED' };

        const entry = await this.prisma.waitlistEntry.findUnique({
            where: { studentId: student.id },
        });

        if (!entry) return { status: 'NOT_IN_WAITLIST' };

        // Calculate dynamic position
        const list = await this.getPriorityWaitlist();
        const position = list.findIndex(e => e.studentId === student.id) + 1;

        return { position, status: entry.status };
    }
}
