import { StudentsService } from './students.service';
import { PdfService } from './pdf.service';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { UpdateStudentDto } from './dto/update-student.dto';
interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
        role: Role;
    };
}
export declare class StudentsController {
    private readonly studentsService;
    private readonly pdfService;
    constructor(studentsService: StudentsService, pdfService: PdfService);
    getProfile(req: RequestWithUser): Promise<{
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
        program: import("@prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        category: import("@prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client").Prisma.JsonValue | null;
        foodPreference: import("@prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import("@prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        cgpa: number;
        distance: number;
        roomTypePreference: string | null;
        floorPreference: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: RequestWithUser, updateStudentDto: UpdateStudentDto): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: import("@prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        category: import("@prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client").Prisma.JsonValue | null;
        foodPreference: import("@prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import("@prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        cgpa: number;
        distance: number;
        roomTypePreference: string | null;
        floorPreference: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateId(req: RequestWithUser): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: import("@prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        category: import("@prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client").Prisma.JsonValue | null;
        foodPreference: import("@prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import("@prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        cgpa: number;
        distance: number;
        roomTypePreference: string | null;
        floorPreference: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    calculateDistance(body: {
        addressLine1: string;
        city: string;
        state: string;
        pincode: string;
    }): Promise<{
        distance: number;
        coords: {
            lat: number;
            lng: number;
        };
    }>;
    requestEditAccess(req: RequestWithUser, body: {
        reason: string;
    }): Promise<{
        id: string;
        studentId: string;
        reason: string;
        status: import("@prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getEditRequests(req: RequestWithUser): Promise<{
        id: string;
        studentId: string;
        reason: string;
        status: import("@prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    downloadSlip(req: RequestWithUser, res: Response): Promise<void>;
    acknowledgePossession(req: RequestWithUser): Promise<{
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
    } | {
        message: string;
    }>;
    savePreferences(req: RequestWithUser, body: {
        preferences: any[];
    }): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getAllPendingEditRequests(): Promise<({
        student: {
            name: string;
            uniqueId: string | null;
            program: import("@prisma/client").$Enums.Program | null;
            year: number | null;
        };
    } & {
        id: string;
        studentId: string;
        reason: string;
        status: import("@prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    approveEditRequest(id: string): Promise<{
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: import("@prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        category: import("@prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client").Prisma.JsonValue | null;
        foodPreference: import("@prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import("@prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        cgpa: number;
        distance: number;
        roomTypePreference: string | null;
        floorPreference: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    rejectEditRequest(id: string): Promise<{
        id: string;
        studentId: string;
        reason: string;
        status: import("@prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    searchStudents(search?: string, hostelId?: string, roomNumber?: string, year?: string): Promise<({
        user: {
            email: string;
        };
        allotment: ({
            room: {
                floor: {
                    hostel: {
                        id: string;
                        name: string;
                        isAC: boolean;
                    };
                } & {
                    id: string;
                    hostelId: string;
                    number: number;
                    gender: import("@prisma/client").$Enums.Gender;
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
        documents: {
            kind: string;
            fileUrl: string;
        }[];
    } & {
        id: string;
        userId: string;
        uniqueId: string | null;
        name: string;
        phone: string | null;
        program: import("@prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        category: import("@prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client").Prisma.JsonValue | null;
        foodPreference: import("@prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import("@prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        cgpa: number;
        distance: number;
        roomTypePreference: string | null;
        floorPreference: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getStudentByUserId(userId: string): Promise<{
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
        program: import("@prisma/client").$Enums.Program | null;
        year: number | null;
        gender: import("@prisma/client").$Enums.Gender;
        category: import("@prisma/client").$Enums.Category;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        homeLat: number | null;
        homeLng: number | null;
        profileMeta: import("@prisma/client").Prisma.JsonValue | null;
        foodPreference: import("@prisma/client").$Enums.FoodPreference | null;
        guardianName: string | null;
        guardianPhone: string | null;
        guardianAddress: string | null;
        bankAccountNo: string | null;
        bankIfsc: string | null;
        bankAccountType: import("@prisma/client").$Enums.AccountType | null;
        bankHolderName: string | null;
        cgpa: number;
        distance: number;
        roomTypePreference: string | null;
        floorPreference: string | null;
        isProfileFrozen: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
