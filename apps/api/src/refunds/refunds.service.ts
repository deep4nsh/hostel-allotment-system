import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';

@Injectable()
export class RefundsService {
    private razorpay: any;

    constructor(private prisma: PrismaService) {
        this.razorpay = new Razorpay({
            key_id: 'rzp_test_1DP5mmOlF5G5ag', // Test Key
            key_secret: 's42BN13v3y7S0Y4aoY4aoY4a', // Mock Secret
        });
    }

    async createRequest(userId: string, paymentId: string, reason: string) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student) throw new Error('Student not found');

        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment || payment.studentId !== student.id) throw new Error('Invalid payment');

        return this.prisma.refundRequest.create({
            data: {
                studentId: student.id,
                feeType: payment.purpose,
                amount: payment.amount,
                status: 'PENDING',
            },
        });
    }

    async findAll() {
        return this.prisma.refundRequest.findMany({
            include: { student: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async processRefund(requestId: string, decision: 'APPROVED' | 'REJECTED') {
        const request = await this.prisma.refundRequest.findUnique({ where: { id: requestId } });
        if (!request) throw new Error('Request not found');

        if (decision === 'REJECTED') {
            return this.prisma.refundRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' },
            });
        }

        // If APPROVED, trigger Razorpay Refund
        try {
            // In a real scenario, we would need the Razorpay Payment ID (pay_xxx) stored in the Payment record
            // For now, we mock the success
            console.log(`[MOCK] Processing refund for ${request.amount} via Razorpay`);

            return this.prisma.refundRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' },
            });
        } catch (error) {
            console.error('Refund failed', error);
            throw new Error('Refund processing failed');
        }
    }
}
