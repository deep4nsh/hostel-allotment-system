import { RequestsService } from './requests.service';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    requestChange(req: any, body: {
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
    requestSurrender(req: any, body: {
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
    confirmPossession(req: any): Promise<{
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
    getMyRequests(req: any): Promise<{
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
            allotment: ({
                room: {
                    floor: {
                        hostel: {
                            id: string;
                            name: string;
                            isAC: boolean;
                        };
                    } & {
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
            }) | null;
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
        preferredHostel: {
            id: string;
            name: string;
            isAC: boolean;
        } | null;
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
    updateChangeStatus(id: string, body: {
        status: string;
        comment?: string;
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
        allotmentId: string;
        reason: string;
        status: string;
        clearanceUrl: string | null;
        adminComment: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateSurrenderStatus(id: string, body: {
        status: string;
        comment?: string;
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
}
