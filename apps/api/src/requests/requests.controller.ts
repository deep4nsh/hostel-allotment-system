import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
  Param,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('change')
  async requestChange(
    @Request() req: any,
    @Body() body: { reason: string; preferredHostelId?: string },
  ) {
    return this.requestsService.createChangeRequest(req.user.studentId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('surrender')
  async requestSurrender(
    @Request() req: any,
    @Body() body: { reason: string; clearanceUrl?: string },
  ) {
    return this.requestsService.createSurrenderRequest(
      req.user.studentId,
      body,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('possession')
  async confirmPossession(@Request() req: any) {
    return this.requestsService.confirmPossession(req.user.studentId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async getMyRequests(@Request() req: any) {
    return this.requestsService.getMyRequests(req.user.studentId);
  }

  // Warden Endpoints
  @Get('warden/change')
  async getAllChangeRequests() {
    return this.requestsService.getAllChangeRequests();
  }

  @Patch('change/:id/status')
  async updateChangeStatus(
    @Param('id') id: string,
    @Body() body: { status: string; comment?: string },
  ) {
    return this.requestsService.updateChangeRequestStatus(
      id,
      body.status,
      body.comment,
    );
  }

  @Get('warden/surrender')
  async getAllSurrenderRequests() {
    return this.requestsService.getAllSurrenderRequests();
  }

  @Patch('surrender/:id/status')
  async updateSurrenderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; comment?: string },
  ) {
    return this.requestsService.updateSurrenderRequestStatus(
      id,
      body.status,
      body.comment,
    );
  }
}
