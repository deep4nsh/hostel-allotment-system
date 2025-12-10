import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { FinesService } from './fines.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async imposeFine(@Request() req: any, @Body() body: any) {
    // ideally check role === WARDEN
    return this.finesService.imposeFine(req.user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async getMyFines(@Request() req: any) {
    return this.finesService.getFinesByStudent(req.user.studentId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getAllFines() {
    return this.finesService.getAllFines();
  }
}
