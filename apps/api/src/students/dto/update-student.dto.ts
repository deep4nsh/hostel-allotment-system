import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsNumber } from 'class-validator';
import { Gender, Category } from '@prisma/client';

export class UpdateStudentDto {
    @IsString()
    @IsOptional()
    uniqueId?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    addressLine1?: string;

    @IsString()
    @IsOptional()
    addressLine2?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    pincode?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @IsEnum(Category)
    @IsOptional()
    category?: Category;

    @IsString()
    @IsOptional()
    program?: string;

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    year?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(10)
    cgpa?: number;

    @IsNumber()
    @IsOptional()
    distance?: number;
}
