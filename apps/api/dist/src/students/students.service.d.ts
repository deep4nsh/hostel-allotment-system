import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(userId: string): Promise<({
        user: {
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        allotment: ({
            room: {
                floor: {
                    number: number;
                    id: string;
                    gender: import("@prisma/client").$Enums.Gender;
                    hostelId: string;
                };
            } & {
                number: string;
                id: string;
                floorId: string;
                capacity: number;
                occupancy: number;
                yearAllowed: number[];
            };
        } & {
            id: string;
            createdAt: Date;
            studentId: string;
            roomId: string;
            type: string;
            issueDate: Date;
            validTill: Date | null;
            letterUrl: string | null;
        }) | null;
        payments: {
            id: string;
            createdAt: Date;
            amount: number;
            purpose: import("@prisma/client").$Enums.PaymentPurpose;
            status: import("@prisma/client").$Enums.PaymentStatus;
            txnRef: string | null;
            gateway: string;
            studentId: string;
        }[];
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
    savePreferences(userId: string, preferences: any[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    updateProfile(userId: string, data: any): Promise<{
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
    generateUniqueId(userId: string): Promise<{
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
