import { IsString, IsNotEmpty, IsISO8601, IsOptional } from 'class-validator';

export class CreateRebateDto {
  @IsISO8601()
  @IsNotEmpty()
  startDate: string;

  @IsISO8601()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;
}
