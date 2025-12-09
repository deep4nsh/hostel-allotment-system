import { PrismaService } from '../prisma/prisma.service';
export declare class RoomSwapService {
    private prisma;
    constructor(prisma: PrismaService);
    createListing(userId: string): Promise<{
        id: string;
        studentId: string;
        hostelId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeListing(userId: string): Promise<{
        id: string;
        studentId: string;
        hostelId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMyListing(userId: string): Promise<{
        id: string;
        studentId: string;
        hostelId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getListings(userId: string): Promise<({
        student: {
            name: string;
            uniqueId: string | null;
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
        };
    } & {
        id: string;
        studentId: string;
        hostelId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    sendInvite(userId: string, targetStudentId: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMyInvites(userId: string): Promise<{
        sent: ({
            receiver: {
                name: string;
                uniqueId: string | null;
                allotment: ({
                    room: {
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
            };
        } & {
            id: string;
            senderId: string;
            receiverId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        received: ({
            sender: {
                name: string;
                uniqueId: string | null;
                allotment: ({
                    room: {
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
            };
        } & {
            id: string;
            senderId: string;
            receiverId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    respondToInvite(userId: string, inviteId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | {
        message: string;
    }>;
}
