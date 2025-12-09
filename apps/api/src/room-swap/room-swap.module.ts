import { Module } from '@nestjs/common';
import { RoomSwapService } from './room-swap.service';
import { RoomSwapController } from './room-swap.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RoomSwapController],
    providers: [RoomSwapService],
})
export class RoomSwapModule { }
