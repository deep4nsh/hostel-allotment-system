import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { getProgramGroup } from '../utils/program.utils';

@Injectable()
export class AllotmentService {
    constructor(private prisma: PrismaService) { }

    async runAllotment(hostelId: string, targetProgramGroup?: string) {
        try {
            // 1. Fetch Hostel with Rooms AND current occupants for compatibility checks
            const hostel = await this.prisma.hostel.findUnique({
                where: { id: hostelId },
                include: {
                    floors: {
                        include: {
                            rooms: {
                                include: {
                                    allotments: {
                                        where: { isPossessed: true }, // Only check actual occupants or confirmed allotments
                                        include: { student: true },
                                    }
                                }
                            },
                        },
                    },
                },
            });

            if (!hostel) throw new NotFoundException('Hostel not found');

            // Helper to determine Course Level
            const getCourseLevel = (program: string | null) => {
                if (!program) return 'UNKNOWN';
                const bachelors = ['BTECH', 'BSC', 'BDES', 'IMSC'];
                const masters = ['MTECH', 'MSC', 'MCA', 'MBA', 'MDES'];
                if (bachelors.includes(program)) return 'BACHELOR';
                if (masters.includes(program)) return 'MASTER';
                if (program === 'PHD') return 'PHD';
                return 'OTHER';
            };

            // Helper to check room compatibility
            const isRoomCompatible = (room: any, student: any) => {
                if (room.occupancy === 0) return true; // Empty room is always compatible

                // Get existing students in the room
                const occupants = room.allotments.map((a: any) => a.student);
                if (occupants.length === 0) return true; // Should ideally match occupancy, safe fallback

                const studentLevel = getCourseLevel(student.program);
                const studentYear = student.year || 1;

                // Check compatibility with ALL current occupants
                for (const occupant of occupants) {
                    const occupantLevel = getCourseLevel(occupant.program);
                    const occupantYear = occupant.year || 1;

                    // Rule 1: Bachelors with Bachelors, Masters with Masters
                    if (studentLevel !== occupantLevel) return false;

                    // Rule 2: Same Year Students together
                    if (studentYear !== occupantYear) return false;
                }

                return true;
            };

            // 2. Fetch Eligible Students
            // Changed to include REGISTRATION fee as well, so newly registered students are considered
            let eligibleStudents = await this.prisma.student.findMany({
                where: {
                    payments: {
                        some: {
                            purpose: { in: ['REGISTRATION', 'SEAT_BOOKING', 'ALLOTMENT_REQUEST'] },
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
                            purpose: { in: ['REGISTRATION', 'SEAT_BOOKING', 'ALLOTMENT_REQUEST'] },
                            status: 'COMPLETED'
                        },
                    },
                },
            });

            // Filter by Program Group if specified
            if (targetProgramGroup) {
                eligibleStudents = eligibleStudents.filter(s => getProgramGroup(s.program) === targetProgramGroup);
            }

            // --- NEW RULE: Hostel-Specific Category Filtering ---
            // Aryabhatta/Type 2 -> Indian Students Only (Non-NRI)
            if (hostel.name.includes('Aryabhatta') || hostel.name.includes('Type 2')) {
                eligibleStudents = eligibleStudents.filter(s => s.category !== 'NRI');
            }
            // Ramanujan/Transit -> NRI Students Only
            else if (hostel.name.includes('Ramanujan') || hostel.name.includes('Transit')) {
                eligibleStudents = eligibleStudents.filter(s => s.category === 'NRI');
            }

            // --- GENDER SEGREGATION & MATRIX RULES ---

            const hostelName = hostel.name.toLowerCase();
            const studentGender = (s: any) => (s.gender as string).toUpperCase();

            if (hostelName.includes('kalpana')) {
                // Girls Hostel
                eligibleStudents = eligibleStudents.filter(s => studentGender(s) === 'FEMALE');
            } else {
                // Boys Hostels (All others in the matrix provided)
                eligibleStudents = eligibleStudents.filter(s => studentGender(s) === 'MALE');

                if (hostelName.includes('aryabhatta') || hostelName.includes('type-ii')) {
                    // Rule 1: 1st Year Indian Students
                    eligibleStudents = eligibleStudents.filter(s => s.year === 1 && (s.country === 'India' || !s.country));
                }
                else if (hostelName.includes('ramanujan') || hostelName.includes('transit')) {
                    // Rule 2: Non-Indian Students (Any Year)
                    eligibleStudents = eligibleStudents.filter(s => s.category === 'NRI' || (s.country && s.country !== 'India'));
                }
                else {
                    // Rule 3: 2nd to 4th Year Students (Indian)
                    // Hostels: CVR, JCB, VMH, HJB, BCH, VVS, APJ
                    eligibleStudents = eligibleStudents.filter(s => (s.year || 1) >= 2 && (s.year || 1) <= 4 && (s.country === 'India' || !s.country));
                }
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
                            (r: any) => r.occupancy < r.capacity && isRoomCompatible(r, student)
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
                            (r: any) => r.occupancy < r.capacity && isRoomCompatible(r, student)
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
                    // Add this student to local allotments array so strictly sequential checks within this run also work
                    if (!allottedRoom.allotments) allottedRoom.allotments = [];
                    allottedRoom.allotments.push({ student });

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
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(error.message);
        }
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
