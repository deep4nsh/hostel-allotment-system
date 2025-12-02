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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const client_1 = require("@prisma/client");
const tesseract_js_1 = require("tesseract.js");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadFile(userId, file, type) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new Error('Student not found');
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        const fileName = `${student.id}_${type}_${Date.now()}${path.extname(file.originalname)}`;
        const filePath = path.join(uploadDir, fileName);
        const fileUrl = `/uploads/${fileName}`;
        fs.writeFileSync(filePath, file.buffer);
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
    async findAllByStudent(userId) {
        return this.prisma.document.findMany({
            where: {
                student: { userId }
            },
            orderBy: { uploadedAt: 'desc' }
        });
    }
    async processOcr(userId) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new Error('Student not found');
        console.log(`Looking for ADMISSION_LETTER for studentId: ${student.id}`);
        const admissionDoc = await this.prisma.document.findFirst({
            where: { studentId: student.id, kind: 'ADMISSION_LETTER' },
            orderBy: { uploadedAt: 'desc' }
        });
        if (!admissionDoc) {
            console.error(`Admission Letter not found for studentId: ${student.id}`);
            throw new Error('Admission Letter not found. Please upload it first.');
        }
        console.log(`Found document: ${admissionDoc.id}, URL: ${admissionDoc.fileUrl}`);
        const fileName = path.basename(admissionDoc.fileUrl);
        const filePath = path.join(process.cwd(), 'uploads', fileName);
        if (!fs.existsSync(filePath))
            throw new Error('File not found on server');
        let text = '';
        try {
            const worker = await (0, tesseract_js_1.createWorker)('eng');
            const result = await worker.recognize(filePath);
            text = result.data.text;
            await worker.terminate();
            console.log('OCR Success:', text.substring(0, 50) + '...');
        }
        catch (error) {
            console.error('OCR Failed:', error);
            return {
                success: false,
                message: "OCR failed to process the image.",
                data: null
            };
        }
        const extracted = {
            name: text.match(/Name[:\s]+([A-Za-z\s]+)/i)?.[1]?.trim(),
            uniqueId: text.match(/(Roll|Application|Registration)\s*No[:\s]+([A-Z0-9]+)/i)?.[2]?.trim(),
            program: text.match(/(B\.?Tech|B\.?Sc|B\.?Des|M\.?Tech|M\.?Sc|MCA|PhD)/i)?.[0],
            category: text.match(/(Delhi|Outside\s*Delhi)/i)?.[0],
            guardianName: text.match(/Guardian[:\s]+([A-Za-z\s]+)/i)?.[1]?.trim(),
            guardianPhone: text.match(/Phone[:\s]+(\d{10})/i)?.[1]?.trim(),
        };
        let programEnum = null;
        if (extracted.program) {
            const p = extracted.program.toUpperCase().replace('.', '');
            if (p.includes('BTECH'))
                programEnum = client_1.Program.BTECH;
            else if (p.includes('BSC'))
                programEnum = client_1.Program.BSC;
            else if (p.includes('BDES'))
                programEnum = client_1.Program.BDES;
            else if (p.includes('MTECH'))
                programEnum = client_1.Program.MTECH;
            else if (p.includes('MSC'))
                programEnum = client_1.Program.MSC;
            else if (p.includes('MCA'))
                programEnum = client_1.Program.MCA;
            else if (p.includes('PHD'))
                programEnum = client_1.Program.PHD;
        }
        let categoryEnum = null;
        if (extracted.category) {
            if (extracted.category.toLowerCase().includes('outside'))
                categoryEnum = client_1.Category.OUTSIDE_DELHI;
            else
                categoryEnum = client_1.Category.DELHI;
        }
        const updatedStudent = await this.prisma.student.update({
            where: { id: student.id },
            data: {
                name: student.name || extracted.name,
                uniqueId: student.uniqueId || extracted.uniqueId,
                program: programEnum || student.program,
                category: categoryEnum || student.category,
                guardianName: student.guardianName || extracted.guardianName,
                guardianPhone: student.guardianPhone || extracted.guardianPhone,
            }
        });
        return {
            success: true,
            message: "OCR processing complete.",
            data: { ...extracted, textSnippet: text.substring(0, 100) }
        };
    }
    async deleteDocument(userId, type) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student)
            throw new Error('Student not found');
        const document = await this.prisma.document.findFirst({
            where: { studentId: student.id, kind: type },
            orderBy: { uploadedAt: 'desc' }
        });
        if (!document)
            throw new Error('Document not found');
        const fileName = path.basename(document.fileUrl);
        const filePath = path.join(process.cwd(), 'uploads', fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await this.prisma.document.delete({
            where: { id: document.id }
        });
        return { message: 'Document deleted successfully' };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map