import { Controller, Get, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { PdfService } from './pdf.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Res } from '@nestjs/common';

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
    updateProfile(@Request() req: any, @Body() data: any) {
        return this.studentsService.update(req.user.userId, data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me/slip')
    async downloadSlip(@Request() req: any, @Res() res: Response) {
        const student = await this.studentsService.findOne(req.user.userId);
        const buffer = await this.pdfService.generateRegistrationSlip(student);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=registration-slip.pdf',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
