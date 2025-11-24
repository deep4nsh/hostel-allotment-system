import { PrismaService } from '../prisma/prisma.service';
export declare class ImportsService {
    private prisma;
    constructor(prisma: PrismaService);
    importStudents(file: Express.Multer.File): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
}
