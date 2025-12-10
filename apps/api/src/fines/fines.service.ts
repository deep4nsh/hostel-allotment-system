import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinesService {
  constructor(private prisma: PrismaService) {}

  async imposeFine(
    wardenId: string,
    data: {
      studentId: string;
      amount: number;
      reason: string;
      category: string;
    },
  ) {
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });
    if (!student) throw new Error('Student not found');

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

  async getFinesByStudent(studentId: string) {
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
}
