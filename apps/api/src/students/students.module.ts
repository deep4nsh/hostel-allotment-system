import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfService } from './pdf.service';

import { DistanceService } from '../utils/distance.service';

@Module({
    imports: [PrismaModule],
    controllers: [StudentsController],
    providers: [StudentsService, PdfService, DistanceService],
    exports: [StudentsService],
})
export class StudentsModule { }
