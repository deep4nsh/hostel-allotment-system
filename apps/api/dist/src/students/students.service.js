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
let StudentsService = class StudentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(userId) {
        return this.prisma.student.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { email: true, role: true }
                },
                allotment: {
                    include: {
                        room: {
                            include: {
                                floor: true
                            }
                        }
                    }
                }
            }
        });
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
            throw new Error('Student not found');
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
        const { cgpa, distance, ...rest } = data;
        const updateData = { ...rest };
        if (cgpa !== undefined || distance !== undefined) {
            const student = await this.prisma.student.findUnique({ where: { userId }, select: { profileMeta: true } });
            const existingMeta = student?.profileMeta || {};
            updateData.profileMeta = {
                ...existingMeta,
                ...(cgpa !== undefined && { cgpa }),
                ...(distance !== undefined && { distance }),
            };
        }
        return this.prisma.student.update({
            where: { userId },
            data: updateData,
        });
    }
    async generateUniqueId(userId) {
        const student = await this.findOne(userId);
        if (!student)
            throw new Error('Student not found');
        if (student.uniqueId)
            return student;
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const uniqueId = `DTU-${year}-${random}`;
        return this.prisma.student.update({
            where: { userId },
            data: { uniqueId },
        });
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map