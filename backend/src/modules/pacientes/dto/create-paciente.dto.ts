import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPaciente, GeneroPaciente } from '@prisma/client';

export class TutorLegalDto {
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @IsString()
  @IsNotEmpty()
  parentesco: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}

export class SegundoContactoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  parentesco: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;
}

export class DocumentoPdfDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tamano: string;

  @IsString()
  @IsOptional()
  url?: string;
}

export class CreatePacienteDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsEnum(GeneroPaciente)
  @IsOptional()
  genero?: GeneroPaciente;

  @IsString()
  @IsOptional()
  grupoSanguineo?: string;

  @IsString()
  @IsNotEmpty()
  diagnosticoPrincipal: string;

  @IsString()
  @IsOptional()
  condicionesMedicas?: string;

  @IsString()
  @IsOptional()
  observacionesAdmision?: string;

  @IsString()
  @IsOptional()
  antecedentes?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsEnum(EstadoPaciente)
  @IsOptional()
  estado?: EstadoPaciente;

  @ValidateNested()
  @Type(() => TutorLegalDto)
  @IsOptional()
  tutor?: TutorLegalDto;

  @ValidateNested()
  @Type(() => SegundoContactoDto)
  @IsOptional()
  segundoContacto?: SegundoContactoDto;

  @ValidateNested({ each: true })
  @Type(() => DocumentoPdfDto)
  @IsOptional()
  documentosPdf?: DocumentoPdfDto[];
}
