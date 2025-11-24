import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { AllotmentService } from './allotment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('allotment')
export class AllotmentController {
    constructor(private readonly allotmentService: AllotmentService) { }

    @Post('trigger/:hostelId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    triggerAllotment(@Param('hostelId') hostelId: string) {
        return this.allotmentService.runAllotment(hostelId);
    }

    @Get('list/:hostelId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    getAllotments(@Param('hostelId') hostelId: string) {
        return this.allotmentService.getAllotments(hostelId);
    }
}
