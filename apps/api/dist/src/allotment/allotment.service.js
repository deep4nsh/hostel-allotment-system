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
    async runAllotment(hostelId, targetProgramGroup) {
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
        if (!hostel)
            throw new Error('Hostel not found');
        let eligibleStudents = await this.prisma.student.findMany({
            where: {
                payments: {
                    some: {
                        purpose: { in: ['REGISTRATION', 'SEAT_BOOKING', 'ALLOTMENT_REQUEST'] },
                        status: 'COMPLETED',
                    },
                },
                allotment: null,
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
        if (targetProgramGroup) {
            eligibleStudents = eligibleStudents.filter(s => (0, program_utils_1.getProgramGroup)(s.program) === targetProgramGroup);
        }
        if (hostel.name.includes('Aryabhatta') || hostel.name.includes('Type 2')) {
            eligibleStudents = eligibleStudents.filter(s => s.category !== 'NRI');
        }
        else if (hostel.name.includes('Ramanujan') || hostel.name.includes('Transit')) {
            eligibleStudents = eligibleStudents.filter(s => s.category === 'NRI');
        }
        const categoryPriority = { PH: 0, NRI: 1, OUTSIDE_DELHI: 2, DELHI: 3 };
        eligibleStudents.sort((a, b) => {
            const isSeniorA = (a.year || 1) > 1;
            const isSeniorB = (b.year || 1) > 1;
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
            if (!isSeniorA && !isSeniorB) {
                if (a.category === 'DELHI') {
                    if (metaA.medicalIssue && !metaB.medicalIssue)
                        return -1;
                    if (metaB.medicalIssue && !metaA.medicalIssue)
                        return 1;
                    const distA = Number(metaA.distance) || 0;
                    const distB = Number(metaB.distance) || 0;
                    if (distA !== distB)
                        return distB - distA;
                }
            }
            else {
                if (metaA.backlog && !metaB.backlog)
                    return 1;
                if (metaB.backlog && !metaA.backlog)
                    return -1;
                if (a.category === 'OUTSIDE_DELHI') {
                    const cgpaA = Number(metaA.cgpa) || 0;
                    const cgpaB = Number(metaB.cgpa) || 0;
                    if (cgpaA !== cgpaB)
                        return cgpaB - cgpaA;
                }
                else if (a.category === 'DELHI') {
                    const distA = Number(metaA.distance) || 0;
                    const distB = Number(metaB.distance) || 0;
                    if (distA !== distB)
                        return distB - distA;
                }
            }
            const paymentA = new Date(a.payments[0]?.createdAt).getTime() || 0;
            const paymentB = new Date(b.payments[0]?.createdAt).getTime() || 0;
            return paymentA - paymentB;
        });
        const SEAT_MATRIX = {
            BTECH: { MALE: 1674, FEMALE: 649 },
            BDES: { MALE: 32, FEMALE: 32 },
            MTECH: { MALE: 82, FEMALE: 36 },
            MBA: { MALE: 16, FEMALE: 22 },
            MSC: { MALE: 16, FEMALE: 28 },
            IMSC: { MALE: 10, FEMALE: 8 },
            MDES: { MALE: 4, FEMALE: 4 },
            PHD: { MALE: 0, FEMALE: 14 },
            BSC: { MALE: 0, FEMALE: 0 },
            MCA: { MALE: 0, FEMALE: 0 },
        };
        const allotments = [];
        let waitlistCounter = 1;
        const currentCounts = {
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
        for (const student of eligibleStudents) {
            if (student.program === 'IMSC' && (student.year || 1) > 3) {
                console.log(`Skipping IMSc student ${student.id} (Year ${student.year} > 3)`);
                continue;
            }
            const prog = student.program;
            if (!prog)
                continue;
            const gender = student.gender === 'FEMALE' ? 'FEMALE' : 'MALE';
            if (SEAT_MATRIX[prog] && currentCounts[prog]) {
                const limit = SEAT_MATRIX[prog][gender] || 0;
                if (currentCounts[prog][gender] >= limit) {
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
                    continue;
                }
            }
            let allottedRoom = null;
            for (const pref of student.preferences) {
                const floor = hostel.floors.find((f) => f.id === pref.floorId);
                if (floor) {
                    const availableRoom = floor.rooms.find((r) => r.occupancy < r.capacity);
                    if (availableRoom) {
                        allottedRoom = availableRoom;
                        break;
                    }
                }
            }
            if (!allottedRoom) {
                for (const floor of hostel.floors) {
                    const availableRoom = floor.rooms.find((r) => r.occupancy < r.capacity);
                    if (availableRoom) {
                        allottedRoom = availableRoom;
                        break;
                    }
                }
            }
            if (allottedRoom) {
                const allotment = await this.prisma.allotment.create({
                    data: {
                        studentId: student.id,
                        roomId: allottedRoom.id,
                        type: 'REGULAR',
                    },
                });
                await this.prisma.room.update({
                    where: { id: allottedRoom.id },
                    data: { occupancy: { increment: 1 } },
                });
                allottedRoom.occupancy++;
                allotments.push(allotment);
                if (student.program && currentCounts[student.program]) {
                    const g = student.gender === 'FEMALE' ? 'FEMALE' : 'MALE';
                    currentCounts[student.program][g]++;
                }
                try {
                    await this.prisma.waitlistEntry.delete({ where: { studentId: student.id } });
                }
                catch (e) { }
            }
            else {
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
                    include: { user: true }
                },
                room: {
                    include: { floor: true }
                },
            },
        });
    }
};
exports.AllotmentService = AllotmentService;
exports.AllotmentService = AllotmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AllotmentService);
//# sourceMappingURL=allotment.service.js.map