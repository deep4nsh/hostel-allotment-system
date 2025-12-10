
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Migration: Consolidate AC Hostels');

    // 1. Find Hostels
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

    // 2. Identify Allotments to Move
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

    // 3. Identify Target Rooms
    const targetRooms = [];
    for (const floor of targetHostel.floors) {
        for (const room of floor.rooms) {
            // Simple logic: we need vacancies.
            // But we will re-fetch or track occupancy locally to be precise.
            targetRooms.push({
                ...room,
                currentOccupancy: room.occupancy
            });
        }
    }

    // 4. Migrate Allotments
    let migratedCount = 0;

    for (const allotment of allotmentsToMove) {
        // Find a room with space
        const targetRoom = targetRooms.find(r => r.currentOccupancy < r.capacity);

        if (!targetRoom) {
            console.error(`CRITICAL: No space left in ${targetHostel.name}! Cannot migrate allotment ${allotment.id}. Aborting migration of this student.`);
            continue;
        }

        console.log(`Migrating Allotment ${allotment.id} from Room (Source) to Room ${targetRoom.number} (Target)`);

        // Update Allotment
        await prisma.allotment.update({
            where: { id: allotment.id },
            data: { roomId: targetRoom.id }
        });

        // Update Target Room local & DB occupancy
        await prisma.room.update({
            where: { id: targetRoom.id },
            data: { occupancy: { increment: 1 } }
        });
        targetRoom.currentOccupancy++;
        migratedCount++;
    }

    console.log(`Migrated ${migratedCount}/${allotmentsToMove.length} allotments.`);

    // 5. Delete Source Hostel
    console.log('Deleting "AC Hostel Test" and its structure...');

    // Delete Rooms
    const roomIds = sourceRooms.map(r => r.id);
    // Batch delete rooms?
    // Need to delete empty rooms.
    // Note: All allotments are now moved. 
    // Wait, Prisma deletions need care.

    for (const room of sourceRooms) {
        // Ensure no allotments remain (double check)
        const count = await prisma.allotment.count({ where: { roomId: room.id } });
        if (count > 0) {
            console.error(`Room ${room.number} still has allotments! Skipping deletion.`);
            continue;
        }
        await prisma.room.delete({ where: { id: room.id } });
    }

    // Delete Floors
    for (const floor of sourceHostel.floors) {
        await prisma.floor.delete({ where: { id: floor.id } });
    }

    // Delete Hostel
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
