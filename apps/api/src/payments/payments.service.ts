import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PaymentPurpose, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    private razorpay: Razorpay;

    constructor(private prisma: PrismaService) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'test_key_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_key_secret',
        });
    }

    async createOrder(userId: string, amount: number, purpose: 'REGISTRATION' | 'SEAT_BOOKING' | 'MESS_FEE') {
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        try {
            const order = await this.razorpay.orders.create(options);

            // Save initial payment record
            const student = await this.prisma.student.findUnique({ where: { userId } });
            if (student) {
                await this.prisma.payment.create({
                    data: {
                        studentId: student.id,
                        amount: amount,
                        purpose: purpose,
                        status: 'PENDING',
                        txnRef: order.id,
                        gateway: 'RAZORPAY'
                    }
                });
            }

            return order;
        } catch (error) {
            throw new Error(error);
        }
    }
    async verifyPayment(
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
        userId: string,
        purpose: PaymentPurpose,
        amount: number
    ) {
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_key_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpaySignature) {
            // Payment is successful
            // Create or update Payment record
            const student = await this.prisma.student.findUnique({ where: { userId } });

            if (!student) {
                // If student doesn't exist yet (Registration fee), we might need to handle this differently
                // But usually Student record is created AFTER registration fee? 
                // Or maybe we create Student record first with 'PENDING_REGISTRATION' status?
                // For M1, let's assume we just record the payment linked to the User if Student not found, 
                // but our schema links Payment to Student.
                // So we MUST create a Student record before Payment?
                // Let's assume the flow: Register User -> Pay Fee -> Create Student Profile.
                // But Payment model needs studentId.
                // FIX: We should probably link Payment to User initially or create a temporary Student record.
                // For now, let's assume we create the Student record immediately upon User registration but mark it as 'INACTIVE' or similar?
                // Or we change Payment model to link to User?
                // Let's stick to the plan: User registers -> User exists.
                // We need to fetch the Student associated with the User.
                // If no student exists, we can't create a Payment record with current schema.
                // TODO: Update Schema to allow Payment to be linked to User OR ensure Student exists.
                // Let's assume Student is created on Register (as per M0 schema, User has Student?).
                // Actually M0 schema: User -> Student (One-to-One).
                // We should create the Student record when User registers.
                throw new BadRequestException('Student record not found for user');
            }

            return this.prisma.payment.create({
                data: {
                    studentId: student.id,
                    purpose,
                    status: PaymentStatus.COMPLETED,
                    amount,
                    txnRef: razorpayPaymentId,
                    gateway: 'RAZORPAY',
                },
            });
        } else {
            throw new BadRequestException('Invalid payment signature');
        }
    }
}
