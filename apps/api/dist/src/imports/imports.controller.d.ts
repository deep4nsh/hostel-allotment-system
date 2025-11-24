import { ImportsService } from './imports.service';
export declare class ImportsController {
    private readonly importsService;
    constructor(importsService: ImportsService);
    uploadStudents(file: Express.Multer.File): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
}
