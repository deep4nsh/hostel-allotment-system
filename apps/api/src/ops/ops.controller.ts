import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OpsService } from './ops.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('ops')
export class OpsController {
  constructor(private readonly opsService: OpsService) { }

  @Get('health')
  getHealth() {
    return this.opsService.getHealth();
  }

  @Post('backup')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  triggerBackup() {
    return this.opsService.triggerBackup();
  }

  @Get('analytics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getAnalytics() {
    return this.opsService.getAnalytics();
  }
}
