import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { EstadoCita } from '@prisma/client';

export class CreateCitaDto {
  @IsString({ message: 'El ID del paciente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del paciente (pacienteId) es obligatorio' })
  pacienteId!: string;

  @IsString({ message: 'El ID del terapeuta debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del terapeuta (terapeutaId) es obligatorio' })
  terapeutaId!: string;

  @IsString({ message: 'El tipo de terapia debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de terapia es obligatorio' })
  tipoTerapia!: string;

  @IsDateString(
    {},
    { message: 'La fecha debe tener un formato ISO válido (ej. 2025-03-20)' },
  )
  @IsNotEmpty({ message: 'La fecha de la cita es obligatoria' })
  fecha!: string;

  @IsString({ message: 'La hora de inicio debe ser una cadena de texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de inicio debe tener formato HH:mm (ej. 09:00)',
  })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  horaInicio!: string;

  @IsString({ message: 'La hora de fin debe ser una cadena de texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de fin debe tener formato HH:mm (ej. 09:45)',
  })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  horaFin!: string;

  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @IsOptional()
  notas?: string;

  @IsEnum(EstadoCita, {
    message: 'El estado debe ser PROGRAMADA, COMPLETADA o CANCELADA',
  })
  @IsOptional()
  estado?: EstadoCita = EstadoCita.PROGRAMADA;
}
