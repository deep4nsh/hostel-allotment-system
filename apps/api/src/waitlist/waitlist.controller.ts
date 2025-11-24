import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
}
