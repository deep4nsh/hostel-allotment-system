import { PaymentsService } from './payments.service';
import { PaymentPurpose } from '@prisma/client';
import { PdfService } from '../students/pdf.service';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly pdfService;
    constructor(paymentsService: PaymentsService, pdfService: PdfService);
    getReceipt(req: any, id: string, res: any): Promise<void>;
    createOrder(req: any, body: {
        purpose: 'REGISTRATION' | 'SEAT_BOOKING' | 'MESS_FEE' | 'HOSTEL_FEE' | 'ALLOTMENT_REQUEST';
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
    mockVerify(req: any, body: {
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
