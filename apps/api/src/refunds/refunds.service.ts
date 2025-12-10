import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';

@Injectable()
export class RefundsService {
  private razorpay: any;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Test Key
      key_secret: process.env.RAZORPAY_KEY_SECRET || 's42BN13v3y7S0Y4aoY4aoY4a', // Mock Secret
    });
  }

  async createRequest(userId: string, paymentId: string, reason: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { allotment: true },
    });
    if (!student) throw new Error('Student not found');

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment || payment.studentId !== student.id)
      throw new Error('Invalid payment');

    if (payment.purpose === 'ALLOTMENT_REQUEST') {
      throw new Error('Allotment Request Fee is non-refundable.');
    }

    // New Rule: Hostel Fee refunds only allowed till 14th August of current year
    if (payment.purpose === 'HOSTEL_FEE') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const deadline = new Date(`${currentYear}-12-31`); // Extended to Dec 31st for testing/late cycle
      // const deadline = new Date(`${currentYear}-08-14`); // Original: August 14th

      // If strictly after Dec 31, reject
      if (now > deadline) {
        throw new Error(
          'Refund applications for Hostel Fees are closed for this session (Deadline: 31st December).',
        );
      }
    }

    let refundAmount = payment.amount;

    // Check for Allotment and apply deductions
    // Rules: <10 days: -3000, 10-30 days: -6000, >30 days: No refund
    if (student.allotment) {
      const issueDate = new Date(student.allotment.issueDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - issueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        refundAmount = 0;
      } else if (diffDays > 10) {
        refundAmount = Math.max(0, refundAmount - 6000);
      } else {
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

    // Auto-Trigger Mess Refund if Hostel Fee is being refunded/cancelled
    if (payment.purpose === 'HOSTEL_FEE') {
      const messPayment = await this.prisma.payment.findFirst({
        where: {
          studentId: student.id,
          purpose: 'MESS_FEE',
          status: 'COMPLETED',
        },
      });

      if (messPayment) {
        // Check if already requested
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
              amount: messPayment.amount, // Full Refund for Mess
              status: 'PENDING',
            },
          });
          console.log(
            `Auto-generated Mess Fee refund request for student ${student.id}`,
          );
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

  async processRefund(requestId: string, decision: 'APPROVED' | 'REJECTED') {
    const request = await this.prisma.refundRequest.findUnique({
      where: { id: requestId },
      include: { student: { include: { allotment: true } } },
    });
    if (!request) throw new Error('Request not found');

    if (request.status !== 'PENDING') {
      throw new Error('Request already processed');
    }

    if (decision === 'REJECTED') {
      return this.prisma.refundRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
    }

    // If APPROVED, trigger Razorpay Refund and Side Effects
    try {
      console.log(
        `[MOCK] Processing refund for ${request.amount} via Razorpay`,
      );

      // 1. Update Payment Status to REFUNDED
      // Find the payment associated with this feeType for this student
      // Ideally we should have linked paymentId in RefundRequest, but we can find it by type/student
      const payment = await this.prisma.payment.findFirst({
        where: {
          studentId: request.studentId,
          purpose: request.feeType as any,
          status: 'COMPLETED',
        },
      });

      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      // 2. Cancellation Side Effects (Hostel Fee only)
      if (request.feeType === 'HOSTEL_FEE') {
        const allotment = request.student.allotment;
        if (allotment) {
          // Free the room
          await this.prisma.room.update({
            where: { id: allotment.roomId },
            data: { occupancy: { decrement: 1 } }
          });

          // Delete Allotment
          await this.prisma.allotment.delete({
            where: { id: allotment.id }
          });
          console.log(`Cancelled allotment for student ${request.studentId}`);
        }
      }

      return this.prisma.refundRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });
    } catch (error) {
      console.error('Refund failed', error);
      throw new Error('Refund processing failed: ' + error.message);
    }
  }
}
