import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadFile(req: any, file: Express.Multer.File, body: {
        type: 'PHOTO' | 'SIGNATURE' | 'ADMISSION_LETTER';
    }): Promise<{
        message: string;
        path: string;
        type: "PHOTO" | "SIGNATURE" | "ADMISSION_LETTER";
        fileName: string;
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
}
