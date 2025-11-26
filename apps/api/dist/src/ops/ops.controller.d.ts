import { OpsService } from './ops.service';
export declare class OpsController {
    private readonly opsService;
    constructor(opsService: OpsService);
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
        overview: {
            totalStudents: number;
            allotmentsCount: number;
            totalRevenue: number;
            pendingRefunds: number;
        };
        hostelStats: {
            name: string;
            capacity: number;
            occupancy: number;
            fillRate: number;
        }[];
        demographics: {
            byCategory: {
                category: import("@prisma/client").$Enums.Category;
                count: number;
            }[];
            byYear: {
                year: string | number;
                count: number;
            }[];
        };
    }>;
}
