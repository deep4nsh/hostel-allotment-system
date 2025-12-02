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
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: {
            textSnippet: string;
            name: string | undefined;
            uniqueId: string | undefined;
            program: string | undefined;
            category: string | undefined;
            guardianName: string | undefined;
            guardianPhone: string | undefined;
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
    deleteDocument(req: any, type: string): Promise<{
        message: string;
    }>;
}
