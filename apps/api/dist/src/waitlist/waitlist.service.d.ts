import { PrismaService } from '../prisma/prisma.service';
export declare class WaitlistService {
    private prisma;
    constructor(prisma: PrismaService);
    joinWaitlist(userId: string): Promise<{
        id: string;
        studentId: string;
        position: number;
        status: string;
        createdAt: Date;
    } | {
        message: string;
        entry: {
            id: string;
            studentId: string;
            position: number;
            status: string;
            createdAt: Date;
        };
    }>;
    getPriorityWaitlist(): Promise<({
        student: {
            id: string;
            name: string;
            uniqueId: string | null;
            program: import(".prisma/client").$Enums.Program | null;
            year: number | null;
            profileMeta: import(".prisma/client").Prisma.JsonValue;
            payments: {
                createdAt: Date;
            }[];
        };
    } & {
        id: string;
        studentId: string;
        position: number;
        status: string;
        createdAt: Date;
    })[]>;
    getWaitlistPosition(userId: string): Promise<{
        status: string;
        allotment?: undefined;
        position?: undefined;
    } | {
        status: string;
        allotment: {
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
        };
        position?: undefined;
    } | {
        position: number;
        status: string;
        allotment?: undefined;
    }>;
}
