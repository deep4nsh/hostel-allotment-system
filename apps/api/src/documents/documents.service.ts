import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) { }

  async uploadFile(userId: string, file: Express.Multer.File, type: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new Error('Student not found');

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const fileName = `${student.id}_${type}_${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    fs.writeFileSync(filePath, file.buffer);

    // Save to Database
    const document = await this.prisma.document.create({
      data: {
        studentId: student.id,
        kind: type,
        fileUrl: fileUrl,
      }
    });

    return {
      message: 'File uploaded successfully',
      document
    };
  }

  async findAllByStudent(userId: string) {
    return this.prisma.document.findMany({
      where: {
        student: { userId }
      },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async processOcr(userId: string) {
    // Mock OCR Logic
    return {
      success: true,
      data: {
        name: 'Deepansh (Extracted)',
        rank: 1542,
        category: 'DELHI_GEN',
        applicationNo: 'JAC2024001'
      }
    };
  }
}
