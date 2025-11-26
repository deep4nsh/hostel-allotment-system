import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { RebatesService } from './rebates.service';
import { CreateRebateDto } from './dto/create-rebate.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('rebates')
export class RebatesController {
    constructor(private readonly rebatesService: RebatesService) { }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.STUDENT)
    @Post()
    create(@Request() req: any, @Body() createRebateDto: CreateRebateDto) {
        return this.rebatesService.create(req.user.userId, createRebateDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.STUDENT)
    @Get('me')
    findAllMy(@Request() req: any) {
        return this.rebatesService.findAllForStudent(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.WARDEN, Role.ADMIN)
    @Get('pending')
    findAllPending(@Request() req: any) {
        return this.rebatesService.findAllPendingForWarden(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.WARDEN, Role.ADMIN)
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: 'APPROVED' | 'REJECTED' }) {
        return this.rebatesService.updateStatus(id, body.status);
    }
}
