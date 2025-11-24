import { RefundsService } from './refunds.service';
export declare class RefundsController {
    private readonly refundsService;
    constructor(refundsService: RefundsService);
    createRequest(req: any, body: {
        paymentId: string;
        reason: string;
    }): Promise<{
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
    decideRefund(id: string, body: {
        decision: 'APPROVED' | 'REJECTED';
    }): Promise<{
        id: string;
        createdAt: Date;
        amount: number;
        status: string;
        studentId: string;
        feeType: string;
    }>;
}
