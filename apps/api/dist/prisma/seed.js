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
                role: client_1.Role.ADMIN,
            },
        });
        console.log('Admin user created (admin@dtu.ac.in / admin123)');
    }
    else {
        console.log('Admin user already exists');
    }
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
                role: client_1.Role.WARDEN,
            },
        });
        console.log('Warden user created (warden@dtu.ac.in / warden123)');
    }
    else {
        console.log('Warden user already exists');
    }
    const HOSTEL_MATRIX = [
        { name: 'Aryabhatta Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { triple: 57 } },
        { name: 'Bhaskaracharya Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Dr. APJ Abdul Kalam Hostel', isAC: true, gender: client_1.Gender.MALE, rooms: { triple: 104 } },
        { name: 'Homi Jahangir Bhabha Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 13, triple: 50 } },
        { name: 'Sir C.V. Raman Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Sir J.C. Bose Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 90, triple: 4, double: 37 } },
        { name: 'Varahamihira Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 90, double: 36, triple: 4 } },
        { name: 'Sir M. Visvesvaraya Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { single: 91, double: 37, triple: 4 } },
        { name: 'Ramanujan/Transit Hostel', isAC: true, gender: client_1.Gender.MALE, rooms: { fiveSeater: 15 } },
        { name: 'Type-II Hostel', isAC: false, gender: client_1.Gender.MALE, rooms: { fiveSeater: 46 } },
        { name: 'Kalpana Chawla Hostel', isAC: false, gender: client_1.Gender.FEMALE, rooms: { triple: 13 } },
    ];
    for (const h of HOSTEL_MATRIX) {
        const existingHostel = await prisma.hostel.findFirst({ where: { name: h.name } });
        if (existingHostel) {
            console.log(`Hostel ${h.name} exists, skipping creation.`);
            continue;
        }
        const hostel = await prisma.hostel.create({
            data: { name: h.name, isAC: h.isAC }
        });
        console.log(`Created Hostel: ${h.name}`);
        const floor = await prisma.floor.create({
            data: { hostelId: hostel.id, number: 0, gender: h.gender }
        });
        let roomCounter = 101;
        const createRooms = async (count, capacity) => {
            if (!count)
                return;
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
        if (h.rooms.single)
            await createRooms(h.rooms.single, 1);
        if (h.rooms.double)
            await createRooms(h.rooms.double, 2);
        if (h.rooms.triple)
            await createRooms(h.rooms.triple, 3);
        if (h.rooms.fiveSeater)
            await createRooms(h.rooms.fiveSeater, 5);
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