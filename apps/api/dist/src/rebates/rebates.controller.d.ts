import { RebatesService } from './rebates.service';
import { CreateRebateDto } from './dto/create-rebate.dto';
export declare class RebatesController {
    private readonly rebatesService;
    constructor(rebatesService: RebatesService);
    create(req: any, createRebateDto: CreateRebateDto): Promise<{
        id: string;
        studentId: string;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        documentUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllMy(req: any): Promise<{
        id: string;
        studentId: string;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        documentUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllPending(req: any): Promise<({
        student: {
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
                        gender: import("@prisma/client").$Enums.Gender;
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
            isProfileFrozen: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        studentId: string;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        documentUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateStatus(id: string, body: {
        status: 'APPROVED' | 'REJECTED';
    }): Promise<{
        id: string;
        studentId: string;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        documentUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
