import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateActividadDto {
  @IsString()
  @IsOptional()
  pacienteId?: string;

  @IsString()
  @IsOptional()
  terapeutaId?: string;

  @IsString()
  @IsOptional()
  terapeutaNombre?: string;

  @IsString()
  @IsOptional()
  especialidad?: string;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  numeroProceso?: string;

  @IsInt()
  @IsOptional()
  duracionMinutos?: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsBoolean()
  @IsOptional()
  revisado?: boolean;
}
