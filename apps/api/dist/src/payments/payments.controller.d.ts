import { PaymentsService } from './payments.service';
import { PaymentPurpose } from '@prisma/client';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createOrder(req: any, body: {
        amount: number;
        purpose: PaymentPurpose;
    }): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    verifyPayment(req: any, body: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        purpose: PaymentPurpose;
        amount: number;
    }): Promise<{
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
