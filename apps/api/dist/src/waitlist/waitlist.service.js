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
    async joinWaitlist(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { payments: true, documents: true },
        });
        if (!student)
            throw new Error('Student not found');
        const requiredDocs = ['ADMISSION_LETTER', 'AADHAR_FRONT', 'AADHAR_BACK', 'PHOTO', 'SIGNATURE'];
        const uploadedDocs = student.documents.map(d => d.kind);
        const missingDocs = requiredDocs.filter(d => !uploadedDocs.includes(d));
        if (missingDocs.length > 0) {
            throw new Error(`Missing mandatory documents: ${missingDocs.join(', ')}`);
        }
        const existingEntry = await this.prisma.waitlistEntry.findUnique({
            where: { studentId: student.id },
        });
        if (existingEntry)
            return { message: 'Already in waitlist', entry: existingEntry };
        const payment = student.payments.find((p) => p.purpose === 'ALLOTMENT_REQUEST' && p.status === 'COMPLETED');
        if (!payment)
            throw new Error('Payment of ₹1000 not found');
        const count = await this.prisma.waitlistEntry.count({ where: { status: 'ACTIVE' } });
        return this.prisma.waitlistEntry.create({
            data: {
                studentId: student.id,
                position: count + 1,
                status: 'ACTIVE',
            },
        });
    }
    async getPriorityWaitlist() {
        const entries = await this.prisma.waitlistEntry.findMany({
            where: { status: 'ACTIVE' },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        uniqueId: true,
                        program: true,
                        year: true,
                        profileMeta: true,
                        payments: {
                            where: { purpose: 'ALLOTMENT_REQUEST', status: 'COMPLETED' },
                            select: { createdAt: true }
                        }
                    }
                }
            }
        });
        return entries.sort((a, b) => {
            const distA = a.student.profileMeta?.distance || 0;
            const distB = b.student.profileMeta?.distance || 0;
            if (distB !== distA) {
                return distB - distA;
            }
            const timeA = a.student.payments[0]?.createdAt.getTime() || 0;
            const timeB = b.student.payments[0]?.createdAt.getTime() || 0;
            return timeA - timeB;
        });
    }
    async getWaitlistPosition(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { payments: true }
        });
        if (!student)
            return { status: 'NOT_REGISTERED' };
        const entry = await this.prisma.waitlistEntry.findUnique({
            where: { studentId: student.id },
        });
        if (entry) {
            const list = await this.getPriorityWaitlist();
            const position = list.findIndex(e => e.studentId === student.id) + 1;
            return { position, status: entry.status };
        }
        const payment = student.payments.find((p) => p.purpose === 'ALLOTMENT_REQUEST' && p.status === 'COMPLETED');
        if (payment)
            return { status: 'PAID_NOT_JOINED' };
        return { status: 'NOT_PAID' };
    }
};
exports.WaitlistService = WaitlistService;
exports.WaitlistService = WaitlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaitlistService);
//# sourceMappingURL=waitlist.service.js.map