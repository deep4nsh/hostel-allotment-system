import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentPurpose } from '@prisma/client';
import { PdfService } from '../students/pdf.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly pdfService: PdfService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/receipt')
  async getReceipt(
    @Request() req: any,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const payment = await this.paymentsService.getPaymentForReceipt(
      id,
      req.user.userId,
    );
    const buffer = await this.pdfService.generatePaymentReceipt(
      payment,
      payment.student,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receipt-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create-order')
  @Post('create-order')
  async createOrder(
    @Request() req: any,
    @Body()
    body: {
      purpose:
        | 'REGISTRATION'
        | 'SEAT_BOOKING'
        | 'MESS_FEE'
        | 'HOSTEL_FEE'
        | 'ALLOTMENT_REQUEST'
        | 'FINE';
      fineId?: string;
    },
  ) {
    if (!body.purpose) {
      throw new BadRequestException('Purpose is required');
    }
    return this.paymentsService.createOrder(
      req.user.userId,
      body.purpose,
      body.fineId,
    );
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
  async mockVerify(
    @Request() req: any,
    @Body() body: { purpose: PaymentPurpose; amount: number },
  ) {
    return this.paymentsService.mockVerify(
      req.user.userId,
      body.purpose,
      body.amount,
    );
  }
}
