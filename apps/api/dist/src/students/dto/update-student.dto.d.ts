import { Gender, Category, Program } from '@prisma/client';
export declare class UpdateStudentDto {
    uniqueId?: string;
    name?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    gender?: Gender;
    category?: Category;
    program?: Program;
    year?: number;
    cgpa?: number;
    distance?: number;
    roomTypePreference?: string;
    floorPreference?: string;
}
