import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { LettersService } from './letters.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('letters')
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('allotment')
  async downloadAllotmentLetter(@Request() req: any, @Res() res: Response) {
    const student = req.user.studentId; // Assuming studentId is attached to req.user or fetched
    // Note: req.user usually has userId. We might need to fetch studentId or use userId in service.
    // For now, let's assume we pass userId to service and service finds student.
    // Updating service to accept userId would be better, but let's stick to studentId if available.
    // Actually, let's fetch studentId from userId in service or controller.
    // Simplified: Pass userId to service and let service find student.

    // WAIT: The service expects studentId. Let's update controller to pass userId and service to handle it?
    // Or better, update service to find by userId.

    // Let's assume we pass userId to service for now, I will update service signature in next step if needed.
    // Actually, let's just fetch studentId here if possible? No, cleaner to pass userId.

    // Let's update service to take userId instead of studentId for consistency with other modules.
    const pdf = await this.lettersService.generateAllotmentLetter(
      req.user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="allotment-letter.pdf"',
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }
}
