
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        console.log(`Kind: '${doc.kind}'`); // Quotes to see whitespace
        console.log(`URL: ${doc.fileUrl}`);
        console.log('-------------------');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
