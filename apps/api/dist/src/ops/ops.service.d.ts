import { PrismaService } from '../prisma/prisma.service';
export declare class OpsService {
    private prisma;
    constructor(prisma: PrismaService);
    getHealth(): Promise<{
        status: string;
        database: string;
        timestamp: Date;
        error?: undefined;
    } | {
        status: string;
        database: string;
        error: any;
        timestamp?: undefined;
    }>;
    triggerBackup(): Promise<{
        message: string;
        path: string;
    }>;
    getAnalytics(): Promise<{
        totalStudents: number;
        totalUsers: number;
        totalRevenue: any;
        allotments: number;
        refundRequests: number;
    }>;
}
