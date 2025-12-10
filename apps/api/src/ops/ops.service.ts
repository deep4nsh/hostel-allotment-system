import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

@Injectable()
export class OpsService {
  constructor(private prisma: PrismaService) { }

  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'UP', database: 'CONNECTED', timestamp: new Date() };
    } catch (e) {
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

    // Mock backup - in real life use pg_dump
    fs.writeFileSync(
      filePath,
      '-- Dummy Backup File --\n-- Data would be here --',
    );

    return { message: 'Backup created', path: filePath };
  }

  async getAnalytics() {
    // 1. High-level stats
    const totalStudents = await this.prisma.student.count();
    const allotmentsCount = await this.prisma.allotment.count();
    const refundRequests = await this.prisma.refundRequest.count({
      where: { status: 'PENDING' },
    });

    // 2. Financials
    // 2. Financials
    const payments = await this.prisma.payment.groupBy({
      by: ['status'],
      _sum: { amount: true },
    });
    const completedRevenue =
      payments.find((p) => p.status === 'COMPLETED')?._sum.amount || 0;

    // Subtract Pending Refund Requests to show Net Projected Revenue
    const pendingRefunds = await this.prisma.refundRequest.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true }
    });
    const pendingRefundAmount = pendingRefunds._sum.amount || 0;

    const totalRevenue = Math.max(0, completedRevenue - pendingRefundAmount);

    // 3. Hostel Occupancy
    const hostels = await this.prisma.hostel.findMany({
      include: {
        floors: {
          include: {
            rooms: {
              select: { capacity: true, occupancy: true },
            },
          },
        },
      },
    });

    const hostelStats = hostels.map((h) => {
      let capacity = 0;
      let occupancy = 0;
      h.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          capacity += r.capacity;
          occupancy += r.occupancy;
        });
      });
      return {
        name: h.name,
        capacity,
        occupancy,
        fillRate: capacity > 0 ? (occupancy / capacity) * 100 : 0,
      };
    });

    // 4. Student Demographics
    const categoryStats = await this.prisma.student.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const yearStats = await this.prisma.student.groupBy({
      by: ['year'],
      _count: { id: true },
      orderBy: { year: 'asc' },
    });

    return {
      overview: {
        totalStudents,
        allotmentsCount,
        totalRevenue,
        pendingRefunds: refundRequests,
      },
      hostelStats,
      demographics: {
        byCategory: categoryStats.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
        byYear: yearStats.map((y) => ({
          year: y.year || 'Unknown',
          count: y._count.id,
        })),
      },
    };
  }
}
