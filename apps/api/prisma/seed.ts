import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@dtu.ac.in';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // In a real app, password should be hashed (e.g. bcrypt). 
    // For now, storing plain text or a placeholder hash.
    // TODO: Integrate bcrypt
    const hashedPassword = 'adminpassword'; 

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
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
