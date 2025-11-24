import { WaitlistService } from './waitlist.service';
export declare class WaitlistController {
    private readonly waitlistService;
    constructor(waitlistService: WaitlistService);
    getWaitlistPosition(req: any): Promise<{
        position: null;
        status: string;
    } | {
        position: number;
        status: string;
    }>;
}
