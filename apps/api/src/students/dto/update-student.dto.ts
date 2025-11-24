import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateStudentDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @IsString()
    @IsOptional()
    program?: string;

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    year?: number;
}
