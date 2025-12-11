import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
  Res,
  NotFoundException,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { PdfService } from './pdf.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { UpdateStudentDto } from './dto/update-student.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: Role;
  };
}

import { CreatePreferenceDto } from './dto/create-preference.dto';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly pdfService: PdfService,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req: RequestWithUser) {
    const student = await this.studentsService.findOne(req.user.userId);
    if (!student) {
      // If the user exists but has no student record (e.g. Admin/Warden accessing student route)
      throw new NotFoundException('Student profile not found');
    }
    return student;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.updateProfile(
      req.user.userId,
      updateStudentDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me/generate-id')
  generateId(@Request() req: RequestWithUser) {
    return this.studentsService.generateUniqueId(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('calculate-distance')
  calculateDistance(
    @Body()
    body: {
      addressLine1: string;
      city: string;
      state: string;
      pincode: string;
    },
  ) {
    return this.studentsService.calculateDistance(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me/request-edit')
  requestEditAccess(
    @Request() req: RequestWithUser,
    @Body() body: { reason: string },
  ) {
    return this.studentsService.requestEditAccess(req.user.userId, body.reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/edit-requests')
  getEditRequests(@Request() req: RequestWithUser) {
    return this.studentsService.getEditRequests(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/slip')
  async downloadSlip(@Request() req: RequestWithUser, @Res() res: Response) {
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
      // Log only in dev or use a logger
      res.status(500).json({ message: 'Failed to generate registration slip' });
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me/ack-possession')
  acknowledgePossession(@Request() req: RequestWithUser) {
    return this.studentsService.acknowledgePossession(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('preferences')
  savePreferences(
    @Request() req: RequestWithUser,
    @Body() body: { preferences: any[] },
  ) {
    return this.studentsService.savePreferences(
      req.user.userId,
      body.preferences,
    );
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
    @Query('year') year?: string,
  ) {
    return this.studentsService.searchStudents({
      search,
      hostelId,
      roomNumber,
      year: year ? parseInt(year) : undefined,
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

  @UseGuards(AuthGuard('jwt'))
  @Get('me/id-card')
  async downloadIdCard(@Request() req: RequestWithUser, @Res() res: Response) {
    const student = await this.studentsService.findOne(req.user.userId);

    // Check if eligible (e.g., has allotment and possession acknowledged)
    const allotment = (student as any)?.allotment;
    if (!allotment) {
      throw new NotFoundException('No confirmed allotment found for ID Card');
    }

    if (!allotment.isPossessed) {
      throw new BadRequestException('You must acknowledge possession before downloading ID Card');
    }

    const pdfBuffer = await this.pdfService.generateIdCard(student);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=hostel-id-card.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/id-cards/bulk')
  async downloadBatchIdCards(
    @Query('hostelId') hostelId: string,
    @Res() res: Response
  ) {
    if (!hostelId) throw new BadRequestException('Hostel ID is required');

    const students = await this.studentsService.getBatchStudentsForIdCard(hostelId);

    if (!students || students.length === 0) {
      throw new NotFoundException('No students found for this hostel');
    }

    const pdfBuffer = await this.pdfService.generateBatchIdCards(students);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=hostel-id-cards-${hostelId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
