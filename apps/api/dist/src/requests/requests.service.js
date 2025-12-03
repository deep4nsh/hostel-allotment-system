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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RequestsService = class RequestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createChangeRequest(studentId, data) {
        const allotment = await this.prisma.allotment.findUnique({ where: { studentId } });
        if (!allotment)
            throw new Error('No active allotment found');
        return this.prisma.roomChangeRequest.create({
            data: {
                studentId,
                currentRoomId: allotment.roomId,
                reason: data.reason,
                preferredHostelId: data.preferredHostelId,
            },
        });
    }
    async createSurrenderRequest(studentId, data) {
        const allotment = await this.prisma.allotment.findUnique({ where: { studentId } });
        if (!allotment)
            throw new Error('No active allotment found');
        return this.prisma.roomSurrenderRequest.create({
            data: {
                studentId,
                allotmentId: allotment.id,
                reason: data.reason,
                clearanceUrl: data.clearanceUrl,
            },
        });
    }
    async confirmPossession(studentId) {
        const allotment = await this.prisma.allotment.findUnique({ where: { studentId } });
        if (!allotment)
            throw new Error('No active allotment found');
        return this.prisma.allotment.update({
            where: { id: allotment.id },
            data: {
                isPossessed: true,
                possessionDate: new Date(),
            },
        });
    }
    async getMyRequests(studentId) {
        const changeRequests = await this.prisma.roomChangeRequest.findMany({ where: { studentId } });
        const surrenderRequests = await this.prisma.roomSurrenderRequest.findMany({ where: { studentId } });
        const swapRequests = await this.prisma.hostelSwapRequest.findMany({ where: { studentId } });
        return { changeRequests, surrenderRequests, swapRequests };
    }
    async getAllChangeRequests() {
        return this.prisma.roomChangeRequest.findMany({
            include: { student: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateChangeRequestStatus(id, status, comment) {
        return this.prisma.roomChangeRequest.update({
            where: { id },
            data: { status, adminComment: comment },
        });
    }
    async getAllSurrenderRequests() {
        return this.prisma.roomSurrenderRequest.findMany({
            include: { student: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateSurrenderRequestStatus(id, status, comment) {
        const request = await this.prisma.roomSurrenderRequest.update({
            where: { id },
            data: { status, adminComment: comment },
        });
        if (status === 'APPROVED') {
            const allotment = await this.prisma.allotment.findUnique({ where: { id: request.allotmentId } });
            if (allotment) {
                await this.prisma.allotment.delete({ where: { id: request.allotmentId } });
                await this.prisma.room.update({
                    where: { id: allotment.roomId },
                    data: { occupancy: { decrement: 1 } }
                });
            }
        }
        return request;
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map