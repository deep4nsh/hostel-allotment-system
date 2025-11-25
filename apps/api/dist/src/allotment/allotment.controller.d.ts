import { AllotmentService } from './allotment.service';
export declare class AllotmentController {
    private readonly allotmentService;
    constructor(allotmentService: AllotmentService);
    triggerAllotment(hostelId: string): Promise<{
        totalEligible: number;
        allotted: number;
        details: {
            id: string;
            studentId: string;
            roomId: string;
            type: string;
            issueDate: Date;
            validTill: Date | null;
            letterUrl: string | null;
            createdAt: Date;
        }[];
    }>;
    getAllotments(hostelId: string): Promise<({
        student: {
            user: {
                id: string;
                email: string;
                password: string;
                role: import("@prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
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
            category: import("@prisma/client").$Enums.Category;
            address: string | null;
            homeLat: number | null;
            homeLng: number | null;
            profileMeta: import("@prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
        room: {
            floor: {
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
        createdAt: Date;
    })[]>;
}
