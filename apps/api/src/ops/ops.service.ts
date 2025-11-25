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
    // For now we just write a dummy file
    fs.writeFileSync(filePath, '-- Dummy Backup File --\n-- Data would be here --');

    return { message: 'Backup created', path: filePath };
  }

  async getAnalytics() {
    const totalStudents = await this.prisma.student.count();
    const totalUsers = await this.prisma.user.count();

    const payments = await this.prisma.payment.findMany();
    const totalRevenue = payments
      .filter((p: any) => p.status === 'COMPLETED')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const allotments = await this.prisma.allotment.count();
    const refundRequests = await this.prisma.refundRequest.count({ where: { status: 'PENDING' } });

    return {
      totalStudents,
      totalUsers,
      totalRevenue,
      allotments,
      refundRequests
    };
  }
}
