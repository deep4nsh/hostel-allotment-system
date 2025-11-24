import { Gender } from '@prisma/client';
export declare class UpdateStudentDto {
    name?: string;
    phone?: string;
    address?: string;
    gender?: Gender;
    program?: string;
    year?: number;
}
