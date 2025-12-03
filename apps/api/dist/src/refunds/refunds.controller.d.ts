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
            program: import("@prisma/client").$Enums.Program | null;
            year: number | null;
            gender: import("@prisma/client").$Enums.Gender;
            category: import("@prisma/client").$Enums.Category;
            addressLine1: string | null;
            addressLine2: string | null;
            city: string | null;
            state: string | null;
            pincode: string | null;
            country: string | null;
            homeLat: number | null;
            homeLng: number | null;
            profileMeta: import("@prisma/client").Prisma.JsonValue | null;
            foodPreference: import("@prisma/client").$Enums.FoodPreference | null;
            guardianName: string | null;
            guardianPhone: string | null;
            guardianAddress: string | null;
            bankAccountNo: string | null;
            bankIfsc: string | null;
            bankAccountType: import("@prisma/client").$Enums.AccountType | null;
            bankHolderName: string | null;
            cgpa: number;
            roomTypePreference: string | null;
            floorPreference: string | null;
            isProfileFrozen: boolean;
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
