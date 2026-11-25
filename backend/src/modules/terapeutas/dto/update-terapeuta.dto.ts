import { PartialType } from '@nestjs/mapped-types';
import { CreateTerapeutaDto } from './create-terapeuta.dto.js';

export class UpdateTerapeutaDto extends PartialType(CreateTerapeutaDto) {}
