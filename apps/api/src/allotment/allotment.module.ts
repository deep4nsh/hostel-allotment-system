import { Module } from '@nestjs/common';
import { AllotmentService } from './allotment.service';
import { AllotmentController } from './allotment.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AllotmentController],
    providers: [AllotmentService],
})
export class AllotmentModule { }
