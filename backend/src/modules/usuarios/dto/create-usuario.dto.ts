import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RolUsuario, EstadoUsuario } from '@prisma/client';

export class CreateUsuarioDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  nombre!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsEnum(RolUsuario, { message: 'El rol debe ser ADMIN, USER, MANAGER o GUEST' })
  @IsOptional()
  rol?: RolUsuario = RolUsuario.USER;

  @IsEnum(EstadoUsuario, { message: 'El estado debe ser ACTIVE, INACTIVE, PENDING o BLOCKED' })
  @IsOptional()
  estado?: EstadoUsuario = EstadoUsuario.ACTIVE;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  telefono?: string;

  @IsString({ message: 'El avatar debe ser una URL o texto' })
  @IsOptional()
  avatarUrl?: string;
}
