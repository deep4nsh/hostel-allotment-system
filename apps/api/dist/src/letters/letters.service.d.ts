import { PrismaService } from '../prisma/prisma.service';
export declare class LettersService {
    private prisma;
    constructor(prisma: PrismaService);
    generateAllotmentLetter(userId: string): Promise<Buffer>;
}
