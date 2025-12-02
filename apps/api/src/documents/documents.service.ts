import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { Category, Gender, Program } from '@prisma/client';

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
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new Error('Student not found');

    // --- MOCK OCR EXTRACTION ---
    // In a real app, we would fetch the ADMISSION_LETTER document and send it to Tesseract/Vision API.
    // Here, we simulate finding data on the letter.

    const mockExtractedData = {
      name: "Deepansh Student",
      uniqueId: `JAC${new Date().getFullYear()}001`, // Simulated Roll No/App No
      category: Category.OUTSIDE_DELHI, // Auto-detect category
      gender: Gender.MALE,
      program: Program.BTECH,
      year: 1,
      // Mocking some guardian info that might be on the form
      guardianName: "Parent Name",
      guardianPhone: "9876543210"
    };

    // --- AUTO-FILL DASHBOARD (Update Student Record) ---
    // Only update fields that are currently empty or explicitly override
    await this.prisma.student.update({
      where: { id: student.id },
      data: {
        name: student.name || mockExtractedData.name, // Keep existing if set, or use extracted
        uniqueId: student.uniqueId || mockExtractedData.uniqueId,
        category: mockExtractedData.category, // Trust the document for category
        program: mockExtractedData.program,
        year: mockExtractedData.year,
        gender: mockExtractedData.gender,
        guardianName: student.guardianName || mockExtractedData.guardianName,
        guardianPhone: student.guardianPhone || mockExtractedData.guardianPhone,
      }
    });

    return {
      success: true,
      message: "Admission Letter scanned and profile updated successfully.",
      data: mockExtractedData
    };
  }
}
