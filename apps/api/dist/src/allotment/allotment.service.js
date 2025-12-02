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
                        purpose: { in: ['REGISTRATION', 'SEAT_BOOKING'] },
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
                        purpose: { in: ['REGISTRATION', 'SEAT_BOOKING'] },
                        status: 'COMPLETED'
                    },
                },
            },
        });
        if (targetProgramGroup) {
            eligibleStudents = eligibleStudents.filter(s => (0, program_utils_1.getProgramGroup)(s.program) === targetProgramGroup);
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
        const allotments = [];
        let waitlistCounter = 1;
        for (const student of eligibleStudents) {
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