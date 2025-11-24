import { PrismaService } from '../prisma/prisma.service';
export declare class WaitlistService {
    private prisma;
    constructor(prisma: PrismaService);
    getWaitlistPosition(userId: string): Promise<{
        position: null;
        status: string;
    } | {
        position: number;
        status: string;
    }>;
}
