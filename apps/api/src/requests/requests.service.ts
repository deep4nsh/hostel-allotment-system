import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequestsService {
    constructor(private prisma: PrismaService) { }

    // --- STUDENT ACTIONS ---

    async createChangeRequest(studentId: string, data: { reason: string; preferredHostelId?: string }) {
        // Check if student has an allotment
        const allotment = await this.prisma.allotment.findUnique({ where: { studentId } });
        if (!allotment) throw new Error('No active allotment found');

        return this.prisma.roomChangeRequest.create({
            data: {
                studentId,
                currentRoomId: allotment.roomId,
                reason: data.reason,
                preferredHostelId: data.preferredHostelId,
            },
        });
    }

    async createSurrenderRequest(studentId: string, data: { reason: string; clearanceUrl?: string }) {
        const allotment = await this.prisma.allotment.findUnique({ where: { studentId } });
        if (!allotment) throw new Error('No active allotment found');

        return this.prisma.roomSurrenderRequest.create({
            data: {
                studentId,
                allotmentId: allotment.id,
                reason: data.reason,
                clearanceUrl: data.clearanceUrl,
            },
        });
    }

    async confirmPossession(studentId: string) {
        const allotment = await this.prisma.allotment.findUnique({ where: { studentId } });
        if (!allotment) throw new Error('No active allotment found');

        return this.prisma.allotment.update({
            where: { id: allotment.id },
            data: {
                isPossessed: true,
                possessionDate: new Date(),
            },
        });
    }

    async getMyRequests(studentId: string) {
        const changeRequests = await this.prisma.roomChangeRequest.findMany({ where: { studentId } });
        const surrenderRequests = await this.prisma.roomSurrenderRequest.findMany({ where: { studentId } });
        const swapRequests = await this.prisma.hostelSwapRequest.findMany({ where: { studentId } });

        return { changeRequests, surrenderRequests, swapRequests };
    }

    // --- WARDEN ACTIONS ---

    async getAllChangeRequests() {
        return this.prisma.roomChangeRequest.findMany({
            include: { student: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateChangeRequestStatus(id: string, status: string, comment?: string) {
        return this.prisma.roomChangeRequest.update({
            where: { id },
            data: { status, adminComment: comment },
        });
    }

    async getAllSurrenderRequests() {
        return this.prisma.roomSurrenderRequest.findMany({
            include: { student: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateSurrenderRequestStatus(id: string, status: string, comment?: string) {
        const request = await this.prisma.roomSurrenderRequest.update({
            where: { id },
            data: { status, adminComment: comment },
        });

        if (status === 'APPROVED') {
            const allotment = await this.prisma.allotment.findUnique({ where: { id: request.allotmentId } });
            if (allotment) {
                // Delete allotment
                await this.prisma.allotment.delete({ where: { id: request.allotmentId } });
                // Decrement room occupancy
                await this.prisma.room.update({
                    where: { id: allotment.roomId },
                    data: { occupancy: { decrement: 1 } }
                });
            }
        }
        return request;
    }
}
