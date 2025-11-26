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
