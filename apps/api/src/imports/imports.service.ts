import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ImportsService {
    constructor(private prisma: PrismaService) { }

    async importStudents(file: Express.Multer.File) {
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const row of data as any[]) {
            try {
                // Expected columns: Name, Email, Phone, Gender, Rank
                const { Name, Email, Phone, Gender, Rank } = row;

                if (!Email || !Name) {
                    results.failed++;
                    results.errors.push(`Row missing Email or Name: ${JSON.stringify(row)}`);
                    continue;
                }

                // Check if user exists
                const existingUser = await this.prisma.user.findUnique({ where: { email: Email } });
                if (existingUser) {
                    results.failed++;
                    results.errors.push(`User already exists: ${Email}`);
                    continue;
                }

                // Create User
                const hashedPassword = await bcrypt.hash('password123', 10); // Default password
                const user = await this.prisma.user.create({
                    data: {
                        email: Email,
                        password: hashedPassword,
                        role: 'STUDENT',
                    },
                });

                // Create Student
                await this.prisma.student.create({
                    data: {
                        userId: user.id,
                        name: Name,
                        phone: Phone ? String(Phone) : undefined,
                        gender: Gender ? (Gender.toUpperCase() === 'M' ? 'MALE' : 'FEMALE') : 'OTHER',
                        profileMeta: { rank: Rank },
                    },
                });

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
            }
        }

        return results;
    }
}
