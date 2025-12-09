import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getProgramGroup } from '../utils/program.utils';

@Injectable()
export class AllotmentService {
    constructor(private prisma: PrismaService) { }

    async runAllotment(targetYear: number) {
        try {
            console.log(`Running Year-wise Allotment for Year ${targetYear}`);

            // 1. Fetch ALL Hostels with Rooms AND current occupants
            const allHostels = await this.prisma.hostel.findMany({
                include: {
                    floors: {
                        include: {
                            rooms: {
                                include: {
                                    allotments: {
                                        where: { isPossessed: true },
                                        include: { student: true },
                                    }
                                }
                            },
                        },
                    },
                },
            });

            // 2. Define Eligible Hostels based on Year
            // Rule:
            // Year 1 (Boys) -> Aryabhatta, Type-II
            // Year 2+ (Boys) -> CVR, JCB, VMH, HJB, BCH, VVS, APJ
            // NRI (Boys) -> Ramanujan
            // Girls -> Any hostel with Female floors (Matrix implies mixed or specific blocks) 

            const isHostelEligibleForYear = (hostelName: string, category: string) => {
                const name = hostelName.toLowerCase();

                // Exclusive NRI Hostel
                if (name.includes('ramanujan') || name.includes('transit')) {
                    if (category === 'NRI') return true;
                    // Allow Year 1 international if category not explicitly NRI but country != India
                    return false;
                }

                if (category === 'NRI') {
                    // NRIs prefer Ramanujan, but can fall back to Year-appropriate hostels if needed?
                    // Usually Ramanujan is the designated one.
                    return false;
                }

                if (targetYear === 1) {
                    return name.includes('aryabhatta') || name.includes('type-ii');
                } else {
                    return !name.includes('aryabhatta') && !name.includes('type-ii');
                }
            };


            // Helper to check room compatibility
            const isRoomCompatible = (room: any, student: any) => {
                // Determine implicit gender from Hostel/Floor if possible, or strictly use Floor gender
                // The DB has Floor.gender, which is the ultimate truth.
                return true; // Occupancy check is done in loop. Mixed logic handled by floor gender.
            };

            // Helper to check if room type is allowed (Strict Policy)
            const isRoomTypeAllowed = (room: any, student: any, hostelIsAC: boolean) => {
                const level = getProgramGroup(student.program) === 'POSTGRAD' ? 'MASTER' : 'BACHELOR'; // Simplified util wrapper
                // OR use logic from before:
                const bachelors = ['BTECH', 'BSC', 'BDES', 'IMSC'];
                const masters = ['MTECH', 'MSC', 'MCA', 'MBA', 'MDES'];
                const studentLevel = masters.includes(student.program) ? 'MASTER' : 'BACHELOR';

                const year = student.year || 1;
                const capacity = room.capacity;
                const reqType = student.roomTypePreference; // SINGLE, DOUBLE, TRIPLE, TRIPLE_AC

                // AC Rule: Only if asked
                if (hostelIsAC && reqType !== 'TRIPLE_AC') return false;
                if (!hostelIsAC && reqType === 'TRIPLE_AC') return false;

                if (studentLevel === 'MASTER') {
                    // Masters: Single, Double
                    return [1, 2].includes(capacity);
                }

                if (studentLevel === 'BACHELOR') {
                    // Year 2: Double, Triple (AC/Non-AC)
                    if (year === 2) {
                        if (capacity === 1) return false;
                        return true;
                    }
                    // Year 3 & 4: Single, Double, AC Triple (No Non-AC Triple)
                    if (year >= 3) {
                        if (capacity === 3 && !hostelIsAC) return false;
                        return true;
                    }
                }
                return true;
            };


            // 3. Fetch Eligible Students for Target Year
            let eligibleStudents = await this.prisma.student.findMany({
                where: {
                    year: targetYear,
                    payments: {
                        some: {
                            purpose: { in: ['REGISTRATION', 'SEAT_BOOKING', 'ALLOTMENT_REQUEST'] },
                            status: 'COMPLETED',
                        },
                    },
                    allotment: null, // Not already allotted
                },
                include: {
                    payments: true, // Needed for sorting fallback
                },
            });

            // 4. Sort Students
            const categoryPriority: Record<string, number> = { PH: 0, NRI: 1, OUTSIDE_DELHI: 2, DELHI: 3 };

            eligibleStudents.sort((a: any, b: any) => {
                // 1. PH Category
                if (a.category === 'PH' && b.category !== 'PH') return -1;
                if (b.category === 'PH' && a.category !== 'PH') return 1;

                // 2. Category Priority
                const catA = categoryPriority[a.category] ?? 3;
                const catB = categoryPriority[b.category] ?? 3;
                if (catA !== catB) return catA - catB;

                // 3. Intra-Category (CGPA/Distance/Backlog)
                const metaA = a.profileMeta || {};
                const metaB = b.profileMeta || {};

                // Seniors (Year > 1) -> CGPA
                if (targetYear > 1) {
                    // Backlogs push to bottom?
                    if (metaA.backlog && !metaB.backlog) return 1;
                    if (metaB.backlog && !metaA.backlog) return -1;

                    const cgpaA = Number(a.cgpa) || 0;
                    const cgpaB = Number(b.cgpa) || 0;
                    if (cgpaA !== cgpaB) return cgpaB - cgpaA;
                } else {
                    // Freshers (Year 1) -> Distance (if Delhi) or Rank (if Outside) - simplified to Distance for Delhi here
                    if (a.category === 'DELHI') {
                        const distA = Number(metaA.distance) || 0;
                        const distB = Number(metaB.distance) || 0;
                        if (distA !== distB) return distB - distA;
                    }
                }

                // Fallback
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            const allotments = [];
            let waitlistCounter = 1;

            // 5. Iterate and Assign
            for (const student of eligibleStudents) {
                const sCategory = student.category;
                // Determine if student is effectively NRI (International Country)
                const isInternational = student.country && student.country !== 'India';
                const effectiveCategory = (sCategory === 'NRI' || isInternational) ? 'NRI' : sCategory;

                let allottedRoom = null;

                // Filter Hostels for this Student
                const studentHostels = allHostels.filter(h => isHostelEligibleForYear(h.name, effectiveCategory));

                // Find Room based on Preference (roomTypePreference)
                // "TRIPLE_AC" -> Capacity 3 + Hostel.isAC = true
                // "TRIPLE" -> Capacity 3 + Hostel.isAC = false
                // "DOUBLE" -> Capacity 2
                // "SINGLE" -> Capacity 1

                const prefType = student.roomTypePreference;

                // Attempt 1: Exact Match in Eligible Hostels
                if (prefType) {
                    for (const hostel of studentHostels) {
                        for (const floor of hostel.floors) {
                            if (floor.gender !== student.gender) continue; // Gender Check

                            const availableRoom = floor.rooms.find((r: any) => {
                                if (r.occupancy >= r.capacity) return false;
                                // Compatibility check (e.g. don't mix Year 1 with Year 4 in same room)
                                // We can rely on 'isRoomTypeAllowed' implicitly covering year logic for the ROOM TYPE, 
                                // but for sharing, we rely on empty or matching.
                                // Since we iterate year-wise, freshers naturally group together.
                                // For seniors, we might mix years (2,3,4) if allowed.
                                // Let's keep it simple: If room not empty, check occupants.
                                if (r.occupancy > 0) {
                                    // Check if existing occupants are compatible (Same Year mainly)
                                    // Local check using 'r.allotments'
                                    const occupants = r.allotments.map((a: any) => a.student);
                                    if (occupants.some((o: any) => o.year !== targetYear)) return false;
                                }

                                // Type Check
                                return isRoomTypeAllowed(r, student, hostel.isAC);
                            });

                            if (availableRoom) {
                                allottedRoom = availableRoom;
                                break;
                            }
                        }
                        if (allottedRoom) break;
                    }
                }

                // Attempt 2: Fallback to ANY valid room in Eligible Hostels
                if (!allottedRoom) {
                    for (const hostel of studentHostels) {
                        for (const floor of hostel.floors) {
                            if (floor.gender !== student.gender) continue;

                            const availableRoom = floor.rooms.find((r: any) => {
                                if (r.occupancy >= r.capacity) return false;
                                if (r.occupancy > 0) {
                                    const occupants = r.allotments.map((a: any) => a.student);
                                    if (occupants.some((o: any) => o.year !== targetYear)) return false;
                                }
                                // Basic Type Check (e.g. no Masters in Triples if banned)
                                return isRoomTypeAllowed(r, student, hostel.isAC);
                            });

                            if (availableRoom) {
                                allottedRoom = availableRoom;
                                break;
                            }
                        }
                        if (allottedRoom) break;
                    }
                }

                if (allottedRoom) {
                    const validTill = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    const allotment = await this.prisma.allotment.create({
                        data: {
                            studentId: student.id,
                            roomId: allottedRoom.id,
                            type: 'REGULAR',
                            validTill: validTill,
                            isPossessed: false,
                        },
                    });

                    await this.prisma.room.update({
                        where: { id: allottedRoom.id },
                        data: { occupancy: { increment: 1 } },
                    });

                    allottedRoom.occupancy++;
                    if (!allottedRoom.allotments) allottedRoom.allotments = [];
                    allottedRoom.allotments.push({ student } as any);

                    allotments.push(allotment);
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
            console.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async getAllotments(hostelId: string) {
        return this.prisma.allotment.findMany({
            where: {
                room: {
                    floor: {
                        hostelId: hostelId, // This can remain as is for fetching lists per hostel
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

    async expireUnpaidAllotments() {
        const now = new Date();
        const results = { deleted: 0, details: [] as string[] };

        const expiredAllotments = await this.prisma.allotment.findMany({
            where: { validTill: { lt: now }, isPossessed: false },
            include: { room: true },
        });

        for (const allotment of expiredAllotments) {
            await this.prisma.allotment.delete({ where: { id: allotment.id } });
            await this.prisma.room.update({
                where: { id: allotment.roomId },
                data: { occupancy: { decrement: 1 } },
            });
            results.deleted++;
            results.details.push(`Expired: Student ${allotment.studentId}`);
        }
        return results;
    }
}
