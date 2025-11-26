import { PrismaService } from '../prisma/prisma.service';
export declare class ComplaintsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        category: string;
        description: string;
    }): Promise<{
        id: string;
        studentId: string;
        hostelId: string | null;
        category: string;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllByStudent(userId: string): Promise<{
        id: string;
        studentId: string;
        hostelId: string | null;
        category: string;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllForWarden(userId: string): Promise<({
        student: {
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
        };
        hostel: {
            id: string;
            name: string;
            isAC: boolean;
        } | null;
    } & {
        id: string;
        studentId: string;
        hostelId: string | null;
        category: string;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        studentId: string;
        hostelId: string | null;
        category: string;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
