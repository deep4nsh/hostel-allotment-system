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
exports.WaitlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WaitlistService = class WaitlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWaitlistPosition(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { payments: true },
        });
        if (!student)
            return { position: null, status: 'NOT_REGISTERED' };
        const seatBookingPayment = student.payments.find((p) => p.purpose === 'SEAT_BOOKING' && p.status === 'COMPLETED');
        if (!seatBookingPayment)
            return { position: null, status: 'FEE_NOT_PAID' };
        const count = await this.prisma.payment.count({
            where: {
                purpose: 'SEAT_BOOKING',
                status: 'COMPLETED',
                createdAt: {
                    lt: seatBookingPayment.createdAt,
                },
            },
        });
        return { position: count + 1, status: 'WAITLISTED' };
    }
};
exports.WaitlistService = WaitlistService;
exports.WaitlistService = WaitlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaitlistService);
//# sourceMappingURL=waitlist.service.js.map