import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PaymentPurpose, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    private razorpay: Razorpay;

    constructor(private prisma: PrismaService) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID_HERE', // Using placeholder to force error if not set
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE',
        });
    }

    async createOrder(userId: string, purpose: 'REGISTRATION' | 'SEAT_BOOKING' | 'MESS_FEE' | 'HOSTEL_FEE' | 'ALLOTMENT_REQUEST') {
        let student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student) {
            // Auto-create student record if missing
            student = await this.prisma.student.create({
                data: {
                    userId,
                    name: '',
                    gender: 'OTHER',
                }
            });
        }

        let amount = 0;
        if (purpose === 'REGISTRATION') amount = 1000;
        else if (purpose === 'ALLOTMENT_REQUEST') amount = 1000;
        else if (purpose === 'SEAT_BOOKING') amount = 5000;
        else if (purpose === 'MESS_FEE') amount = 20000;
        else if (purpose === 'HOSTEL_FEE') {
            const allotment = await this.prisma.allotment.findUnique({
                where: { studentId: student.id },
                include: {
                    room: {
                        include: {
                            floor: {
                                include: {
                                    hostel: true
                                }
                            }
                        }
                    }
                },
            });

            if (!allotment) throw new BadRequestException('No room allotted to pay hostel fee');

            const capacity = allotment.room.capacity;
            const isAC = allotment.room.floor.hostel.isAC;

            if (isAC && capacity === 3) amount = 72000;
            else if (capacity === 1) amount = 60000;
            else if (capacity === 2) amount = 56000;
            else if (capacity === 3) amount = 52000;
            else amount = 52000;
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        try {
            const order = await this.razorpay.orders.create(options);

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
            console.error("Razorpay Order Creation Error:", error);
            throw new InternalServerErrorException(`Failed to create Razorpay order: ${error.error?.description || error.message}`);
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
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpaySignature) {
            const student = await this.prisma.student.findUnique({ where: { userId } });

            if (!student) {
                throw new BadRequestException('Student record not found for user');
            }

            // Ideally update existing PENDING payment instead of creating new one
            const existingPayment = await this.prisma.payment.findFirst({
                where: { txnRef: razorpayOrderId, status: 'PENDING' }
            });

            if (existingPayment) {
                return this.prisma.payment.update({
                    where: { id: existingPayment.id },
                    data: {
                        status: PaymentStatus.COMPLETED,
                        txnRef: razorpayPaymentId, // Update reference to payment ID? Or keep Order ID?
                        // Keeping order ID is safer for idempotency, but let's follow schema. 
                        // Schema has unique txnRef. If we update it to PaymentID, it's fine.
                    }
                });
            } else {
                // Create new if not found (fallback)
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
            }
        } else {
            throw new BadRequestException('Invalid payment signature');
        }
    }

    async mockVerify(userId: string, purpose: PaymentPurpose, amount: number) {
        // ... mock verify implementation (unchanged) ...
        let student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student) {
            student = await this.prisma.student.create({
                data: {
                    userId,
                    name: '',
                    gender: 'OTHER',
                }
            });
        }

        return this.prisma.payment.create({
            data: {
                studentId: student.id,
                purpose,
                status: PaymentStatus.COMPLETED,
                amount,
                txnRef: `mock_${Date.now()}`,
                gateway: 'MOCK',
            },
        });
    }
}
