import { Controller, Get, Post, Body, Patch, UseGuards, Request, Res } from '@nestjs/common';
import { StudentsService } from './students.service';
import { PdfService } from './pdf.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentsController {
    constructor(
        private readonly studentsService: StudentsService,
        private readonly pdfService: PdfService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req: any) {
        return this.studentsService.findOne(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('me')
    updateProfile(@Request() req: any, @Body() updateStudentDto: UpdateStudentDto) {
        return this.studentsService.updateProfile(req.user.userId, updateStudentDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('me/generate-id')
    generateId(@Request() req: any) {
        return this.studentsService.generateUniqueId(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me/slip')
    async downloadSlip(@Request() req: any, @Res() res: Response) {
        try {
            const student = await this.studentsService.findOne(req.user.userId);
            const buffer = await this.pdfService.generateRegistrationSlip(student);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=registration-slip.pdf',
                'Content-Length': buffer.length,
            });

            res.end(buffer);
        } catch (error) {
            console.error('Error downloading slip:', error);
            res.status(500).json({ message: 'Failed to generate registration slip' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('preferences')
    savePreferences(@Request() req: any, @Body() body: { preferences: any[] }) {
        return this.studentsService.savePreferences(req.user.userId, body.preferences);
    }
}
