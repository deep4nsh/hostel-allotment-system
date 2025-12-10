import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Body,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      type:
        | 'PHOTO'
        | 'SIGNATURE'
        | 'ADMISSION_LETTER'
        | 'UNDERTAKING'
        | 'MEDICAL_CERTIFICATE'
        | 'AADHAR_FRONT'
        | 'AADHAR_BACK';
    },
  ) {
    return this.documentsService.uploadFile(req.user.userId, file, body.type);
  }

  @Post('ocr')
  async triggerOcr(@Request() req: any) {
    return this.documentsService.processOcr(req.user.userId);
  }

  @Get('my')
  async getMyDocuments(@Request() req: any) {
    return this.documentsService.findAllByStudent(req.user.userId);
  }

  @Delete(':type')
  async deleteDocument(@Request() req: any, @Param('type') type: string) {
    return this.documentsService.deleteDocument(req.user.userId, type);
  }
}
