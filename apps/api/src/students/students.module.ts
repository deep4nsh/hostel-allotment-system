import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfService } from './pdf.service';

@Module({
    imports: [PrismaModule],
    controllers: [StudentsController],
    providers: [StudentsService, PdfService],
    exports: [StudentsService],
})
export class StudentsModule { }
