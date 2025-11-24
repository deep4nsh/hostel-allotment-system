import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AllotmentService {
    constructor(private prisma: PrismaService) { }

    async runAllotment(hostelId: string) {
        // 1. Fetch Hostel with Rooms
        const hostel = await this.prisma.hostel.findUnique({
            where: { id: hostelId },
            include: {
                floors: {
                    include: {
                        rooms: true,
                    },
                },
            },
        });

        if (!hostel) throw new Error('Hostel not found');

        // 2. Fetch Eligible Students (Paid Seat Booking Fee)
        const eligibleStudents = await this.prisma.student.findMany({
            where: {
                payments: {
                    some: {
                        purpose: 'SEAT_BOOKING',
                        status: 'COMPLETED',
                    },
                },
                allotment: null, // Not already allotted
            },
            include: {
                preferences: {
                    orderBy: { rank: 'asc' },
                },
                payments: {
                    where: { purpose: 'SEAT_BOOKING', status: 'COMPLETED' },
                },
            },
        });

        // 3. Sort Students
        // Priority: 1. Payment Timestamp (FCFS for now)
        eligibleStudents.sort((a, b) => {
            const paymentA = a.payments[0].createdAt.getTime();
            const paymentB = b.payments[0].createdAt.getTime();
            return paymentA - paymentB;
        });

        const allotments = [];

        // 4. Iterate and Assign
        for (const student of eligibleStudents) {
            let allottedRoom = null;

            // Try preferences first
            for (const pref of student.preferences) {
                const floor = hostel.floors.find((f) => f.id === pref.floorId);
                if (floor) {
                    const availableRoom = floor.rooms.find(
                        (r) => r.occupancy < r.capacity,
                    );
                    if (availableRoom) {
                        allottedRoom = availableRoom;
                        break;
                    }
                }
            }

            // If no preference matched, try any available room in the hostel
            if (!allottedRoom) {
                for (const floor of hostel.floors) {
                    const availableRoom = floor.rooms.find(
                        (r) => r.occupancy < r.capacity,
                    );
                    if (availableRoom) {
                        allottedRoom = availableRoom;
                        break;
                    }
                }
            }

            if (allottedRoom) {
                // Create Allotment
                const allotment = await this.prisma.allotment.create({
                    data: {
                        studentId: student.id,
                        roomId: allottedRoom.id,
                        type: 'REGULAR',
                    },
                });

                // Update Room Occupancy
                await this.prisma.room.update({
                    where: { id: allottedRoom.id },
                    data: { occupancy: { increment: 1 } },
                });

                // Update local object for next iteration
                allottedRoom.occupancy++;

                allotments.push(allotment);
            }
        }

        return {
            totalEligible: eligibleStudents.length,
            allotted: allotments.length,
            details: allotments,
        };
    }

    async getAllotments(hostelId: string) {
        return this.prisma.allotment.findMany({
            where: {
                room: {
                    floor: {
                        hostelId: hostelId,
                    },
                },
            },
            include: {
                student: {
                    include: { user: true }
                },
                room: {
                    include: { floor: true }
                },
            },
        });
    }
}
