import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { Category, Gender, Program } from '@prisma/client';
import { createWorker } from 'tesseract.js';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

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
      },
    });

    return {
      message: 'File uploaded successfully',
      document,
    };
  }

  async findAllByStudent(userId: string) {
    return this.prisma.document.findMany({
      where: {
        student: { userId },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async processOcr(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new Error('Student not found');

    // 1. Find the Admission Letter
    // 1. Find the Admission Letter
    console.log(`Looking for ADMISSION_LETTER for studentId: ${student.id}`);
    const admissionDoc = await this.prisma.document.findFirst({
      where: { studentId: student.id, kind: 'ADMISSION_LETTER' },
      orderBy: { uploadedAt: 'desc' },
    });

    if (!admissionDoc) {
      console.error(`Admission Letter not found for studentId: ${student.id}`);
      throw new Error('Admission Letter not found. Please upload it first.');
    }
    console.log(
      `Found document: ${admissionDoc.id}, URL: ${admissionDoc.fileUrl}`,
    );

    // 2. Resolve File Path
    // fileUrl is like /uploads/filename.ext, we need absolute path
    const fileName = path.basename(admissionDoc.fileUrl);
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    if (!fs.existsSync(filePath)) throw new Error('File not found on server');

    // 3. Perform OCR
    let text = '';
    const tempImagePath = null;

    try {
      // Check for PDF
      if (path.extname(filePath).toLowerCase() === '.pdf') {
        console.log('Processing PDF with pdf-parse...');
        const dataBuffer = fs.readFileSync(filePath);

        const pdf = require('pdf-parse');
        const data = await pdf(dataBuffer);
        text = data.text;
        console.log('PDF Text Extracted:', text.substring(0, 50) + '...');
      } else {
        // Image OCR
        const worker = await createWorker('eng');
        const result = await worker.recognize(filePath);
        text = result.data.text;
        await worker.terminate();
        console.log('OCR Success:', text.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('OCR Failed:', error);
      return {
        success: false,
        message:
          'OCR failed to process the document. Please ensure it is clear and legible.',
        data: null,
      };
    } finally {
      // Cleanup temp file
      if (tempImagePath && fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
    }

    // 4. Parse Data (Regex)
    // Heuristic patterns to find data in the text
    const extracted = {
      name: text.match(/Name[:\s]+([A-Za-z\s]+)/i)?.[1]?.trim(),
      uniqueId: text
        .match(/(Roll|Application|Registration)\s*No[:\s]+([A-Z0-9]+)/i)?.[2]
        ?.trim(),
      program: text.match(
        /(B\.?Tech|B\.?Sc|B\.?Des|M\.?Tech|M\.?Sc|MCA|PhD)/i,
      )?.[0],
      category: text.match(/(Delhi|Outside\s*Delhi)/i)?.[0],
      guardianName: text.match(/Guardian[:\s]+([A-Za-z\s]+)/i)?.[1]?.trim(),
      guardianPhone: text.match(/Phone[:\s]+(\d{10})/i)?.[1]?.trim(),
    };

    // Normalize Program
    let programEnum = null;
    if (extracted.program) {
      const p = extracted.program.toUpperCase().replace('.', '');
      if (p.includes('BTECH')) programEnum = Program.BTECH;
      else if (p.includes('BSC')) programEnum = Program.BSC;
      else if (p.includes('BDES')) programEnum = Program.BDES;
      else if (p.includes('MTECH')) programEnum = Program.MTECH;
      else if (p.includes('MSC')) programEnum = Program.MSC;
      else if (p.includes('MCA')) programEnum = Program.MCA;
      else if (p.includes('PHD')) programEnum = Program.PHD;
    }

    // Normalize Category
    let categoryEnum = null;
    if (extracted.category) {
      if (extracted.category.toLowerCase().includes('outside'))
        categoryEnum = Category.OUTSIDE_DELHI;
      else categoryEnum = Category.DELHI;
    }

    // 5. Update Student
    const updatedStudent = await this.prisma.student.update({
      where: { id: student.id },
      data: {
        name: student.name || extracted.name,
        uniqueId: student.uniqueId || extracted.uniqueId,
        program: programEnum || student.program, // Only update if found
        category: categoryEnum || student.category,
        guardianName: student.guardianName || extracted.guardianName,
        guardianPhone: student.guardianPhone || extracted.guardianPhone,
      },
    });

    return {
      success: true,
      message: 'OCR processing complete.',
      data: { ...extracted, textSnippet: text.substring(0, 100) },
    };
  }

  async deleteDocument(userId: string, type: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new Error('Student not found');

    const document = await this.prisma.document.findFirst({
      where: { studentId: student.id, kind: type },
      orderBy: { uploadedAt: 'desc' },
    });

    if (!document) throw new Error('Document not found');

    // Delete file from disk
    const fileName = path.basename(document.fileUrl);
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await this.prisma.document.delete({
      where: { id: document.id },
    });

    return { message: 'Document deleted successfully' };
  }
}
