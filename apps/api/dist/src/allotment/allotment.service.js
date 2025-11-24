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
let AllotmentService = class AllotmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async runAllotment(hostelId) {
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
        const eligibleStudents = await this.prisma.student.findMany({
            where: {
                payments: {
                    some: {
                        purpose: 'SEAT_BOOKING',
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
                    where: { purpose: 'SEAT_BOOKING', status: 'COMPLETED' },
                },
            },
        });
        eligibleStudents.sort((a, b) => {
            const paymentA = a.payments[0].createdAt.getTime();
            const paymentB = b.payments[0].createdAt.getTime();
            return paymentA - paymentB;
        });
        const allotments = [];
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
            }
        }
        return {
            totalEligible: eligibleStudents.length,
            allotted: allotments.length,
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