import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  create(@Request() req: any, @Body() body: { category: string; description: string }) {
    return this.complaintsService.create(req.user.userId, body);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  findAllMy(@Request() req: any) {
    return this.complaintsService.findAllByStudent(req.user.userId);
  }

  @Get('warden')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.WARDEN, Role.ADMIN)
  findAllForWarden(@Request() req: any) {
    return this.complaintsService.findAllForWarden(req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.WARDEN, Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.complaintsService.updateStatus(id, body.status);
  }
}
