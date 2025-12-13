"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding 200 students...');
    const passwordHash = await bcrypt.hash('123456', 10);
    const students = [];
    for (let i = 10; i <= 210; i++) {
        const email = `student${i}@dtu.ac.in`;
        const name = `Student ${i}`;
        const uniqueId = `DTU2025_${i}`;
        const category = i % 4 === 0 ? client_1.Category.OUTSIDE_DELHI : client_1.Category.DELHI;
        const gender = client_1.Gender.MALE;
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
            const user = await prisma.user.upsert({
                where: { email: s.email },
                update: {},
                create: {
                    email: s.email,
                    password: passwordHash,
                    role: client_1.Role.STUDENT
                }
            });
            const student = await prisma.student.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    name: s.name,
                    gender: s.gender,
                    category: s.category,
                    uniqueId: s.uniqueId,
                    year: 1,
                    program: client_1.Program.BTECH,
                    country: 'India',
                    isProfileFrozen: true,
                    roomTypePreference: 'TRIPLE',
                    distance: s.category === client_1.Category.DELHI ? Math.floor(Math.random() * 50) + 10 : 0,
                    cgpa: 0,
                    profileMeta: {
                        distance: s.category === client_1.Category.DELHI ? Math.floor(Math.random() * 50) + 10 : 0
                    }
                }
            });
            await prisma.payment.create({
                data: {
                    studentId: student.id,
                    purpose: client_1.PaymentPurpose.REGISTRATION,
                    status: client_1.PaymentStatus.COMPLETED,
                    amount: 1500,
                    gateway: 'SEED',
                    txnRef: `REG_${s.uniqueId}`
                }
            });
            await prisma.payment.create({
                data: {
                    studentId: student.id,
                    purpose: client_1.PaymentPurpose.ALLOTMENT_REQUEST,
                    status: client_1.PaymentStatus.COMPLETED,
                    amount: 1000,
                    gateway: 'SEED',
                    txnRef: `TOK_${s.uniqueId}`
                }
            });
            process.stdout.write('.');
        }
        catch (e) {
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
//# sourceMappingURL=seed-students.js.map