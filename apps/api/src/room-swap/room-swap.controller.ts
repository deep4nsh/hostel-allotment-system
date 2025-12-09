import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RoomSwapService } from './room-swap.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('room-swap')
@UseGuards(AuthGuard('jwt'))
export class RoomSwapController {
    constructor(private readonly roomSwapService: RoomSwapService) { }

    @Post('list')
    createListing(@Request() req: any) {
        return this.roomSwapService.createListing(req.user.userId);
    }

    @Delete('list')
    removeListing(@Request() req: any) {
        return this.roomSwapService.removeListing(req.user.userId);
    }

    @Get('my')
    getMyListing(@Request() req: any) {
        return this.roomSwapService.getMyListing(req.user.userId);
    }

    @Get('list')
    getListings(@Request() req: any) {
        return this.roomSwapService.getListings(req.user.userId);
    }

    @Post('invite')
    sendInvite(@Request() req: any, @Body() body: { targetStudentId: string }) {
        return this.roomSwapService.sendInvite(req.user.userId, body.targetStudentId);
    }

    @Get('invites')
    getInvites(@Request() req: any) {
        return this.roomSwapService.getMyInvites(req.user.userId);
    }

    @Post('invite/:id/respond')
    respondToInvite(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { status: 'ACCEPTED' | 'REJECTED' }
    ) {
        return this.roomSwapService.respondToInvite(req.user.userId, id, body.status);
    }
}
