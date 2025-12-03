import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { getProgramGroup } from '../utils/program.utils';

@Injectable()
export class AllotmentService {
    constructor(private prisma: PrismaService) { }

    async runAllotment(hostelId: string, targetProgramGroup?: string) {
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

        // 2. Fetch Eligible Students
        // Changed to include REGISTRATION fee as well, so newly registered students are considered
        let eligibleStudents = await this.prisma.student.findMany({
            where: {
                payments: {
                    some: {
                        purpose: { in: ['REGISTRATION', 'SEAT_BOOKING'] },
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
                    where: {
                        purpose: { in: ['REGISTRATION', 'SEAT_BOOKING'] },
                        status: 'COMPLETED'
                    },
                },
            },
        });

        // Filter by Program Group if specified
        if (targetProgramGroup) {
            eligibleStudents = eligibleStudents.filter(s => getProgramGroup(s.program) === targetProgramGroup);
        }

        // 3. Sort Students
        const categoryPriority: Record<string, number> = { PH: 0, NRI: 1, OUTSIDE_DELHI: 2, DELHI: 3 };

        eligibleStudents.sort((a: any, b: any) => {
            const isSeniorA = (a.year || 1) > 1;
            const isSeniorB = (b.year || 1) > 1;

            // 1. PH Category (Top priority for both)
            if (a.category === 'PH' && b.category !== 'PH') return -1;
            if (b.category === 'PH' && a.category !== 'PH') return 1;

            // 2. Category Priority
            const catA = categoryPriority[a.category] ?? 3;
            const catB = categoryPriority[b.category] ?? 3;
            if (catA !== catB) return catA - catB;

            // 3. Intra-Category Rules
            const metaA = a.profileMeta || {};
            const metaB = b.profileMeta || {};

            if (!isSeniorA && !isSeniorB) { // First Year
                if (a.category === 'DELHI') {
                    if (metaA.medicalIssue && !metaB.medicalIssue) return -1;
                    if (metaB.medicalIssue && !metaA.medicalIssue) return 1;

                    const distA = Number(metaA.distance) || 0;
                    const distB = Number(metaB.distance) || 0;
                    if (distA !== distB) return distB - distA; // Higher distance first
                }
            } else { // Seniors
                if (metaA.backlog && !metaB.backlog) return 1;
                if (metaB.backlog && !metaA.backlog) return -1;

                if (a.category === 'OUTSIDE_DELHI') {
                    const cgpaA = Number(metaA.cgpa) || 0;
                    const cgpaB = Number(metaB.cgpa) || 0;
                    if (cgpaA !== cgpaB) return cgpaB - cgpaA; // Higher CGPA first
                } else if (a.category === 'DELHI') {
                    const distA = Number(metaA.distance) || 0;
                    const distB = Number(metaB.distance) || 0;
                    if (distA !== distB) return distB - distA;
                }
            }

            // 4. Fallback: Payment Date
            const paymentA = new Date(a.payments[0]?.createdAt).getTime() || 0;
            const paymentB = new Date(b.payments[0]?.createdAt).getTime() || 0;
            return paymentA - paymentB;
        });

        // --- SEAT MATRIX LIMITS ---
        const SEAT_MATRIX = {
            BTECH: { MALE: 1674, FEMALE: 649 },
            BDES: { MALE: 32, FEMALE: 32 },
            MTECH: { MALE: 82, FEMALE: 36 },
            MBA: { MALE: 16, FEMALE: 22 },
            MSC: { MALE: 16, FEMALE: 28 },
            IMSC: { MALE: 10, FEMALE: 8 },
            MDES: { MALE: 4, FEMALE: 4 },
            PHD: { MALE: 0, FEMALE: 14 },
            BSC: { MALE: 0, FEMALE: 0 }, // Not in matrix
            MCA: { MALE: 0, FEMALE: 0 }, // Not in matrix
        };

        const allotments = [];
        let waitlistCounter = 1;

        // Track current counts
        const currentCounts: Record<string, { MALE: number, FEMALE: number }> = {
            BTECH: { MALE: 0, FEMALE: 0 },
            BDES: { MALE: 0, FEMALE: 0 },
            MTECH: { MALE: 0, FEMALE: 0 },
            MBA: { MALE: 0, FEMALE: 0 },
            MSC: { MALE: 0, FEMALE: 0 },
            IMSC: { MALE: 0, FEMALE: 0 },
            MDES: { MALE: 0, FEMALE: 0 },
            PHD: { MALE: 0, FEMALE: 0 },
            BSC: { MALE: 0, FEMALE: 0 },
            MCA: { MALE: 0, FEMALE: 0 },
        };

        // 4. Iterate and Assign
        for (const student of eligibleStudents) {
            // RULE: IMSc students only eligible for first 3 years
            if (student.program === 'IMSC' && (student.year || 1) > 3) {
                console.log(`Skipping IMSc student ${student.id} (Year ${student.year} > 3)`);
                continue;
            }

            const prog = student.program;
            if (!prog) continue; // Skip if no program defined

            const gender = student.gender === 'FEMALE' ? 'FEMALE' : 'MALE';

            // Check Matrix Limit
            if (SEAT_MATRIX[prog] && currentCounts[prog]) {
                const limit = SEAT_MATRIX[prog][gender] || 0;
                if (currentCounts[prog][gender] >= limit) {
                    // Limit Reached -> Add to Waitlist
                    await this.prisma.waitlistEntry.upsert({
                        where: { studentId: student.id },
                        update: { position: waitlistCounter, status: 'ACTIVE' },
                        create: {
                            studentId: student.id,
                            position: waitlistCounter,
                            status: 'ACTIVE',
                        }
                    });
                    waitlistCounter++;
                    continue; // Skip allotment
                }
            }
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

                // Update Matrix Counts
                if (student.program && currentCounts[student.program]) {
                    const g = student.gender === 'FEMALE' ? 'FEMALE' : 'MALE';
                    currentCounts[student.program][g]++;
                }

                // Remove from waitlist if exists
                try {
                    await this.prisma.waitlistEntry.delete({ where: { studentId: student.id } });
                } catch (e) { /* ignore */ }

            } else {
                // Add to Waitlist
                await this.prisma.waitlistEntry.upsert({
                    where: { studentId: student.id },
                    update: { position: waitlistCounter, status: 'ACTIVE' },
                    create: {
                        studentId: student.id,
                        position: waitlistCounter,
                        status: 'ACTIVE',
                    }
                });
                waitlistCounter++;
            }
        }

        return {
            totalEligible: eligibleStudents.length,
            allotted: allotments.length,
            waitlisted: waitlistCounter - 1,
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
