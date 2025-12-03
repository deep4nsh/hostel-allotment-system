import { PrismaService } from '../prisma/prisma.service';
export declare class AllotmentService {
    private prisma;
    constructor(prisma: PrismaService);
    runAllotment(hostelId: string, targetProgramGroup?: string): Promise<{
        totalEligible: number;
        allotted: number;
        waitlisted: number;
        details: {
            id: string;
            studentId: string;
            roomId: string;
            type: string;
            issueDate: Date;
            validTill: Date | null;
            letterUrl: string | null;
            isPossessed: boolean;
            possessionDate: Date | null;
            createdAt: Date;
        }[];
    }>;
    getAllotments(hostelId: string): Promise<({
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
            address: string | null;
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
        room: {
            floor: {
                id: string;
                hostelId: string;
                number: number;
                gender: import(".prisma/client").$Enums.Gender;
            };
        } & {
            id: string;
            floorId: string;
            number: string;
            capacity: number;
            occupancy: number;
            yearAllowed: number[];
        };
    } & {
        id: string;
        studentId: string;
        roomId: string;
        type: string;
        issueDate: Date;
        validTill: Date | null;
        letterUrl: string | null;
        isPossessed: boolean;
        possessionDate: Date | null;
        createdAt: Date;
    })[]>;
}
