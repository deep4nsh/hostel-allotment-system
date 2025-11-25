import { RefundsService } from './refunds.service';
export declare class RefundsController {
    private readonly refundsService;
    constructor(refundsService: RefundsService);
    createRequest(req: any, body: {
        paymentId: string;
        reason: string;
    }): Promise<{
        id: string;
        studentId: string;
        feeType: string;
        amount: number;
        status: string;
        createdAt: Date;
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
            userId: string;
            uniqueId: string | null;
            name: string;
            phone: string | null;
            program: string | null;
            year: number | null;
            gender: import("@prisma/client").$Enums.Gender;
            address: string | null;
            homeLat: number | null;
            homeLng: number | null;
            profileMeta: import("@prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        studentId: string;
        feeType: string;
        amount: number;
        status: string;
        createdAt: Date;
    })[]>;
    decideRefund(id: string, body: {
        decision: 'APPROVED' | 'REJECTED';
    }): Promise<{
        id: string;
        studentId: string;
        feeType: string;
        amount: number;
        status: string;
        createdAt: Date;
    }>;
}
