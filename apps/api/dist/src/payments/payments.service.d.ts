import { PrismaService } from '../prisma/prisma.service';
import { PaymentPurpose } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    private razorpay;
    constructor(prisma: PrismaService);
    createOrder(userId: string, amount: number, purpose: PaymentPurpose): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, userId: string, purpose: PaymentPurpose, amount: number): Promise<{
        id: string;
        createdAt: Date;
        amount: number;
        purpose: import("@prisma/client").$Enums.PaymentPurpose;
        status: import("@prisma/client").$Enums.PaymentStatus;
        txnRef: string | null;
        gateway: string;
        studentId: string;
    }>;
}
