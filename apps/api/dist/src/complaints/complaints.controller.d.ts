import { ComplaintsService } from './complaints.service';
export declare class ComplaintsController {
    private readonly complaintsService;
    constructor(complaintsService: ComplaintsService);
    create(req: any, body: {
        category: string;
        description: string;
    }): Promise<{
        id: string;
        studentId: string;
        hostelId: string | null;
        category: string;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllMy(req: any): Promise<{
        id: string;
        studentId: string;
        hostelId: string | null;
        category: string;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllForWarden(req: any): Promise<({
        student: {
            id: string;
            userId: string;
            uniqueId: string | null;
            name: string;
            phone: string | null;
            program: import("@prisma/client").$Enums.Program | null;
            year: number | null;
            gender: import("@prisma/client").$Enums.Gender;
            category: import("@prisma/client").$Enums.Category;
            address: string | null;
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
            createdAt: Date;
            updatedAt: Date;
        };
        hostel: {
            id: string;
            name: string;
            isAC: boolean;
        } | null;
    } & {
        id: string;
        studentId: string;
        hostelId: string | null;
        category: string;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<{
        id: string;
        studentId: string;
        hostelId: string | null;
        category: string;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
