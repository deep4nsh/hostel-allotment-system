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
    const hostels = [
        { name: 'Aryabhatta/Type 2', isAC: false, gender: client_1.Gender.MALE },
        { name: 'Ramanujan/Transit', isAC: true, gender: client_1.Gender.MALE },
        { name: 'Kalpana Chawla Hostel', isAC: false, gender: client_1.Gender.FEMALE },
    ];
    for (const h of hostels) {
        let existingHostel = await prisma.hostel.findFirst({ where: { name: h.name } });
        if (!existingHostel) {
            let oldName = null;
            if (h.name === 'Aryabhatta/Type 2')
                oldName = 'Aryabhatta Hostel';
            else if (h.name === 'Ramanujan/Transit')
                oldName = 'Ramanujan Hostel';
            if (oldName) {
                const oldHostel = await prisma.hostel.findFirst({ where: { name: oldName } });
                if (oldHostel) {
                    console.log(`Renaming ${oldName} to ${h.name}...`);
                    existingHostel = await prisma.hostel.update({
                        where: { id: oldHostel.id },
                        data: { name: h.name, isAC: h.isAC }
                    });
                }
            }
        }
        if (!existingHostel) {
            const hostel = await prisma.hostel.create({
                data: {
                    name: h.name,
                    isAC: h.isAC,
                },
            });
            console.log(`Hostel created: ${h.name}`);
            for (let floorNum = 0; floorNum < 4; floorNum++) {
                const floor = await prisma.floor.create({
                    data: {
                        hostelId: hostel.id,
                        number: floorNum,
                        gender: h.gender,
                    },
                });
                for (let roomNum = 1; roomNum <= 10; roomNum++) {
                    let capacity = 3;
                    if (roomNum > 8)
                        capacity = 1;
                    else if (roomNum > 5)
                        capacity = 2;
                    await prisma.room.create({
                        data: {
                            floorId: floor.id,
                            number: `${floorNum}${String(roomNum).padStart(2, '0')}`,
                            capacity: capacity,
                            yearAllowed: [1, 2, 3, 4],
                        },
                    });
                }
            }
        }
        else {
            console.log(`Hostel ${h.name} already exists (or was renamed)`);
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
//# sourceMappingURL=seed.js.map