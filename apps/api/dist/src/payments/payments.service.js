"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    prisma;
    razorpay;
    constructor(prisma) {
        this.prisma = prisma;
        this.razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 's42BN13v3y7S0Y4aoY4aoY4a',
        });
    }
    async createOrder(userId, purpose) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student) {
            throw new common_1.BadRequestException('Student record not found for user');
        }
        let amount = 0;
        if (purpose === 'REGISTRATION')
            amount = 1000;
        else if (purpose === 'SEAT_BOOKING')
            amount = 5000;
        else if (purpose === 'MESS_FEE')
            amount = 20000;
        else if (purpose === 'HOSTEL_FEE') {
            const allotment = await this.prisma.allotment.findUnique({
                where: { studentId: student.id },
                include: { room: true },
            });
            if (!allotment)
                throw new Error('No room allotted to pay hostel fee');
            const capacity = allotment.room.capacity;
            if (capacity === 1)
                amount = 60000;
            else if (capacity === 2)
                amount = 56000;
            else if (capacity === 3)
                amount = 52000;
            else
                amount = 52000;
        }
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };
        try {
            const order = await this.razorpay.orders.create(options);
            const student = await this.prisma.student.findUnique({ where: { userId } });
            if (student) {
                await this.prisma.payment.create({
                    data: {
                        studentId: student.id,
                        amount: amount,
                        purpose: purpose,
                        status: 'PENDING',
                        txnRef: order.id,
                        gateway: 'RAZORPAY'
                    }
                });
            }
            return order;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, purpose, amount) {
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_key_secret')
            .update(body.toString())
            .digest('hex');
        if (expectedSignature === razorpaySignature) {
            const student = await this.prisma.student.findUnique({ where: { userId } });
            if (!student) {
                throw new common_1.BadRequestException('Student record not found for user');
            }
            return this.prisma.payment.create({
                data: {
                    studentId: student.id,
                    purpose,
                    status: client_1.PaymentStatus.COMPLETED,
                    amount,
                    txnRef: razorpayPaymentId,
                    gateway: 'RAZORPAY',
                },
            });
        }
        else {
            throw new common_1.BadRequestException('Invalid payment signature');
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map