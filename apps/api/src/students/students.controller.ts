import { Controller, Get, Post, Body, Patch, UseGuards, Request, Res, NotFoundException, Param, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { PdfService } from './pdf.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
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
    async getProfile(@Request() req: any) {
        const student = await this.studentsService.findOne(req.user.userId);
        if (!student) {
            // If the user exists but has no student record (e.g. Admin/Warden accessing student route)
            throw new NotFoundException('Student profile not found');
        }
        return student;
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
    @Post('calculate-distance')
    calculateDistance(@Body() body: { addressLine1: string, city: string, state: string, pincode: string }) {
        return this.studentsService.calculateDistance(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('me/request-edit')
    requestEditAccess(@Request() req: any, @Body() body: { reason: string }) {
        return this.studentsService.requestEditAccess(req.user.userId, body.reason);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me/edit-requests')
    getEditRequests(@Request() req: any) {
        return this.studentsService.getEditRequests(req.user.userId);
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

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Get('admin/edit-requests')
    getAllPendingEditRequests() {
        return this.studentsService.getAllPendingEditRequests();
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Post('admin/edit-requests/:id/approve')
    approveEditRequest(@Param('id') id: string) {
        return this.studentsService.approveEditRequest(id);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Post('admin/edit-requests/:id/reject')
    rejectEditRequest(@Param('id') id: string) {
        return this.studentsService.rejectEditRequest(id);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN, Role.WARDEN)
    @Get('admin/search')
    searchStudents(
        @Query('search') search?: string,
        @Query('hostelId') hostelId?: string,
        @Query('roomNumber') roomNumber?: string,
        @Query('year') year?: string
    ) {
        return this.studentsService.searchStudents({
            search,
            hostelId,
            roomNumber,
            year: year ? parseInt(year) : undefined
        });
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN, Role.WARDEN)
    @Get('admin/:userId')
    async getStudentByUserId(@Param('userId') userId: string) {
        const student = await this.studentsService.findOne(userId);
        if (!student) throw new NotFoundException('Student not found');
        return student;
    }
}
