import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    uploadFile(userId: string, file: Express.Multer.File, type: 'PHOTO' | 'SIGNATURE' | 'ADMISSION_LETTER'): Promise<{
        message: string;
        path: string;
        type: "PHOTO" | "SIGNATURE" | "ADMISSION_LETTER";
        fileName: string;
    }>;
    processOcr(userId: string): Promise<{
        success: boolean;
        data: {
            name: string;
            rank: number;
            category: string;
            applicationNo: string;
        };
    }>;
}
