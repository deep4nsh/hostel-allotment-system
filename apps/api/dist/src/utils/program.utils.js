"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramGroups = void 0;
exports.getProgramGroup = getProgramGroup;
const client_1 = require("@prisma/client");
exports.ProgramGroups = {
    BTECH: 'BTECH',
    BSC_BDES: 'BSC_BDES',
    PG_MIX: 'PG_MIX',
    PHD: 'PHD',
};
function getProgramGroup(program) {
    if (!program)
        return 'UNKNOWN';
    switch (program) {
        case client_1.Program.BTECH:
            return exports.ProgramGroups.BTECH;
        case client_1.Program.BSC:
        case client_1.Program.BDES:
            return exports.ProgramGroups.BSC_BDES;
        case client_1.Program.MTECH:
        case client_1.Program.MSC:
        case client_1.Program.MCA:
            return exports.ProgramGroups.PG_MIX;
        case client_1.Program.PHD:
            return exports.ProgramGroups.PHD;
        default:
            return 'UNKNOWN';
    }
}
//# sourceMappingURL=program.utils.js.map