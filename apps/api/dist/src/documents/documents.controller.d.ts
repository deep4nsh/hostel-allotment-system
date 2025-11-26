import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadFile(req: any, file: Express.Multer.File, body: {
        type: 'PHOTO' | 'SIGNATURE' | 'ADMISSION_LETTER' | 'UNDERTAKING' | 'MEDICAL_CERTIFICATE';
    }): Promise<{
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
    triggerOcr(req: any): Promise<{
        success: boolean;
        data: {
            name: string;
            rank: number;
            category: string;
            applicationNo: string;
        };
    }>;
    getMyDocuments(req: any): Promise<{
        id: string;
        studentId: string;
        kind: string;
        fileUrl: string;
        ocrFields: import(".prisma/client").Prisma.JsonValue | null;
        uploadedAt: Date;
    }[]>;
}
