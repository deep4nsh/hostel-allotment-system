"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
        const floors = await prisma.floor.findMany({
            where: { hostelId: hostel.id },
            include: { rooms: true }
        });
        for (const floor of floors) {
            console.log(`Processing Floor: ${floor.number} (ID: ${floor.id})`);
            if (floor.rooms.length > 0) {
                const roomIds = floor.rooms.map(r => r.id);
                await prisma.allotment.deleteMany({
                    where: { roomId: { in: roomIds } }
                });
                await prisma.room.deleteMany({
                    where: { floorId: floor.id }
                });
                console.log(`Deleted ${floor.rooms.length} rooms (and their allotments) for floor ${floor.number}`);
            }
            await prisma.floor.delete({
                where: { id: floor.id }
            });
            console.log(`Deleted Floor ${floor.number}`);
        }
        await prisma.hostel.delete({
            where: { id: hostel.id },
        });
        console.log('Successfully deleted Kalpana Chawla Hostel and all related records.');
    }
    else {
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
//# sourceMappingURL=delete-kalpana.js.map