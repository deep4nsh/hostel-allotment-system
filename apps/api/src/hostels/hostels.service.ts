import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';

@Injectable()
export class HostelsService {
    constructor(private prisma: PrismaService) { }

    async create(createHostelDto: CreateHostelDto) {
        const { floors, ...hostelData } = createHostelDto;

        return this.prisma.hostel.create({
            data: {
                ...hostelData,
                floors: {
                    create: floors?.map((floor) => ({
                        number: floor.number,
                        gender: floor.gender,
                        rooms: {
                            create: floor.rooms?.map((room) => ({
                                number: room.number,
                                capacity: room.capacity,
                                yearAllowed: room.yearAllowed,
                            })),
                        },
                    })),
                },
            },
            include: {
                floors: {
                    include: {
                        rooms: true,
                    },
                },
            },
        });
    }

    findAll() {
        return this.prisma.hostel.findMany({
            include: {
                floors: {
                    include: {
                        rooms: true,
                    },
                },
            },
        });
    }

    findOne(id: string) {
        return this.prisma.hostel.findUnique({
            where: { id },
            include: {
                floors: {
                    include: {
                        rooms: {
                            include: {
                                allotments: {
                                    include: {
                                        student: {
                                            include: {
                                                user: {
                                                    select: { email: true }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    },
                },
            },
        });
    }

    update(id: string, updateHostelDto: UpdateHostelDto) {
        const { floors, ...hostelData } = updateHostelDto;
        // TODO: Handle floor updates if necessary
        return this.prisma.hostel.update({
            where: { id },
            data: hostelData,
        });
    }

    remove(id: string) {
        return this.prisma.hostel.delete({
            where: { id },
        });
    }
}
