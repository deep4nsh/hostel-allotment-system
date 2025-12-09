import { RoomSwapService } from './room-swap.service';
export declare class RoomSwapController {
    private readonly roomSwapService;
    constructor(roomSwapService: RoomSwapService);
    createListing(req: any): Promise<{
        id: string;
        studentId: string;
        hostelId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeListing(req: any): Promise<{
        id: string;
        studentId: string;
        hostelId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMyListing(req: any): Promise<{
        id: string;
        studentId: string;
        hostelId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getListings(req: any): Promise<({
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
    sendInvite(req: any, body: {
        targetStudentId: string;
    }): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getInvites(req: any): Promise<{
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
    respondToInvite(req: any, id: string, body: {
        status: 'ACCEPTED' | 'REJECTED';
    }): Promise<{
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
