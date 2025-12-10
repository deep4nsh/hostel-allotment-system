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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const razorpay_1 = __importDefault(require("razorpay"));
let RefundsService = class RefundsService {
    prisma;
    razorpay;
    constructor(prisma) {
        this.prisma = prisma;
        this.razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 's42BN13v3y7S0Y4aoY4aoY4a',
        });
    }
    async createRequest(userId, paymentId, reason) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { allotment: true },
        });
        if (!student)
            throw new Error('Student not found');
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment || payment.studentId !== student.id)
            throw new Error('Invalid payment');
        if (payment.purpose === 'ALLOTMENT_REQUEST') {
            throw new Error('Allotment Request Fee is non-refundable.');
        }
        if (payment.purpose === 'HOSTEL_FEE') {
            const now = new Date();
            const currentYear = now.getFullYear();
            const deadline = new Date(`${currentYear}-12-31`);
            if (now > deadline) {
                throw new Error('Refund applications for Hostel Fees are closed for this session (Deadline: 31st December).');
            }
        }
        let refundAmount = payment.amount;
        if (student.allotment) {
            const issueDate = new Date(student.allotment.issueDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - issueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 30) {
                refundAmount = 0;
            }
            else if (diffDays > 10) {
                refundAmount = Math.max(0, refundAmount - 6000);
            }
            else {
                refundAmount = Math.max(0, refundAmount - 3000);
            }
        }
        const hostelRefundRequest = await this.prisma.refundRequest.create({
            data: {
                studentId: student.id,
                feeType: payment.purpose,
                amount: refundAmount,
                status: 'PENDING',
            },
        });
        if (payment.purpose === 'HOSTEL_FEE') {
            const messPayment = await this.prisma.payment.findFirst({
                where: {
                    studentId: student.id,
                    purpose: 'MESS_FEE',
                    status: 'COMPLETED',
                },
            });
            if (messPayment) {
                const existingReq = await this.prisma.refundRequest.findFirst({
                    where: {
                        studentId: student.id,
                        feeType: 'MESS_FEE',
                        status: 'PENDING',
                    },
                });
                if (!existingReq) {
                    await this.prisma.refundRequest.create({
                        data: {
                            studentId: student.id,
                            feeType: 'MESS_FEE',
                            amount: messPayment.amount,
                            status: 'PENDING',
                        },
                    });
                    console.log(`Auto-generated Mess Fee refund request for student ${student.id}`);
                }
            }
        }
        return hostelRefundRequest;
    }
    async findAll() {
        return this.prisma.refundRequest.findMany({
            include: { student: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async processRefund(requestId, decision) {
        const request = await this.prisma.refundRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new Error('Request not found');
        if (decision === 'REJECTED') {
            return this.prisma.refundRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' },
            });
        }
        try {
            console.log(`[MOCK] Processing refund for ${request.amount} via Razorpay`);
            return this.prisma.refundRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' },
            });
        }
        catch (error) {
            console.error('Refund failed', error);
            throw new Error('Refund processing failed');
        }
    }
};
exports.RefundsService = RefundsService;
exports.RefundsService = RefundsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RefundsService);
//# sourceMappingURL=refunds.service.js.map