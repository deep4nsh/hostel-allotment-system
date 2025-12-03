import { PrismaService } from '../prisma/prisma.service';
export declare class RequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    createChangeRequest(studentId: string, data: {
        reason: string;
        preferredHostelId?: string;
    }): Promise<{
        id: string;
        studentId: string;
        currentRoomId: string;
        preferredHostelId: string | null;
        reason: string;
        status: string;
        adminComment: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createSurrenderRequest(studentId: string, data: {
        reason: string;
        clearanceUrl?: string;
    }): Promise<{
        id: string;
        studentId: string;
        allotmentId: string;
        reason: string;
        status: string;
        clearanceUrl: string | null;
        adminComment: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    confirmPossession(studentId: string): Promise<{
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
    }>;
    getMyRequests(studentId: string): Promise<{
        changeRequests: {
            id: string;
            studentId: string;
            currentRoomId: string;
            preferredHostelId: string | null;
            reason: string;
            status: string;
            adminComment: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        surrenderRequests: {
            id: string;
            studentId: string;
            allotmentId: string;
            reason: string;
            status: string;
            clearanceUrl: string | null;
            adminComment: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        swapRequests: {
            id: string;
            studentId: string;
            currentHostelId: string;
            targetHostelId: string;
            reason: string;
            status: string;
            adminComment: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    getAllChangeRequests(): Promise<({
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
            isProfileFrozen: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        studentId: string;
        currentRoomId: string;
        preferredHostelId: string | null;
        reason: string;
        status: string;
        adminComment: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateChangeRequestStatus(id: string, status: string, comment?: string): Promise<{
        id: string;
        studentId: string;
        currentRoomId: string;
        preferredHostelId: string | null;
        reason: string;
        status: string;
        adminComment: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllSurrenderRequests(): Promise<({
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
            isProfileFrozen: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        studentId: string;
        allotmentId: string;
        reason: string;
        status: string;
        clearanceUrl: string | null;
        adminComment: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateSurrenderRequestStatus(id: string, status: string, comment?: string): Promise<{
        id: string;
        studentId: string;
        allotmentId: string;
        reason: string;
        status: string;
        clearanceUrl: string | null;
        adminComment: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
