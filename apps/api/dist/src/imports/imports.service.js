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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const xlsx = __importStar(require("xlsx"));
const bcrypt = __importStar(require("bcrypt"));
let ImportsService = class ImportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async importStudents(file) {
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        const results = {
            success: 0,
            failed: 0,
            errors: [],
        };
        for (const row of data) {
            try {
                const { Name, Email, Phone, Gender, Rank } = row;
                if (!Email || !Name) {
                    results.failed++;
                    results.errors.push(`Row missing Email or Name: ${JSON.stringify(row)}`);
                    continue;
                }
                const existingUser = await this.prisma.user.findUnique({ where: { email: Email } });
                if (existingUser) {
                    results.failed++;
                    results.errors.push(`User already exists: ${Email}`);
                    continue;
                }
                const hashedPassword = await bcrypt.hash('password123', 10);
                const user = await this.prisma.user.create({
                    data: {
                        email: Email,
                        password: hashedPassword,
                        role: 'STUDENT',
                    },
                });
                await this.prisma.student.create({
                    data: {
                        userId: user.id,
                        name: Name,
                        phone: Phone ? String(Phone) : undefined,
                        gender: Gender ? (Gender.toUpperCase() === 'M' ? 'MALE' : 'FEMALE') : 'OTHER',
                        profileMeta: { rank: Rank },
                    },
                });
                results.success++;
            }
            catch (error) {
                results.failed++;
                results.errors.push(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
            }
        }
        return results;
    }
};
exports.ImportsService = ImportsService;
exports.ImportsService = ImportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImportsService);
//# sourceMappingURL=imports.service.js.map