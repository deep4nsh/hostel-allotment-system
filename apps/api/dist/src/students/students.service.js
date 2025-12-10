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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const distance_service_1 = require("../utils/distance.service");
let StudentsService = class StudentsService {
    prisma;
    distanceService;
    constructor(prisma, distanceService) {
        this.prisma = prisma;
        this.distanceService = distanceService;
    }
    async findOne(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { email: true, role: true },
                },
                payments: true,
                refundRequests: true,
                fines: true,
                documents: true,
                allotment: {
                    include: {
                        room: {
                            include: {
                                floor: {
                                    include: {
                                        hostel: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!student) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            const newStudent = await this.prisma.student.create({
                data: {
                    userId,
                    name: user.email.split('@')[0] || 'Student',
                    gender: 'OTHER',
                },
                include: {
                    user: {
                        select: { email: true, role: true },
                    },
                },
            });
            return newStudent;
        }
        return student;
    }
    async update(userId, data) {
        return this.prisma.student.update({
            where: { userId },
            data,
        });
    }
    async savePreferences(userId, preferences) {
        const student = await this.findOne(userId);
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        await this.prisma.preference.deleteMany({
            where: { studentId: student.id },
        });
        return this.prisma.preference.createMany({
            data: preferences.map((pref) => ({
                studentId: student.id,
                floorId: pref.floorId,
                rank: pref.rank,
                year: student.year || 1,
            })),
        });
    }
    async updateProfile(userId, data) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (student.isProfileFrozen) {
            throw new common_1.ForbiddenException('Profile is frozen. Request edit access to make changes.');
        }
        const { distance, ...rest } = data;
        const updateData = { ...rest };
        if (distance !== undefined) {
            const existingMeta = student.profileMeta || {};
            updateData.profileMeta = {
                ...existingMeta,
                distance,
            };
            updateData.distance = distance;
        }
        const updatedStudent = await this.prisma.student.update({
            where: { userId },
            data: updateData,
        });
        const requiredFields = [
            'name',
            'uniqueId',
            'phone',
            'gender',
            'program',
            'year',
            'category',
            'addressLine1',
            'city',
            'state',
            'pincode',
            'country',
        ];
        const isComplete = requiredFields.every((field) => {
            const value = updatedStudent[field];
            return value !== null && value !== undefined && value !== '';
        });
        if (isComplete) {
            await this.prisma.student.update({
                where: { id: student.id },
                data: { isProfileFrozen: true },
            });
            updatedStudent.isProfileFrozen = true;
        }
        return updatedStudent;
    }
    async requestEditAccess(userId, reason) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        return this.prisma.profileEditRequest.create({
            data: {
                studentId: student.id,
                reason,
                status: 'PENDING',
            },
        });
    }
    async getAllPendingEditRequests() {
        return this.prisma.profileEditRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                student: {
                    select: {
                        name: true,
                        uniqueId: true,
                        program: true,
                        year: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveEditRequest(requestId) {
        const request = await this.prisma.profileEditRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        await this.prisma.profileEditRequest.update({
            where: { id: requestId },
            data: { status: 'APPROVED' },
        });
        return this.prisma.student.update({
            where: { id: request.studentId },
            data: { isProfileFrozen: false },
        });
    }
    async rejectEditRequest(requestId) {
        const request = await this.prisma.profileEditRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        return this.prisma.profileEditRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });
    }
    async getEditRequests(userId) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        return this.prisma.profileEditRequest.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
        });
    }
    async generateUniqueId(userId) {
        const student = await this.findOne(userId);
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (student.uniqueId)
            return student;
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const uniqueId = `DTU - ${year} -${random} `;
        return this.prisma.student.update({
            where: { userId },
            data: { uniqueId },
        });
    }
    async calculateDistance(addressData) {
        const fullAddress = `${addressData.addressLine1}, ${addressData.city}, ${addressData.state}, ${addressData.pincode}, India`;
        const coords = await this.distanceService.geocodeAddress(fullAddress);
        if (!coords) {
            throw new common_1.NotFoundException('Could not geocode address');
        }
        const distance = this.distanceService.calculateDistanceFromDTU(coords.lat, coords.lng);
        return { distance, coords };
    }
    async searchStudents(params) {
        const { search, hostelId, roomNumber, year } = params;
        return this.prisma.student.findMany({
            where: {
                AND: [
                    search
                        ? {
                            OR: [
                                { name: { contains: search, mode: 'insensitive' } },
                                { uniqueId: { contains: search, mode: 'insensitive' } },
                                {
                                    user: { email: { contains: search, mode: 'insensitive' } },
                                },
                            ],
                        }
                        : {},
                    year ? { year: year } : {},
                    hostelId || roomNumber
                        ? {
                            allotment: {
                                room: {
                                    ...(roomNumber ? { number: roomNumber } : {}),
                                    ...(hostelId ? { floor: { hostelId } } : {}),
                                },
                            },
                        }
                        : {},
                ],
            },
            include: {
                user: { select: { email: true } },
                allotment: {
                    include: {
                        room: {
                            include: {
                                floor: {
                                    include: {
                                        hostel: true,
                                    },
                                },
                            },
                        },
                    },
                },
                documents: {
                    where: { kind: 'PHOTO' },
                    select: { fileUrl: true, kind: true },
                },
            },
            take: 50,
        });
    }
    async acknowledgePossession(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: {
                allotment: true,
                payments: true,
            },
        });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (!student.allotment)
            throw new common_1.BadRequestException('No allotment found');
        if (student.allotment.isPossessed) {
            return { message: 'Possession already acknowledged' };
        }
        const hostelFeePaid = student.payments.some((p) => p.purpose === 'HOSTEL_FEE' &&
            (p.status === 'COMPLETED' || p.status === 'PAID'));
        if (!hostelFeePaid) {
            throw new common_1.BadRequestException('Hostel fee must be paid before acknowledging possession.');
        }
        return this.prisma.allotment.update({
            where: { id: student.allotment.id },
            data: {
                isPossessed: true,
                possessionDate: new Date(),
            },
        });
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        distance_service_1.DistanceService])
], StudentsService);
//# sourceMappingURL=students.service.js.map