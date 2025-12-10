import { HostelsService } from './hostels.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
export declare class HostelsController {
    private readonly hostelsService;
    constructor(hostelsService: HostelsService);
    create(createHostelDto: CreateHostelDto): Promise<{
        floors: ({
            rooms: {
                id: string;
                floorId: string;
                number: string;
                capacity: number;
                occupancy: number;
                yearAllowed: number[];
            }[];
        } & {
            id: string;
            hostelId: string;
            number: number;
            gender: import("@prisma/client").$Enums.Gender;
        })[];
    } & {
        id: string;
        name: string;
        isAC: boolean;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        floors: ({
            rooms: {
                id: string;
                floorId: string;
                number: string;
                capacity: number;
                occupancy: number;
                yearAllowed: number[];
            }[];
        } & {
            id: string;
            hostelId: string;
            number: number;
            gender: import("@prisma/client").$Enums.Gender;
        })[];
    } & {
        id: string;
        name: string;
        isAC: boolean;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__HostelClient<({
        floors: ({
            rooms: ({
                allotments: ({
                    student: {
                        user: {
                            email: string;
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
                    roomId: string;
                    type: string;
                    issueDate: Date;
                    validTill: Date | null;
                    letterUrl: string | null;
                    isPossessed: boolean;
                    possessionDate: Date | null;
                    createdAt: Date;
                })[];
            } & {
                id: string;
                floorId: string;
                number: string;
                capacity: number;
                occupancy: number;
                yearAllowed: number[];
            })[];
        } & {
            id: string;
            hostelId: string;
            number: number;
            gender: import("@prisma/client").$Enums.Gender;
        })[];
    } & {
        id: string;
        name: string;
        isAC: boolean;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateHostelDto: UpdateHostelDto): import("@prisma/client").Prisma.Prisma__HostelClient<{
        id: string;
        name: string;
        isAC: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__HostelClient<{
        id: string;
        name: string;
        isAC: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
