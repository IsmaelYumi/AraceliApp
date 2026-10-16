import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoCita } from '@prisma/client';

export class FilterCitaDto {
  @IsDateString(
    {},
    { message: 'La fecha de filtro debe tener un formato válido (ej. YYYY-MM-DD)' },
  )
  @IsOptional()
  fecha?: string;

  @IsString({ message: 'El ID del paciente debe ser una cadena de texto' })
  @IsOptional()
  pacienteId?: string;

  @IsString({ message: 'El ID del terapeuta debe ser una cadena de texto' })
  @IsOptional()
  terapeutaId?: string;

  @IsEnum(EstadoCita, {
    message: 'El estado debe ser PROGRAMADA, COMPLETADA o CANCELADA',
  })
  @IsOptional()
  estado?: EstadoCita;
}
