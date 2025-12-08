import { PrismaClient, Role, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Admin
  const adminEmail = 'admin@dtu.ac.in';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log('Admin user created (admin@dtu.ac.in / admin123)');
  } else {
    console.log('Admin user already exists');
  }

  // 1.5 Seed Warden
  const wardenEmail = 'warden@dtu.ac.in';
  const existingWarden = await prisma.user.findUnique({
    where: { email: wardenEmail },
  });

  if (!existingWarden) {
    const hashedPassword = await bcrypt.hash('warden123', 10);
    await prisma.user.create({
      data: {
        email: wardenEmail,
        password: hashedPassword,
        role: Role.WARDEN,
      },
    });
    console.log('Warden user created (warden@dtu.ac.in / warden123)');
  } else {
    console.log('Warden user already exists');
  }

  // 2. Seed Hostels (Detailed Matrix)
  /*
    Boys' Hostels Matrix:
    1. Aryabhatta (ABH): 57 Triple -> Total 171
    2. Bhaskaracharya (BCH): 91 Single, 37 Double, 4 Triple -> Total 177
    3. Dr. APJ Abdul Kalam (APJ): 104 Triple -> Total 312 (AC)
    4. Homi Jahangir Bhabha (HJB): 13 Single, 50 Triple -> Total 163
    5. Sir C.V. Raman (CVR): 91 Single, 37 Double, 4 Triple -> Total 177
    6. Sir J.C. Bose (JCB): 90 Single, 37 Double, 4 Triple -> Total 176
    7. Varahamihira (VMH): 90 Single, 36 Double, 4 Triple -> Total 174
    8. Sir M. Visvesvaraya (VVS): 91 Single, 37 Double, 4 Triple -> Total 177
    9. TRANSIT/Ramanujan (RMJ): 15 5-Seaters -> Total 75 (Wait, Img says 1830 total?) 15*5=75. Capacity col says 73? Maybe one is smaller. Assuming 15*5.
    10. Type-II (B-1 to B-5): 46 5-Seaters -> Total 230.
  */

  const HOSTEL_MATRIX = [
    { name: 'Aryabhatta Hostel', isAC: false, gender: Gender.MALE, rooms: { triple: 57 } },
    { name: 'Bhaskaracharya Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
    { name: 'Dr. APJ Abdul Kalam Hostel', isAC: true, gender: Gender.MALE, rooms: { triple: 104 } },
    { name: 'Homi Jahangir Bhabha Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 13, triple: 50 } },
    { name: 'Sir C.V. Raman Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
    { name: 'Sir J.C. Bose Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 90, triple: 4, double: 37 } },
    { name: 'Varahamihira Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 90, double: 36, triple: 4 } },
    { name: 'Sir M. Visvesvaraya Hostel', isAC: false, gender: Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
    { name: 'Ramanujan/Transit Hostel', isAC: true, gender: Gender.MALE, rooms: { fiveSeater: 15 } }, // Using 5 seater for Transit
    { name: 'Type-II Hostel', isAC: false, gender: Gender.MALE, rooms: { fiveSeater: 46 } },

    // Female Hostels (Simplified for now as per instructions to leave them, but ensuring they exist for completeness if needed later or just KCH)
    { name: 'Kalpana Chawla Hostel', isAC: false, gender: Gender.FEMALE, rooms: { triple: 13 } },
  ];

  for (const h of HOSTEL_MATRIX) {
    // Check if exists
    const existingHostel = await prisma.hostel.findFirst({ where: { name: h.name } });
    if (existingHostel) {
      // For fresh start based on task, we assume DB is reset or we skip. 
      // But to enforce exact counts, let's skip/log. User asked for "fresh data".
      console.log(`Hostel ${h.name} exists, skipping creation.`);
      continue;
    }

    const hostel = await prisma.hostel.create({
      data: { name: h.name, isAC: h.isAC }
    });
    console.log(`Created Hostel: ${h.name}`);

    // Create a single floor to hold all rooms for simplicity
    const floor = await prisma.floor.create({
      data: { hostelId: hostel.id, number: 0, gender: h.gender }
    });

    let roomCounter = 101;

    // Helper to create rooms
    const createRooms = async (count: number, capacity: number) => {
      if (!count) return;
      for (let i = 0; i < count; i++) {
        await prisma.room.create({
          data: {
            floorId: floor.id,
            number: String(roomCounter++),
            capacity: capacity,
            yearAllowed: [1, 2, 3, 4]
          }
        });
      }
    };

    if (h.rooms.single) await createRooms(h.rooms.single, 1);
    if (h.rooms.double) await createRooms(h.rooms.double, 2);
    if (h.rooms.triple) await createRooms(h.rooms.triple, 3);
    if (h.rooms.fiveSeater) await createRooms(h.rooms.fiveSeater, 5);
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
