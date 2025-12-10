import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsInt()
  capacity: number;

  @IsArray()
  @IsInt({ each: true })
  yearAllowed: number[];
}

export class CreateFloorDto {
  @IsInt()
  number: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomDto)
  rooms: CreateRoomDto[];
}

export class CreateHostelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFloorDto)
  @IsOptional()
  floors?: CreateFloorDto[];
}
