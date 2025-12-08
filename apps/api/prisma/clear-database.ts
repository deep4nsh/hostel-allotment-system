import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting full database cleanup for Students...');

    // 1. Delete dependent requests
    console.log('Deleting requests...');
    await prisma.roomSurrenderRequest.deleteMany({});
    await prisma.roomChangeRequest.deleteMany({});
    await prisma.hostelSwapRequest.deleteMany({});
    await prisma.maintenanceRequest.deleteMany({});
    await prisma.messRebateRequest.deleteMany({});
    await prisma.profileEditRequest.deleteMany({});
    await prisma.refundRequest.deleteMany({});

    // 2. Delete Allotments and Reset Rooms
    console.log('Deleting allotments and resetting room occupancy...');
    await prisma.allotment.deleteMany({});
    // Reset all room occupancies to 0
    await prisma.room.updateMany({
        data: { occupancy: 0 }
    });

    // 3. Delete Waitlist
    console.log('Deleting waitlist...');
    await prisma.waitlistEntry.deleteMany({});

    // 4. Delete Payments & Documents
    console.log('Deleting payments and documents...');
    await prisma.payment.deleteMany({});
    await prisma.document.deleteMany({});

    // 5. Delete Preferences
    console.log('Deleting preferences...');
    await prisma.preference.deleteMany({});

    // 6. Delete Students
    console.log('Deleting student profiles...');
    // We need to delete students first because of FK constraints from Student table to User?
    // Actually User is parent. Student -> User.
    // But other tables pointed to Student. We cleared them.
    await prisma.student.deleteMany({});

    // 7. Delete Users (Only Students)
    console.log('Deleting student user accounts...');
    // We must ensure we don't delete ADMIN or WARDEN
    // Also need to delete AuditLogs for these users first
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
                // double safety: id in the list we found
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
