import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Searching for Kalpana Chawla Hostel...');
    const hostel = await prisma.hostel.findFirst({
        where: {
            name: {
                contains: 'Kalpana',
                mode: 'insensitive',
            },
        },
    });

    if (hostel) {
        console.log(`Found hostel: ${hostel.name} (ID: ${hostel.id})`);

        // 1. Find Floors
        const floors = await prisma.floor.findMany({
            where: { hostelId: hostel.id },
            include: { rooms: true }
        });

        for (const floor of floors) {
            console.log(`Processing Floor: ${floor.number} (ID: ${floor.id})`);

            // 2. Delete Rooms
            if (floor.rooms.length > 0) {
                // Delete allotments if any exist for these rooms?
                // Assuming no allotments for now, or we should delete them too.
                // Let's delete ALL rooms for this floor.
                const roomIds = floor.rooms.map(r => r.id);

                // Delete Allotments for these rooms first
                await prisma.allotment.deleteMany({
                    where: { roomId: { in: roomIds } }
                });

                await prisma.room.deleteMany({
                    where: { floorId: floor.id }
                });
                console.log(`Deleted ${floor.rooms.length} rooms (and their allotments) for floor ${floor.number}`);
            }

            // 3. Delete Floor
            await prisma.floor.delete({
                where: { id: floor.id }
            });
            console.log(`Deleted Floor ${floor.number}`);
        }

        // 4. Delete Hostel
        await prisma.hostel.delete({
            where: { id: hostel.id },
        });
        console.log('Successfully deleted Kalpana Chawla Hostel and all related records.');
    } else {
        console.log('Kalpana Chawla Hostel not found in the database.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
