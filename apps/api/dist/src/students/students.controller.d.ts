import { StudentsService } from './students.service';
import { PdfService } from './pdf.service';
import type { Response } from 'express';
import { UpdateStudentDto } from './dto/update-student.dto';
export declare class StudentsController {
    private readonly studentsService;
    private readonly pdfService;
    constructor(studentsService: StudentsService, pdfService: PdfService);
    getProfile(req: any): Promise<{
        user: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        allotment: ({
            room: {
                floor: {
                    id: string;
                    hostelId: string;
                    number: number;
                    gender: import(".prisma/client").$Enums.Gender;
                };
            } & {
                id: string;
                floorId: string;
                number: string;
                capacity: number;
                occupancy: number;
                yearAllowed: number[];
            };
        } & {
            id: string;
            studentId: string;
            roomId: string;
            type: string;
            issueDate: Date;
            validTill: Date | null;
            letterUrl: string | null;
            isPossessed: boolean;
            possessionDate: Date | null;
            createdAt: Date;
        }) | null;
    } & {
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: import(".prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import(".prisma/client").$Enums.Gender;
        category: import(".prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import(".prisma/client").Prisma.JsonValue | null;
        foodPreference: import(".prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import(".prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: any, updateStudentDto: UpdateStudentDto): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: import(".prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import(".prisma/client").$Enums.Gender;
        category: import(".prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import(".prisma/client").Prisma.JsonValue | null;
        foodPreference: import(".prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import(".prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateId(req: any): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: import(".prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import(".prisma/client").$Enums.Gender;
        category: import(".prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import(".prisma/client").Prisma.JsonValue | null;
        foodPreference: import(".prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import(".prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    requestEditAccess(req: any, body: {
        reason: string;
    }): Promise<{
        id: string;
        studentId: string;
        reason: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    downloadSlip(req: any, res: Response): Promise<void>;
    savePreferences(req: any, body: {
        preferences: any[];
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
