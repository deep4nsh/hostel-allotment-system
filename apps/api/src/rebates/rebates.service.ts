import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRebateDto } from './dto/create-rebate.dto';

@Injectable()
export class RebatesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createRebateDto: CreateRebateDto) {
        const student = await this.prisma.student.findUnique({ where: { userId } });
        if (!student) throw new BadRequestException('Student profile not found');

        // Validation: Rules say min 3 days
        const start = new Date(createRebateDto.startDate);
        const end = new Date(createRebateDto.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays < 3) {
            throw new BadRequestException('Mess rebate must be for at least 3 days');
        }

        // TODO: Check if already has rebate in this period

        return this.prisma.messRebateRequest.create({
            data: {
                studentId: student.id,
                startDate: start,
                endDate: end,
                reason: createRebateDto.reason,
                documentUrl: createRebateDto.documentUrl,
                status: 'PENDING',
            },
        });
    }

    async findAllForStudent(userId: string) {
        return this.prisma.messRebateRequest.findMany({
            where: { student: { userId } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAllPendingForWarden(wardenId: string) {
        // Ideally, filter by hostel assigned to warden.
        // For M1, we might just return all pending if warden assignment is loose, 
        // or fetch warden's hostels first.
        // Let's assume warden can see all requests for now or filter by hostel.
        
        // Get warden's hostels
        // const wardenHostels = await this.prisma.hostel.findMany({ where: { wardens: { some: { id: wardenId } } } });
        // const hostelIds = wardenHostels.map(h => h.id);

        return this.prisma.messRebateRequest.findMany({
            where: {
                status: 'PENDING',
                // student: { allotment: { room: { floor: { hostelId: { in: hostelIds } } } } } 
            },
            include: {
                student: {
                    include: {
                        allotment: {
                            include: { room: { include: { floor: { include: { hostel: true } } } } }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
        return this.prisma.messRebateRequest.update({
            where: { id },
            data: { status },
        });
    }
}
