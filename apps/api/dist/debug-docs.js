"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const documents = await prisma.document.findMany({
        include: {
            student: {
                include: {
                    user: true
                }
            }
        }
    });
    console.log('--- ALL DOCUMENTS ---');
    documents.forEach(doc => {
        console.log(`ID: ${doc.id}`);
        console.log(`Student: ${doc.student.user.email}`);
        console.log(`Kind: '${doc.kind}'`);
        console.log(`URL: ${doc.fileUrl}`);
        console.log('-------------------');
    });
}
main()
    .catch(e => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=debug-docs.js.map