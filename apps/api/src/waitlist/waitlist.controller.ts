import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('waitlist')
export class WaitlistController {
    constructor(private readonly waitlistService: WaitlistService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getWaitlistPosition(@Request() req: any) {
        return this.waitlistService.getWaitlistPosition(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('join')
    joinWaitlist(@Request() req: any) {
        return this.waitlistService.joinWaitlist(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin')
    getPriorityWaitlist() {
        // TODO: Add Admin Guard
        return this.waitlistService.getPriorityWaitlist();
    }
}
