import { Program } from '@prisma/client';

export const ProgramGroups = {
    BTECH: 'BTECH',
    BSC_BDES: 'BSC_BDES',
    PG_MIX: 'PG_MIX', // MTECH + MSC + MCA
    PHD: 'PHD',
};

export function getProgramGroup(program: Program | null): string {
    if (!program) return 'UNKNOWN';

    switch (program) {
        case Program.BTECH:
            return ProgramGroups.BTECH;
        case Program.BSC:
        case Program.BDES:
            return ProgramGroups.BSC_BDES;
        case Program.MTECH:
        case Program.MSC:
        case Program.MCA:
            return ProgramGroups.PG_MIX;
        case Program.PHD:
            return ProgramGroups.PHD;
        default:
            return 'UNKNOWN';
    }
}
