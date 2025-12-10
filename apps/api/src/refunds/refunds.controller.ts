import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('refunds')
@UseGuards(AuthGuard('jwt'))
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  createRequest(
    @Request() req: any,
    @Body() body: { paymentId: string; reason: string },
  ) {
    return this.refundsService.createRequest(
      req.user.userId,
      body.paymentId,
      body.reason,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.refundsService.findAll();
  }

  @Patch(':id/decide')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  decideRefund(
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVED' | 'REJECTED' },
  ) {
    return this.refundsService.processRefund(id, body.decision);
  }
}
