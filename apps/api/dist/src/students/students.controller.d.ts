import { StudentsService } from './students.service';
import { PdfService } from './pdf.service';
import { Response } from 'express';
export declare class StudentsController {
    private readonly studentsService;
    private readonly pdfService;
    constructor(studentsService: StudentsService, pdfService: PdfService);
    getProfile(req: any): Promise<({
        user: {
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: string | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        address: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateProfile(req: any, data: any): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: string | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        address: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    downloadSlip(req: any, res: Response): Promise<void>;
}
