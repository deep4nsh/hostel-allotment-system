"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = 'admin@dtu.ac.in';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        const hashedPassword = 'adminpassword';
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                role: client_1.Role.ADMIN,
            },
        });
        console.log('Admin user created');
    }
    else {
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
//# sourceMappingURL=seed.js.map