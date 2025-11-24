import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportsService } from './imports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('imports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ImportsController {
    constructor(private readonly importsService: ImportsService) { }

    @Post('students')
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    async uploadStudents(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new Error('No file uploaded');
        return this.importsService.importStudents(file);
    }
}
