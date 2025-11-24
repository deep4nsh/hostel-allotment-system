import { AllotmentService } from './allotment.service';
export declare class AllotmentController {
    private readonly allotmentService;
    constructor(allotmentService: AllotmentService);
    triggerAllotment(hostelId: string): Promise<{
        totalEligible: number;
        allotted: number;
        details: {
            id: string;
            createdAt: Date;
            studentId: string;
            roomId: string;
            type: string;
            issueDate: Date;
            validTill: Date | null;
            letterUrl: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            uniqueId: string | null;
            phone: string | null;
            program: string | null;
            year: number | null;
            gender: import("@prisma/client").$Enums.Gender;
            address: string | null;
            homeLat: number | null;
            homeLng: number | null;
            profileMeta: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
        };
        room: {
            floor: {
                number: number;
                id: string;
                gender: import("@prisma/client").$Enums.Gender;
                hostelId: string;
            };
        } & {
            number: string;
            id: string;
            floorId: string;
            capacity: number;
            occupancy: number;
            yearAllowed: number[];
        };
    } & {
        id: string;
        createdAt: Date;
        studentId: string;
        roomId: string;
        type: string;
        issueDate: Date;
        validTill: Date | null;
        letterUrl: string | null;
    })[]>;
}
