import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteStudent(email: string) {
    if (!email) {
        console.error('Please provide an email address.');
        console.log('Usage: npx ts-node prisma/delete-student.ts <email>');
        process.exit(1);
    }

    console.log(`Searching for user with email: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            student: {
                include: {
                    allotment: true,
                    waitlist: true,
                    preferences: true,
                    payments: true,
                    documents: true,
                    complaints: true,
                    roomChangeRequests: true,
                    hostelSwapRequests: true,
                    roomSurrenderRequests: true,
                    rebateRequests: true,
                },
            },
        },
    });

    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }

    console.log(`Found User ID: ${user.id}`);
    if (user.student) {
        console.log(`Found Student ID: ${user.student.id} (${user.student.name})`);
    } else {
        console.log('No associated Student profile found. Deleting User only...');
        await prisma.user.delete({ where: { id: user.id } });
        console.log('User deleted successfully.');
        return;
    }

    const studentId = user.student.id;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Handle Allotment & Occupancy
            if (user.student?.allotment) {
                console.log('Removing Allotment and updating Room Occupancy...');
                const allotment = user.student.allotment;
                await tx.allotment.delete({ where: { id: allotment.id } });

                // Decrement Room Occupancy
                await tx.room.update({
                    where: { id: allotment.roomId },
                    data: { occupancy: { decrement: 1 } }
                });
            }

            // 2. Delete Dependencies
            console.log('Deleting Preferences...');
            await tx.preference.deleteMany({ where: { studentId } });

            console.log('Deleting Waitlist Entry...');
            await tx.waitlistEntry.deleteMany({ where: { studentId } });

            console.log('Deleting Payments...');
            await tx.payment.deleteMany({ where: { studentId } });

            console.log('Deleting Documents...');
            await tx.document.deleteMany({ where: { studentId } });

            console.log('Deleting Requests (Room Change, Swap, Surrender, Complaints, Rebates)...');
            await tx.roomChangeRequest.deleteMany({ where: { studentId } });
            await tx.hostelSwapRequest.deleteMany({ where: { studentId } });
            await tx.roomSurrenderRequest.deleteMany({ where: { studentId } });
            await tx.maintenanceRequest.deleteMany({ where: { studentId } });
            await tx.messRebateRequest.deleteMany({ where: { studentId } });
            await tx.profileEditRequest.deleteMany({ where: { studentId } });
            await tx.refundRequest.deleteMany({ where: { studentId } });

            console.log('Deleting Audit Logs...');
            await tx.auditLog.deleteMany({ where: { actorId: user.id } });

            // 3. Delete Student
            console.log('Deleting Student Profile...');
            await tx.student.delete({ where: { id: studentId } });

            // 4. Delete User
            console.log('Deleting User Account...');
            await tx.user.delete({ where: { id: user.id } });
        });

        console.log(`\nSUCCESS: Student '${user.student?.name}' (${email}) has been permanently deleted.`);
    } catch (error) {
        console.error('Error deleting student:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
deleteStudent(email);
