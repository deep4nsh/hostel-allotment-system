import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreatePreferenceDto {
  @IsString()
  @IsNotEmpty()
  floorId: string;

  @IsInt()
  rank: number;
}
