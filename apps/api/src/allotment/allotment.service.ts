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
        // Priority: 1. Category (PH > NRI > OUTSIDE_DELHI > DELHI)
        //           2. Distance (Desc)
        //           3. Payment Timestamp (FCFS)
        const categoryPriority: Record<string, number> = { PH: 0, NRI: 1, OUTSIDE_DELHI: 2, DELHI: 3 };

        eligibleStudents.sort((a: any, b: any) => {
            const isSeniorA = (a.year || 1) > 1;
            const isSeniorB = (b.year || 1) > 1;

            // Separate logic for First Year vs Seniors
            // But if we are mixing them in one allotment run, we need a global priority.
            // Usually First Years have separate hostels or blocks.
            // Assuming this runAllotment is for a specific hostel which is either for 1st year or seniors.
            // Let's check the hostel rooms' allowed years.
            // For now, we apply the rules based on the student's year.

            if (isSeniorA !== isSeniorB) {
                // If mixed, maybe prioritize seniors? Or just treat them by their respective category rules.
                // Let's assume we sort by year first if we want to group them, but the prompt implies specific rules per group.
                // Let's stick to the specific rules.
            }

            // 1. PH Category (Top priority for both)
            if (a.category === 'PH' && b.category !== 'PH') return -1;
            if (b.category === 'PH' && a.category !== 'PH') return 1;

            if (!isSeniorA && !isSeniorB) {
                // --- First Year Rules ---
                // 1. Outside Delhi
                // 2. NRI (treated as Outside Delhi, but maybe higher? Bulletin says "NRI students will be treated as Outside Delhi Category")
                // Bulletin: "First preference... Outside Delhi... PH... NRI treated as Outside Delhi"
                // Actually:
                // a. Outside Delhi (First preference)
                // b. PH (May be provided) -> usually PH is top.
                // c. NRI -> Treated as Outside Delhi.
                // d. NRI with Delhi address -> Delhi Category.
                // Let's stick to: PH > Outside Delhi (inc NRI) > Delhi

                const catA = categoryPriority[a.category] ?? 3;
                const catB = categoryPriority[b.category] ?? 3;
                if (catA !== catB) return catA - catB;

                // Within Delhi:
                // f. Serious medical issues
                // g. Parents transferred
                // h. Distance
                const metaA = a.profileMeta || {};
                const metaB = b.profileMeta || {};

                if (a.category === 'DELHI') {
                    if (metaA.medicalIssue && !metaB.medicalIssue) return -1;
                    if (metaB.medicalIssue && !metaA.medicalIssue) return 1;

                    // Distance (Desc)
                    // Assuming distance is in profileMeta for now as discussed
                    const distA = metaA.distance || 0;
                    const distB = metaB.distance || 0;
                    if (distA !== distB) return distB - distA;
                }

            } else {
                // --- Senior Rules ---
                // a. Backlog check (already filtered? No, we need to filter or de-prioritize)
                // Bulletin: "having no back log"
                const metaA = a.profileMeta || {};
                const metaB = b.profileMeta || {};

                if (metaA.backlog && !metaB.backlog) return 1;
                if (metaB.backlog && !metaA.backlog) return -1;

                // b. PH
                // c. Medical
                if (metaA.medicalIssue && !metaB.medicalIssue) return -1;
                if (metaB.medicalIssue && !metaA.medicalIssue) return 1;

                // d. Outside Delhi (No back log) -> implied priority over Delhi?
                // Bulletin says "Delhi... having no back log" separately.
                // Usually Outside Delhi > Delhi for seniors too?
                // Bulletin 2.a: "Outside Delhi... based on CGPA"
                // Bulletin 2.d: "Delhi... based on distance... no back log"
                // It seems Outside Delhi is processed first?
                // Let's assume Category Priority still holds: PH > Outside Delhi > Delhi
                const catA = categoryPriority[a.category] ?? 3;
                const catB = categoryPriority[b.category] ?? 3;
                if (catA !== catB) return catA - catB;

                if (a.category === 'OUTSIDE_DELHI') {
                    // Based on CGPA
                    const cgpaA = metaA.cgpa || 0;
                    const cgpaB = metaB.cgpa || 0;
                    if (cgpaA !== cgpaB) return cgpaB - cgpaA; // Higher CGPA first
                } else if (a.category === 'DELHI') {
                    // Based on Distance
                    const distA = metaA.distance || 0;
                    const distB = metaB.distance || 0;
                    if (distA !== distB) return distB - distA;
                }
            }

            // Fallback: Payment Date
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
                const floor = hostel.floors.find((f: any) => f.id === pref.floorId);
                if (floor) {
                    const availableRoom = floor.rooms.find(
                        (r: any) => r.occupancy < r.capacity,
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
                        (r: any) => r.occupancy < r.capacity,
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
