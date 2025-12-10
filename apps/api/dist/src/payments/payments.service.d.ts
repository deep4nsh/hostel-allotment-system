import { PrismaService } from '../prisma/prisma.service';
import { PaymentPurpose } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    private razorpay;
    constructor(prisma: PrismaService);
    createOrder(userId: string, purpose: 'REGISTRATION' | 'SEAT_BOOKING' | 'MESS_FEE' | 'HOSTEL_FEE' | 'ALLOTMENT_REQUEST' | 'FINE', fineId?: string): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, userId: string, purpose: PaymentPurpose, amount: number): Promise<{
        id: string;
        studentId: string;
        purpose: import("@prisma/client").$Enums.PaymentPurpose;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: number;
        txnRef: string | null;
        gateway: string;
        createdAt: Date;
    }>;
    mockVerify(userId: string, purpose: PaymentPurpose, amount: number): Promise<{
        id: string;
        studentId: string;
        purpose: import("@prisma/client").$Enums.PaymentPurpose;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: number;
        txnRef: string | null;
        gateway: string;
        createdAt: Date;
    }>;
    getPaymentForReceipt(paymentId: string, userId: string): Promise<{
        student: {
            name: string;
            uniqueId: string | null;
        };
    } & {
        id: string;
        studentId: string;
        purpose: import("@prisma/client").$Enums.PaymentPurpose;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: number;
        txnRef: string | null;
        gateway: string;
        createdAt: Date;
    }>;
}
