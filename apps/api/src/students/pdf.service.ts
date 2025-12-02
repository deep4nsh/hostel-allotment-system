import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generateRegistrationSlip(student: any): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .title { font-size: 24px; font-weight: bold; }
          .subtitle { font-size: 16px; color: #666; }
          .content { margin-bottom: 30px; }
          .row { margin-bottom: 15px; }
          .label { font-weight: bold; width: 150px; display: inline-block; }
          .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #888; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Delhi Technological University</div>
          <div class="subtitle">Hostel Allotment Registration Slip</div>
        </div>

        <div class="content">
          <div class="row">
            <span class="label">Registration ID:</span>
            <span>${student.id}</span>
          </div>
          <div class="row">
            <span class="label">Name:</span>
            <span>${student.name || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Email:</span>
            <span>${student.user.email}</span>
          </div>
          <div class="row">
            <span class="label">Date:</span>
            <span>${new Date().toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span style="color: green; font-weight: bold;">REGISTERED</span>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated document. No signature is required.</p>
        </div>
      </body>
      </html>
    `;

      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf({ format: 'A4' });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate registration slip');
    }
  }
}
