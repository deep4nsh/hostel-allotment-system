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
exports.RebatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RebatesService = class RebatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createRebateDto) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new common_1.BadRequestException('Student profile not found');
        const start = new Date(createRebateDto.startDate);
        const end = new Date(createRebateDto.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 3) {
            throw new common_1.BadRequestException('Mess rebate must be for at least 3 days');
        }
        return this.prisma.messRebateRequest.create({
            data: {
                studentId: student.id,
                startDate: start,
                endDate: end,
                reason: createRebateDto.reason,
                documentUrl: createRebateDto.documentUrl,
                status: 'PENDING',
            },
        });
    }
    async findAllForStudent(userId) {
        return this.prisma.messRebateRequest.findMany({
            where: { student: { userId } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllPendingForWarden(wardenId) {
        return this.prisma.messRebateRequest.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                student: {
                    include: {
                        allotment: {
                            include: { room: { include: { floor: { include: { hostel: true } } } } }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.messRebateRequest.update({
            where: { id },
            data: { status },
        });
    }
};
exports.RebatesService = RebatesService;
exports.RebatesService = RebatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RebatesService);
//# sourceMappingURL=rebates.service.js.map