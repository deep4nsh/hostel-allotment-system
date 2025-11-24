import { PrismaService } from '../prisma/prisma.service';
export declare class RefundsService {
    private prisma;
    private razorpay;
    constructor(prisma: PrismaService);
    createRequest(userId: string, paymentId: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        amount: number;
        status: string;
        studentId: string;
        feeType: string;
    }>;
    findAll(): Promise<({
        student: {
            user: {
                id: string;
                email: string;
                password: string;
                role: import("@prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            uniqueId: string | null;
            phone: string | null;
            program: string | null;
            year: number | null;
            gender: import("@prisma/client").$Enums.Gender;
            address: string | null;
            homeLat: number | null;
            homeLng: number | null;
            profileMeta: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        amount: number;
        status: string;
        studentId: string;
        feeType: string;
    })[]>;
    processRefund(requestId: string, decision: 'APPROVED' | 'REJECTED'): Promise<{
        id: string;
        createdAt: Date;
        amount: number;
        status: string;
        studentId: string;
        feeType: string;
    }>;
}
