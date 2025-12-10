import { PrismaClient, Gender } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Boys Hostel Update...');

    const BOYS_HOSTEL_MATRIX = [
        { name: 'Aryabhatta Hostel', isAC: false, gender: Gender.MALE, rooms: { triple: 57 } },
        { name: 'Bhaskaracharya Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Dr. APJ Abdul Kalam Hostel', isAC: true, gender: Gender.MALE, rooms: { triple: 104 } },
        { name: 'Homi Jahangir Bhabha Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 13, triple: 50 } },
        { name: 'Sir C.V. Raman Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Sir J.C. Bose Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 90, double: 37, triple: 4 } },
        { name: 'Varahamihira Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 90, double: 36, triple: 4 } },
        { name: 'Sir M. Visvesvaraya Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Ramanujan/Transit Hostel', isAC: true, gender: Gender.MALE, rooms: { fiveSeater: 15 } },
        { name: 'Type-II Hostel', isAC: false, gender: Gender.MALE, rooms: { fiveSeater: 46 } },
    ];

    for (const h of BOYS_HOSTEL_MATRIX) {
        const hostel = await prisma.hostel.findFirst({ where: { name: h.name } });
        if (!hostel) {
            console.log(`Hostel ${h.name} not found, creating...`);
            // Fallback create if missing
            await prisma.hostel.create({
                data: { name: h.name, isAC: h.isAC }
            });
            // Rerun logic
            continue;
        }

        console.log(`Updating ${h.name}...`);

        // Find the floor (assuming single floor logic from seed)
        const floor = await prisma.floor.findFirst({
            where: { hostelId: hostel.id }
        });

        // Safety check: Create floor if missing, though unlikely for existing hostels
        let floorId = floor?.id;
        if (!floorId) {
            const newFloor = await prisma.floor.create({
                data: { hostelId: hostel.id, number: 0, gender: h.gender }
            });
            floorId = newFloor.id;
        }

        // 1. Delete Existing Rooms (and cascades allotments ideally, or manually delete allotments first)
        // Note: Prisma cascade delete might not be set up on DB level, better to be safe.

        // Find all rooms
        const rooms = await prisma.room.findMany({ where: { floorId: floorId } });
        const roomIds = rooms.map(r => r.id);

        if (roomIds.length > 0) {
            // Delete Allotments first
            await prisma.allotment.deleteMany({
                where: { roomId: { in: roomIds } }
            });

            // Delete Rooms
            await prisma.room.deleteMany({
                where: { id: { in: roomIds } }
            });
            console.log(`  Deleted ${rooms.length} old rooms and their allotments.`);
        }

        // 2. Create New Rooms
        let roomCounter = 101;
        const createRooms = async (count: number, capacity: number) => {
            if (!count) return;
            // Batch creation for speed? Or loop. Loop is fine for small numbers.
            const data = [];
            for (let i = 0; i < count; i++) {
                data.push({
                    floorId: floorId!,
                    number: String(roomCounter++),
                    capacity: capacity,
                    yearAllowed: [1, 2, 3, 4]
                });
            }
            await prisma.room.createMany({ data });
        };

        if (h.rooms.single) await createRooms(h.rooms.single, 1);
        if (h.rooms.double) await createRooms(h.rooms.double, 2);
        if (h.rooms.triple) await createRooms(h.rooms.triple, 3);
        if (h.rooms.fiveSeater) await createRooms(h.rooms.fiveSeater, 5);

        console.log(`  Created new rooms. Last Room Number: ${roomCounter - 1}`);
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
