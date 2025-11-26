import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    uploadFile(userId: string, file: Express.Multer.File, type: string): Promise<{
        message: string;
        document: {
            id: string;
            studentId: string;
            kind: string;
            fileUrl: string;
            ocrFields: import(".prisma/client").Prisma.JsonValue | null;
            uploadedAt: Date;
        };
    }>;
    findAllByStudent(userId: string): Promise<{
        id: string;
        studentId: string;
        kind: string;
        fileUrl: string;
        ocrFields: import(".prisma/client").Prisma.JsonValue | null;
        uploadedAt: Date;
    }[]>;
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
