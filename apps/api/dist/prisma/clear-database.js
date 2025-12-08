"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting full database cleanup for Students...');
    console.log('Deleting requests...');
    await prisma.roomSurrenderRequest.deleteMany({});
    await prisma.roomChangeRequest.deleteMany({});
    await prisma.hostelSwapRequest.deleteMany({});
    await prisma.maintenanceRequest.deleteMany({});
    await prisma.messRebateRequest.deleteMany({});
    await prisma.profileEditRequest.deleteMany({});
    await prisma.refundRequest.deleteMany({});
    console.log('Deleting allotments and resetting room occupancy...');
    await prisma.allotment.deleteMany({});
    await prisma.room.updateMany({
        data: { occupancy: 0 }
    });
    console.log('Deleting waitlist...');
    await prisma.waitlistEntry.deleteMany({});
    console.log('Deleting payments and documents...');
    await prisma.payment.deleteMany({});
    await prisma.document.deleteMany({});
    console.log('Deleting preferences...');
    await prisma.preference.deleteMany({});
    console.log('Deleting student profiles...');
    await prisma.student.deleteMany({});
    console.log('Deleting student user accounts...');
    const studentUsers = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true }
    });
    const studentUserIds = studentUsers.map(u => u.id);
    if (studentUserIds.length > 0) {
        await prisma.auditLog.deleteMany({
            where: { actorId: { in: studentUserIds } }
        });
        await prisma.user.deleteMany({
            where: {
                role: 'STUDENT',
                id: { in: studentUserIds }
            }
        });
    }
    console.log('Cleanup complete! All student data wiped and rooms reset.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=clear-database.js.map