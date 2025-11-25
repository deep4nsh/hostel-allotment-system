import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentPurpose } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('create-order')
    async createOrder(@Request() req: any, @Body() body: { purpose: 'REGISTRATION' | 'SEAT_BOOKING' | 'MESS_FEE' | 'HOSTEL_FEE' }) {
        if (!body.purpose) {
            throw new BadRequestException('Purpose is required');
        }
        return this.paymentsService.createOrder(req.user.userId, body.purpose);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('verify')
    async verifyPayment(
        @Request() req: any,
        @Body()
        body: {
            razorpayOrderId: string;
            razorpayPaymentId: string;
            razorpaySignature: string;
            purpose: PaymentPurpose;
            amount: number;
        },
    ) {
        return this.paymentsService.verifyPayment(
            body.razorpayOrderId,
            body.razorpayPaymentId,
            body.razorpaySignature,
            req.user.userId,
            body.purpose,
            body.amount,
        );
    }
    @UseGuards(AuthGuard('jwt'))
    @Post('mock-verify')
    async mockVerify(@Request() req: any, @Body() body: { purpose: PaymentPurpose; amount: number }) {
        return this.paymentsService.mockVerify(req.user.userId, body.purpose, body.amount);
    }
}
