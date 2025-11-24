import { LettersService } from './letters.service';
import type { Response } from 'express';
export declare class LettersController {
    private readonly lettersService;
    constructor(lettersService: LettersService);
    downloadAllotmentLetter(req: any, res: Response): Promise<void>;
}
