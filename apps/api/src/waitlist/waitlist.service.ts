import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitlistService {
    constructor(private prisma: PrismaService) { }

    async getWaitlistPosition(userId: string) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { payments: true },
        });

        if (!student) return { position: null, status: 'NOT_REGISTERED' };

        const seatBookingPayment = student.payments.find(
            (p: any) => p.purpose === 'SEAT_BOOKING' && p.status === 'COMPLETED',
        );

        if (!seatBookingPayment) return { position: null, status: 'FEE_NOT_PAID' };

        // Count students who paid before this student
        const count = await this.prisma.payment.count({
            where: {
                purpose: 'SEAT_BOOKING',
                status: 'COMPLETED',
                createdAt: {
                    lt: seatBookingPayment.createdAt,
                },
            },
        });

        return { position: count + 1, status: 'WAITLISTED' };
    }
}
