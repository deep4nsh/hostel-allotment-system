import { HostelsService } from './hostels.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
export declare class HostelsController {
    private readonly hostelsService;
    constructor(hostelsService: HostelsService);
    create(createHostelDto: CreateHostelDto): Promise<{
        floors: ({
            rooms: {
                number: string;
                id: string;
                capacity: number;
                yearAllowed: number[];
                occupancy: number;
                floorId: string;
            }[];
        } & {
            number: number;
            id: string;
            gender: import("@prisma/client").$Enums.Gender;
            hostelId: string;
        })[];
    } & {
        id: string;
        name: string;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        floors: ({
            rooms: {
                number: string;
                id: string;
                capacity: number;
                yearAllowed: number[];
                occupancy: number;
                floorId: string;
            }[];
        } & {
            number: number;
            id: string;
            gender: import("@prisma/client").$Enums.Gender;
            hostelId: string;
        })[];
    } & {
        id: string;
        name: string;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__HostelClient<({
        floors: ({
            rooms: {
                number: string;
                id: string;
                capacity: number;
                yearAllowed: number[];
                occupancy: number;
                floorId: string;
            }[];
        } & {
            number: number;
            id: string;
            gender: import("@prisma/client").$Enums.Gender;
            hostelId: string;
        })[];
    } & {
        id: string;
        name: string;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateHostelDto: UpdateHostelDto): import("@prisma/client").Prisma.Prisma__HostelClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__HostelClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
