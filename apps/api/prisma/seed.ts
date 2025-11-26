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

  // 2. Seed Hostels
  const hostels = [
    { name: 'Aryabhatta Hostel', isAC: false, gender: Gender.MALE },
    { name: 'Ramanujan Hostel', isAC: true, gender: Gender.MALE },
    { name: 'Kalpana Chawla Hostel', isAC: false, gender: Gender.FEMALE },
  ];

  for (const h of hostels) {
    const existingHostel = await prisma.hostel.findFirst({ where: { name: h.name } });
    if (!existingHostel) {
      const hostel = await prisma.hostel.create({
        data: {
          name: h.name,
          isAC: h.isAC,
        },
      });
      console.log(`Hostel created: ${h.name}`);

      // Create Floors and Rooms
      for (let floorNum = 0; floorNum < 4; floorNum++) {
        const floor = await prisma.floor.create({
          data: {
            hostelId: hostel.id,
            number: floorNum,
            gender: h.gender,
          },
        });

        // Create 10 rooms per floor
        for (let roomNum = 1; roomNum <= 10; roomNum++) {
          // Determine capacity based on room number pattern
          let capacity = 3; // Default Triple
          if (roomNum > 8) capacity = 1; // Last 2 are single
          else if (roomNum > 5) capacity = 2; // Next 3 are double

          await prisma.room.create({
            data: {
              floorId: floor.id,
              number: `${floorNum}${String(roomNum).padStart(2, '0')}`, // e.g., 101, 102
              capacity: capacity,
              yearAllowed: [1, 2, 3, 4], // All years for now
            },
          });
        }
      }
    } else {
      console.log(`Hostel ${h.name} already exists`);
    }
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
