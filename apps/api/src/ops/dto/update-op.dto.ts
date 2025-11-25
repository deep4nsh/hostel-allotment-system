import { PartialType } from '@nestjs/mapped-types';
import { CreateOpDto } from './create-op.dto';

export class UpdateOpDto extends PartialType(CreateOpDto) {}
