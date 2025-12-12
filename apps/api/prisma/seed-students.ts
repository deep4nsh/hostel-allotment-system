
import { PrismaClient, Role, Gender, Category, Program, PaymentStatus, PaymentPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding 200 students...');

    const passwordHash = await bcrypt.hash('123456', 10);
    const students = [];

    for (let i = 10; i <= 210; i++) {
        const email = `student${i}@dtu.ac.in`;
        const name = `Student ${i}`;
        const uniqueId = `DTU2025_${i}`;

        // Mix categories to test allotment rank (DELHI has higher priority in general or vice versa depending on logic)
        // Codebase logic: DELHI (3), OUTSIDE_DELHI (2). Wait, earlier logic showed:
        // OUTSIDE_DELHI (2), DELHI (3). Rank logic: (a.categoryPriority - b.categoryPriority).
        // Actually in the sort function I saw:
        // catA = categoryPriority[a.category] ?? 3
        // if (catA !== catB) return catA - catB
        // PH: 0, NRI: 1, OUTSIDE: 2, DELHI: 3
        // So lower number = higher priority. PH > NRI > OUTSIDE > DELHI.

        // Let's make:
        // 150 Delhi
        // 50 Outside Delhi
        // A few PH maybe? No, keep it simple.

        const category = i % 4 === 0 ? Category.OUTSIDE_DELHI : Category.DELHI;
        const gender = Gender.MALE; // Focus on boys hostels for now

        students.push({
            email,
            name,
            uniqueId,
            category,
            gender
        });
    }

    for (const s of students) {
        try {
            // Create User
            const user = await prisma.user.upsert({
                where: { email: s.email },
                update: {},
                create: {
                    email: s.email,
                    password: passwordHash,
                    role: Role.STUDENT
                }
            });

            // Create Student
            const student = await prisma.student.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    name: s.name,
                    gender: s.gender,
                    category: s.category,
                    uniqueId: s.uniqueId,
                    year: 1, // Year 1 to test allotment
                    program: Program.BTECH,
                    country: 'India',
                    isProfileFrozen: true,
                    roomTypePreference: 'TRIPLE',
                    // Distance for Delhi students (needed for rank)
                    distance: s.category === Category.DELHI ? Math.floor(Math.random() * 50) + 10 : 0,
                    cgpa: 0, // Freshers don't have CGPA usually, or irrelevant for Year 1 first allotment
                    profileMeta: {
                        distance: s.category === Category.DELHI ? Math.floor(Math.random() * 50) + 10 : 0
                    }
                }
            });

            // Create Registration Payment
            await prisma.payment.create({
                data: {
                    studentId: student.id,
                    purpose: PaymentPurpose.REGISTRATION,
                    status: PaymentStatus.COMPLETED,
                    amount: 1500,
                    gateway: 'SEED',
                    txnRef: `REG_${s.uniqueId}`
                }
            });

            // Create Allotment Request Payment (Token Fee)
            await prisma.payment.create({
                data: {
                    studentId: student.id,
                    purpose: PaymentPurpose.ALLOTMENT_REQUEST,
                    status: PaymentStatus.COMPLETED,
                    amount: 1000,
                    gateway: 'SEED',
                    txnRef: `TOK_${s.uniqueId}`
                }
            });

            process.stdout.write('.');
        } catch (e) {
            console.error(`Failed for ${s.email}: ${e.message}`);
        }
    }

    console.log('\nSeeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
