import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(userId: string): Promise<({
        user: {
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        uniqueId: string | null;
        phone: string | null;
        program: string | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        address: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string;
    }) | null>;
    update(userId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        uniqueId: string | null;
        phone: string | null;
        program: string | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        address: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string;
    }>;
}
