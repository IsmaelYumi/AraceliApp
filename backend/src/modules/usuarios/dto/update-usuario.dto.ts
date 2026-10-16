import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoUsuario } from '@prisma/client';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsEnum(EstadoUsuario, { message: 'El estado debe ser ACTIVE, INACTIVE, PENDING o BLOCKED' })
  @IsOptional()
  estado?: EstadoUsuario;
}
