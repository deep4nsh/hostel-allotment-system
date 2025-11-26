import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(userId: string): Promise<({
        user: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        allotment: ({
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
            createdAt: Date;
        }) | null;
    } & {
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: string | null;
        year: number | null;
        gender: import(".prisma/client").$Enums.Gender;
        category: import(".prisma/client").$Enums.Category;
        address: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    update(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: string | null;
        year: number | null;
        gender: import(".prisma/client").$Enums.Gender;
        category: import(".prisma/client").$Enums.Category;
        address: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    savePreferences(userId: string, preferences: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    updateProfile(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: string | null;
        year: number | null;
        gender: import(".prisma/client").$Enums.Gender;
        category: import(".prisma/client").$Enums.Category;
        address: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateUniqueId(userId: string): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: string | null;
        year: number | null;
        gender: import(".prisma/client").$Enums.Gender;
        category: import(".prisma/client").$Enums.Category;
        address: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
