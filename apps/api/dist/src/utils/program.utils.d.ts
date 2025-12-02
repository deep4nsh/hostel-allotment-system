import { Program } from '@prisma/client';
export declare const ProgramGroups: {
    BTECH: string;
    BSC_BDES: string;
    PG_MIX: string;
    PHD: string;
};
export declare function getProgramGroup(program: Program | null): string;
