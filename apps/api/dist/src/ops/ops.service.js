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
exports.OpsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let OpsService = class OpsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHealth() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return { status: 'UP', database: 'CONNECTED', timestamp: new Date() };
        }
        catch (e) {
            return { status: 'DOWN', database: 'DISCONNECTED', error: e.message };
        }
    }
    async triggerBackup() {
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        const fileName = `backup_${Date.now()}.sql`;
        const filePath = path.join(backupDir, fileName);
        fs.writeFileSync(filePath, '-- Dummy Backup File --\n-- Data would be here --');
        return { message: 'Backup created', path: filePath };
    }
    async getAnalytics() {
        const totalStudents = await this.prisma.student.count();
        const allotmentsCount = await this.prisma.allotment.count();
        const refundRequests = await this.prisma.refundRequest.count({ where: { status: 'PENDING' } });
        const payments = await this.prisma.payment.groupBy({
            by: ['status'],
            _sum: { amount: true },
        });
        const totalRevenue = payments.find(p => p.status === 'COMPLETED')?._sum.amount || 0;
        const hostels = await this.prisma.hostel.findMany({
            include: {
                floors: {
                    include: {
                        rooms: {
                            select: { capacity: true, occupancy: true }
                        }
                    }
                }
            }
        });
        const hostelStats = hostels.map(h => {
            let capacity = 0;
            let occupancy = 0;
            h.floors.forEach(f => {
                f.rooms.forEach(r => {
                    capacity += r.capacity;
                    occupancy += r.occupancy;
                });
            });
            return {
                name: h.name,
                capacity,
                occupancy,
                fillRate: capacity > 0 ? (occupancy / capacity) * 100 : 0
            };
        });
        const categoryStats = await this.prisma.student.groupBy({
            by: ['category'],
            _count: { id: true },
        });
        const yearStats = await this.prisma.student.groupBy({
            by: ['year'],
            _count: { id: true },
            orderBy: { year: 'asc' }
        });
        return {
            overview: {
                totalStudents,
                allotmentsCount,
                totalRevenue,
                pendingRefunds: refundRequests
            },
            hostelStats,
            demographics: {
                byCategory: categoryStats.map(c => ({ category: c.category, count: c._count.id })),
                byYear: yearStats.map(y => ({ year: y.year || 'Unknown', count: y._count.id })),
            }
        };
    }
};
exports.OpsService = OpsService;
exports.OpsService = OpsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OpsService);
//# sourceMappingURL=ops.service.js.map