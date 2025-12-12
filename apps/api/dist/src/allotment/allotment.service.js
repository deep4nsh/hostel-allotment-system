"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllotmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const program_utils_1 = require("../utils/program.utils");
let AllotmentService = class AllotmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async runAllotment(targetYear, maxAllotments) {
        try {
            console.log(`Running Year-wise Allotment for Year ${targetYear}, Limit: ${maxAllotments ?? 'Unlimited'}`);
            const allHostels = await this.prisma.hostel.findMany({
                include: {
                    floors: {
                        include: {
                            rooms: {
                                include: {
                                    allotments: {
                                        where: { isPossessed: true },
                                        include: { student: true },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const isHostelEligibleForYear = (hostelName, category) => {
                const name = hostelName.toLowerCase();
                if (name.includes('ramanujan') || name.includes('transit')) {
                    if (category === 'NRI')
                        return true;
                    return false;
                }
                if (category === 'NRI') {
                    return false;
                }
                if (targetYear === 1) {
                    return name.includes('aryabhatta') || name.includes('type-ii');
                }
                else {
                    return !name.includes('aryabhatta') && !name.includes('type-ii');
                }
            };
            const isRoomCompatible = (room, student) => {
                return true;
            };
            const isRoomTypeAllowed = (room, student, hostelIsAC) => {
                const level = (0, program_utils_1.getProgramGroup)(student.program) === 'POSTGRAD'
                    ? 'MASTER'
                    : 'BACHELOR';
                const bachelors = ['BTECH', 'BSC', 'BDES', 'IMSC'];
                const masters = ['MTECH', 'MSC', 'MCA', 'MBA', 'MDES'];
                const studentLevel = masters.includes(student.program)
                    ? 'MASTER'
                    : 'BACHELOR';
                const year = student.year || 1;
                const capacity = room.capacity;
                const reqType = student.roomTypePreference;
                if (hostelIsAC && reqType !== 'TRIPLE_AC')
                    return false;
                if (!hostelIsAC && reqType === 'TRIPLE_AC')
                    return false;
                if (studentLevel === 'MASTER') {
                    return [1, 2].includes(capacity);
                }
                if (studentLevel === 'BACHELOR') {
                    if (year === 2) {
                        if (capacity === 1)
                            return false;
                        return true;
                    }
                    if (year >= 3) {
                        if (capacity === 3 && !hostelIsAC)
                            return false;
                        return true;
                    }
                }
                return true;
            };
            const eligibleStudents = await this.prisma.student.findMany({
                where: {
                    year: targetYear,
                    payments: {
                        some: {
                            purpose: {
                                in: ['REGISTRATION', 'SEAT_BOOKING', 'ALLOTMENT_REQUEST'],
                            },
                            status: 'COMPLETED',
                        },
                    },
                    allotment: null,
                },
                include: {
                    payments: true,
                },
            });
            const categoryPriority = {
                PH: 0,
                NRI: 1,
                OUTSIDE_DELHI: 2,
                DELHI: 3,
            };
            eligibleStudents.sort((a, b) => {
                if (a.category === 'PH' && b.category !== 'PH')
                    return -1;
                if (b.category === 'PH' && a.category !== 'PH')
                    return 1;
                const catA = categoryPriority[a.category] ?? 3;
                const catB = categoryPriority[b.category] ?? 3;
                if (catA !== catB)
                    return catA - catB;
                const metaA = a.profileMeta || {};
                const metaB = b.profileMeta || {};
                if (targetYear > 1) {
                    if (metaA.backlog && !metaB.backlog)
                        return 1;
                    if (metaB.backlog && !metaA.backlog)
                        return -1;
                    const cgpaA = Number(a.cgpa) || 0;
                    const cgpaB = Number(b.cgpa) || 0;
                    if (cgpaA !== cgpaB)
                        return cgpaB - cgpaA;
                }
                else {
                    if (a.category === 'DELHI') {
                        const distA = Number(metaA.distance) || 0;
                        const distB = Number(metaB.distance) || 0;
                        if (distA !== distB)
                            return distB - distA;
                    }
                }
                return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            });
            const allotments = [];
            let waitlistCounter = 1;
            let allottedIndianCount = 0;
            for (const student of eligibleStudents) {
                const sCategory = student.category;
                const isInternational = student.country && student.country !== 'India';
                const effectiveCategory = sCategory === 'NRI' || isInternational ? 'NRI' : sCategory;
                let allottedRoom = null;
                let limitReached = false;
                if (maxAllotments !== undefined && effectiveCategory !== 'NRI') {
                    if (allottedIndianCount >= maxAllotments) {
                        limitReached = true;
                    }
                }
                if (!limitReached) {
                    const studentHostels = allHostels.filter((h) => isHostelEligibleForYear(h.name, effectiveCategory));
                    const prefType = student.roomTypePreference;
                    if (prefType) {
                        for (const hostel of studentHostels) {
                            for (const floor of hostel.floors) {
                                if (floor.gender !== student.gender)
                                    continue;
                                const availableRoom = floor.rooms.find((r) => {
                                    if (r.occupancy >= r.capacity)
                                        return false;
                                    if (r.occupancy > 0) {
                                        const occupants = r.allotments.map((a) => a.student);
                                        if (occupants.some((o) => o.year !== targetYear))
                                            return false;
                                    }
                                    return isRoomTypeAllowed(r, student, hostel.isAC);
                                });
                                if (availableRoom) {
                                    allottedRoom = availableRoom;
                                    break;
                                }
                            }
                            if (allottedRoom)
                                break;
                        }
                    }
                    if (!allottedRoom) {
                        for (const hostel of studentHostels) {
                            for (const floor of hostel.floors) {
                                if (floor.gender !== student.gender)
                                    continue;
                                const availableRoom = floor.rooms.find((r) => {
                                    if (r.occupancy >= r.capacity)
                                        return false;
                                    if (r.occupancy > 0) {
                                        const occupants = r.allotments.map((a) => a.student);
                                        if (occupants.some((o) => o.year !== targetYear))
                                            return false;
                                    }
                                    return isRoomTypeAllowed(r, student, hostel.isAC);
                                });
                                if (availableRoom) {
                                    allottedRoom = availableRoom;
                                    break;
                                }
                            }
                            if (allottedRoom)
                                break;
                        }
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
                    if (!allottedRoom.allotments)
                        allottedRoom.allotments = [];
                    allottedRoom.allotments.push({ student });
                    allotments.push(allotment);
                    if (effectiveCategory !== 'NRI') {
                        allottedIndianCount++;
                    }
                    try {
                        await this.prisma.waitlistEntry.delete({
                            where: { studentId: student.id },
                        });
                    }
                    catch (e) {
                    }
                }
                else {
                    await this.prisma.waitlistEntry.upsert({
                        where: { studentId: student.id },
                        update: { position: waitlistCounter, status: 'ACTIVE' },
                        create: {
                            studentId: student.id,
                            position: waitlistCounter,
                            status: 'ACTIVE',
                        },
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
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async getAllotments(hostelId) {
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
                    include: { user: true },
                },
                room: {
                    include: { floor: true },
                },
            },
        });
    }
    async expireUnpaidAllotments() {
        const now = new Date();
        const results = { deleted: 0, details: [] };
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
};
exports.AllotmentService = AllotmentService;
exports.AllotmentService = AllotmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AllotmentService);
//# sourceMappingURL=allotment.service.js.map