"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting Migration: Consolidate AC Hostels');
    const sourceHostel = await prisma.hostel.findFirst({
        where: { name: 'AC Hostel Test' },
        include: { floors: { include: { rooms: { include: { allotments: true } } } } }
    });
    const targetHostel = await prisma.hostel.findFirst({
        where: { name: 'Dr. APJ Abdul Kalam Hostel' },
        include: { floors: { include: { rooms: true } } }
    });
    if (!sourceHostel) {
        console.log('Source Hostel "AC Hostel Test" not found. Nothing to migrate.');
        return;
    }
    if (!targetHostel) {
        console.error('Target Hostel "Dr. APJ Abdul Kalam Hostel" not found! Aborting.');
        return;
    }
    console.log(`Found Source: ${sourceHostel.name} (${sourceHostel.id})`);
    console.log(`Found Target: ${targetHostel.name} (${targetHostel.id})`);
    const allotmentsToMove = [];
    const sourceRooms = [];
    for (const floor of sourceHostel.floors) {
        for (const room of floor.rooms) {
            sourceRooms.push(room);
            if (room.allotments && room.allotments.length > 0) {
                allotmentsToMove.push(...room.allotments);
            }
        }
    }
    console.log(`Found ${allotmentsToMove.length} allotments to migrate.`);
    const targetRooms = [];
    for (const floor of targetHostel.floors) {
        for (const room of floor.rooms) {
            targetRooms.push({
                ...room,
                currentOccupancy: room.occupancy
            });
        }
    }
    let migratedCount = 0;
    for (const allotment of allotmentsToMove) {
        const targetRoom = targetRooms.find(r => r.currentOccupancy < r.capacity);
        if (!targetRoom) {
            console.error(`CRITICAL: No space left in ${targetHostel.name}! Cannot migrate allotment ${allotment.id}. Aborting migration of this student.`);
            continue;
        }
        console.log(`Migrating Allotment ${allotment.id} from Room (Source) to Room ${targetRoom.number} (Target)`);
        await prisma.allotment.update({
            where: { id: allotment.id },
            data: { roomId: targetRoom.id }
        });
        await prisma.room.update({
            where: { id: targetRoom.id },
            data: { occupancy: { increment: 1 } }
        });
        targetRoom.currentOccupancy++;
        migratedCount++;
    }
    console.log(`Migrated ${migratedCount}/${allotmentsToMove.length} allotments.`);
    console.log('Deleting "AC Hostel Test" and its structure...');
    const roomIds = sourceRooms.map(r => r.id);
    for (const room of sourceRooms) {
        const count = await prisma.allotment.count({ where: { roomId: room.id } });
        if (count > 0) {
            console.error(`Room ${room.number} still has allotments! Skipping deletion.`);
            continue;
        }
        await prisma.room.delete({ where: { id: room.id } });
    }
    for (const floor of sourceHostel.floors) {
        await prisma.floor.delete({ where: { id: floor.id } });
    }
    await prisma.hostel.delete({ where: { id: sourceHostel.id } });
    console.log('Successfully deleted "AC Hostel Test".');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=migrate-ac-hostel.js.map