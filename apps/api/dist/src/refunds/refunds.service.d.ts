import { PrismaService } from '../prisma/prisma.service';
export declare class RefundsService {
    private prisma;
    private razorpay;
    constructor(prisma: PrismaService);
    createRequest(userId: string, paymentId: string, reason: string): Promise<{
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
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            userId: string;
            uniqueId: string | null;
            name: string;
            phone: string | null;
            program: import(".prisma/client").$Enums.Program | null;
            year: number | null;
            gender: import(".prisma/client").$Enums.Gender;
            category: import(".prisma/client").$Enums.Category;
            addressLine1: string | null;
            addressLine2: string | null;
            city: string | null;
            state: string | null;
            pincode: string | null;
            country: string | null;
            homeLat: number | null;
            homeLng: number | null;
            profileMeta: import(".prisma/client").Prisma.JsonValue | null;
            foodPreference: import(".prisma/client").$Enums.FoodPreference | null;
            guardianName: string | null;
            guardianPhone: string | null;
            guardianAddress: string | null;
            bankAccountNo: string | null;
            bankIfsc: string | null;
            bankAccountType: import(".prisma/client").$Enums.AccountType | null;
            bankHolderName: string | null;
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
    processRefund(requestId: string, decision: 'APPROVED' | 'REJECTED'): Promise<{
        id: string;
        studentId: string;
        feeType: string;
        amount: number;
        status: string;
        createdAt: Date;
    }>;
}
