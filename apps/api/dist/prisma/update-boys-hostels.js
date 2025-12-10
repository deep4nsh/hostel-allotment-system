"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting Boys Hostel Update...');
    const BOYS_HOSTEL_MATRIX = [
        { name: 'Aryabhatta Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { triple: 57 } },
        { name: 'Bhaskaracharya Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Dr. APJ Abdul Kalam Hostel', isAC: true, gender: client_1.Gender.MALE, rooms: { triple: 104 } },
        { name: 'Homi Jahangir Bhabha Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 13, triple: 50 } },
        { name: 'Sir C.V. Raman Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Sir J.C. Bose Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 90, double: 37, triple: 4 } },
        { name: 'Varahamihira Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 90, double: 36, triple: 4 } },
        { name: 'Sir M. Visvesvaraya Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Ramanujan/Transit Hostel', isAC: true, gender: client_1.Gender.MALE, rooms: { fiveSeater: 15 } },
        { name: 'Type-II Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { fiveSeater: 46 } },
    ];
    for (const h of BOYS_HOSTEL_MATRIX) {
        const hostel = await prisma.hostel.findFirst({ where: { name: h.name } });
        if (!hostel) {
            console.log(`Hostel ${h.name} not found, creating...`);
            await prisma.hostel.create({
                data: { name: h.name, isAC: h.isAC }
            });
            continue;
        }
        console.log(`Updating ${h.name}...`);
        const floor = await prisma.floor.findFirst({
            where: { hostelId: hostel.id }
        });
        let floorId = floor?.id;
        if (!floorId) {
            const newFloor = await prisma.floor.create({
                data: { hostelId: hostel.id, number: 0, gender: h.gender }
            });
            floorId = newFloor.id;
        }
        const rooms = await prisma.room.findMany({ where: { floorId: floorId } });
        const roomIds = rooms.map(r => r.id);
        if (roomIds.length > 0) {
            await prisma.allotment.deleteMany({
                where: { roomId: { in: roomIds } }
            });
            await prisma.room.deleteMany({
                where: { id: { in: roomIds } }
            });
            console.log(`  Deleted ${rooms.length} old rooms and their allotments.`);
        }
        let roomCounter = 101;
        const createRooms = async (count, capacity) => {
            if (!count)
                return;
            const data = [];
            for (let i = 0; i < count; i++) {
                data.push({
                    floorId: floorId,
                    number: String(roomCounter++),
                    capacity: capacity,
                    yearAllowed: [1, 2, 3, 4]
                });
            }
            await prisma.room.createMany({ data });
        };
        if (h.rooms.single)
            await createRooms(h.rooms.single, 1);
        if (h.rooms.double)
            await createRooms(h.rooms.double, 2);
        if (h.rooms.triple)
            await createRooms(h.rooms.triple, 3);
        if (h.rooms.fiveSeater)
            await createRooms(h.rooms.fiveSeater, 5);
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
//# sourceMappingURL=update-boys-hostels.js.map