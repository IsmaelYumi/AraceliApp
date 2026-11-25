import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoTerapeuta } from '@prisma/client';

export class CreateTerapeutaDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  especialidad: string;

  @IsString()
  @IsNotEmpty()
  cedulaProfesional: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsEmail()
  email: string;

  @IsDateString()
  @IsOptional()
  fechaIngreso?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsEnum(EstadoTerapeuta)
  @IsOptional()
  estado?: EstadoTerapeuta;

  @IsString()
  @IsOptional()
  usuarioId?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
