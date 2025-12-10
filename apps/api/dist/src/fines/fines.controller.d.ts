import { FinesService } from './fines.service';
export declare class FinesController {
    private readonly finesService;
    constructor(finesService: FinesService);
    imposeFine(req: any, body: any): Promise<{
        id: string;
        studentId: string;
        amount: number;
        reason: string;
        category: string;
        status: string;
        paymentId: string | null;
        issuedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMyFines(req: any): Promise<{
        id: string;
        studentId: string;
        amount: number;
        reason: string;
        category: string;
        status: string;
        paymentId: string | null;
        issuedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAllFines(): Promise<({
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
            cgpa: number;
            distance: number;
            roomTypePreference: string | null;
            floorPreference: string | null;
            isProfileFrozen: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        studentId: string;
        amount: number;
        reason: string;
        category: string;
        status: string;
        paymentId: string | null;
        issuedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
