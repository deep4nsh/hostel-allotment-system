import { PrismaService } from '../prisma/prisma.service';
export declare class WaitlistService {
    private prisma;
    constructor(prisma: PrismaService);
    joinWaitlist(userId: string): Promise<{
        id: string;
        studentId: string;
        position: number;
        status: string;
        createdAt: Date;
    } | {
        message: string;
        entry: {
            id: string;
            studentId: string;
            position: number;
            status: string;
            createdAt: Date;
        };
    }>;
    getPriorityWaitlist(): Promise<({
        student: {
            id: string;
            name: string;
            uniqueId: string | null;
            program: import(".prisma/client").$Enums.Program | null;
            year: number | null;
            profileMeta: import(".prisma/client").Prisma.JsonValue;
            payments: {
                createdAt: Date;
            }[];
        };
    } & {
        id: string;
        studentId: string;
        position: number;
        status: string;
        createdAt: Date;
    })[]>;
    getWaitlistPosition(userId: string): Promise<{
        status: string;
        position?: undefined;
    } | {
        position: number;
        status: string;
    }>;
}
