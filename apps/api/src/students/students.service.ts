import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async findOne(userId: string) {
        return this.prisma.student.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { email: true, role: true }
                }
            }
        });
    }

    async update(userId: string, data: any) {
        return this.prisma.student.update({
            where: { userId },
            data,
        });
    }
}
