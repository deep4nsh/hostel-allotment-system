import { PrismaService } from '../prisma/prisma.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
export declare class HostelsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createHostelDto: CreateHostelDto): Promise<{
        floors: ({
            rooms: {
                number: string;
                id: string;
                floorId: string;
                capacity: number;
                occupancy: number;
                yearAllowed: number[];
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
                floorId: string;
                capacity: number;
                occupancy: number;
                yearAllowed: number[];
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
                floorId: string;
                capacity: number;
                occupancy: number;
                yearAllowed: number[];
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
