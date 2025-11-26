import { Gender, Category } from '@prisma/client';
export declare class UpdateStudentDto {
    uniqueId?: string;
    name?: string;
    phone?: string;
    address?: string;
    gender?: Gender;
    category?: Category;
    program?: string;
    year?: number;
    cgpa?: number;
    distance?: number;
}
