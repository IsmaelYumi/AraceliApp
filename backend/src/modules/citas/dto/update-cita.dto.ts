import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoCita } from '@prisma/client';
import { CreateCitaDto } from './create-cita.dto.js';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
  @IsEnum(EstadoCita, {
    message: 'El estado debe ser PROGRAMADA, COMPLETADA o CANCELADA',
  })
  @IsOptional()
  override estado?: EstadoCita;
}
