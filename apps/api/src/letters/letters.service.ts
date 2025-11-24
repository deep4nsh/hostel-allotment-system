import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import puppeteer from 'puppeteer';

@Injectable()
export class LettersService {
    constructor(private prisma: PrismaService) { }

    async generateAllotmentLetter(userId: string): Promise<Buffer> {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: {
                user: true,
                allotment: {
                    include: {
                        room: {
                            include: {
                                floor: {
                                    include: {
                                        hostel: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!student || !student.allotment) {
            throw new Error('Student not allotted any room');
        }

        const { room } = student.allotment;
        const { floor } = room;
        const { hostel } = floor;

        const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { text-align: center; color: #333; }
            .header { margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .details { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Provisional Allotment Letter</h1>
            <p style="text-align: center;">Hostel Allotment System - DTU</p>
          </div>
          
          <div class="details">
            <h3>Student Details</h3>
            <div class="row"><span class="label">Name:</span> <span>${student.name}</span></div>
            <div class="row"><span class="label">Email:</span> <span>${student.user.email}</span></div>
            <div class="row"><span class="label">Student ID:</span> <span>${student.uniqueId || 'N/A'}</span></div>
          </div>

          <div class="details">
            <h3>Allotment Details</h3>
            <div class="row"><span class="label">Hostel:</span> <span>${hostel.name}</span></div>
            <div class="row"><span class="label">Floor:</span> <span>${floor.number} (${floor.gender})</span></div>
            <div class="row"><span class="label">Room Number:</span> <span>${room.number}</span></div>
          </div>

          <div class="details">
            <h3>Instructions</h3>
            <p>1. Please report to the hostel office within 7 days.</p>
            <p>2. Bring this allotment letter and your original documents.</p>
            <p>3. Pay the mess fee to confirm your seat.</p>
          </div>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>This is a computer-generated document. No signature required.</p>
          </div>
        </body>
      </html>
    `;

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();

        return Buffer.from(pdf);
    }
}
