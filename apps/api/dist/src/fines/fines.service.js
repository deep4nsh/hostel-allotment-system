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
exports.FinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinesService = class FinesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async imposeFine(wardenId, data) {
        const student = await this.prisma.student.findUnique({
            where: { id: data.studentId },
        });
        if (!student)
            throw new Error('Student not found');
        return this.prisma.fine.create({
            data: {
                studentId: data.studentId,
                amount: parseFloat(data.amount.toString()),
                reason: data.reason,
                category: data.category,
                issuedBy: wardenId,
                status: 'PENDING',
            },
        });
    }
    async getFinesByStudent(studentId) {
        return this.prisma.fine.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllFines() {
        return this.prisma.fine.findMany({
            include: { student: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.FinesService = FinesService;
exports.FinesService = FinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinesService);
//# sourceMappingURL=fines.service.js.map