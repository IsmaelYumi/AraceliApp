import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { EstadoUsuario, RolUsuario } from '@prisma/client';
import { PrismaService } from '../../providers/prisma.service.js';
import { JwtProviderService } from '../../providers/jwt.service.js';
import { LoginDto, RegisterDto } from './dto/index.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtProvider: JwtProviderService,
  ) {}

  /**
   * Inicio de sesión universal para todos los tipos de usuario.
   */
  async login(loginDto: LoginDto) {
    const emailLower = loginDto.email.toLowerCase().trim();

    const user = await this.prisma.usuario.findUnique({
      where: { email: emailLower },
      include: {
        terapeuta: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas. Por favor verifica tu correo y contraseña.',
      );
    }

    if (
      user.estado === EstadoUsuario.BLOCKED ||
      user.estado === EstadoUsuario.INACTIVE
    ) {
      throw new ForbiddenException(
        'Tu cuenta se encuentra inactiva o bloqueada. Por favor contacta al administrador.',
      );
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Este usuario no tiene acceso directo al sistema (usuario/paciente sin contraseña).',
      );
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        'Credenciales inválidas. Por favor verifica tu correo y contraseña.',
      );
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };

    const accessToken = await this.jwtProvider.generateToken(tokenPayload);
    const { password: _password, ...userSanitized } = user;

    return {
      message: 'Inicio de sesión exitoso',
      accessToken,
      user: userSanitized,
    };
  }

  /**
   * Registro completo adaptado para todos los tipos de usuario:
   * - ADMIN: Administrador general del centro
   * - MANAGER: Coordinador clínico / supervisor
   * - USER: Terapeuta / especialista clínico o usuario general
   * - GUEST: Tutor / familiar / paciente sin acceso al sistema
   */
  async register(registerDto: RegisterDto) {
    const emailLower = registerDto.email.toLowerCase().trim();

    // 1. Validar que el correo no esté registrado previamente
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      throw new ConflictException(
        `El correo electrónico "${emailLower}" ya está registrado en la plataforma.`,
      );
    }

    // 2. Determinar rol y estado
    const rol = registerDto.rol ?? RolUsuario.USER;
    const estado = EstadoUsuario.ACTIVE;

    // 3. Hashear contraseña si se proporcionó (el paciente no accede al sistema, no necesita contraseña)
    const hashedPassword = registerDto.password?.trim()
      ? await bcrypt.hash(registerDto.password.trim(), 10)
      : `$LOCKED_NO_ACCESS$${crypto.randomUUID()}`;

    // 4. Crear registro en la tabla de usuarios
    const newUser = await this.prisma.usuario.create({
      data: {
        nombre: registerDto.nombre.trim(),
        email: emailLower,
        password: hashedPassword,
        rol,
        estado,
        telefono: registerDto.telefono?.trim() || null,
        avatarUrl: registerDto.avatarUrl?.trim() || null,
      },
    });

    // 5. Vincular o crear ficha clínica de Terapeuta si corresponde
    let terapeutaRecord = null;

    // Caso A: Existe un terapeuta precargado en la clínica con este correo
    const existingTherapist = await this.prisma.terapeuta.findUnique({
      where: { email: emailLower },
    });
    if (existingTherapist) {
      terapeutaRecord = await this.prisma.terapeuta.update({
        where: { id: existingTherapist.id },
        data: { usuarioId: newUser.id },
      });
    } else if (registerDto.cedulaProfesional?.trim()) {
      // Caso B: El usuario aportó cédula profesional para registrarse como terapeuta
      const cedulaTrimmed = registerDto.cedulaProfesional.trim();
      const existingCedula = await this.prisma.terapeuta.findUnique({
        where: { cedulaProfesional: cedulaTrimmed },
      });

      if (!existingCedula) {
        const parts = registerDto.nombre.trim().split(' ');
        const nombres = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
        const apellidos = parts.length > 1 ? parts.slice(1).join(' ') : '';

        terapeutaRecord = await this.prisma.terapeuta.create({
          data: {
            nombres,
            apellidos,
            nombreCompleto: registerDto.nombre.trim(),
            especialidad:
              registerDto.especialidad?.trim() || 'Estimulación Temprana Pediátrica',
            cedulaProfesional: cedulaTrimmed,
            telefono: registerDto.telefono?.trim() || 'No especificado',
            email: emailLower,
            usuarioId: newUser.id,
          },
        });
      }
    }

    // 6. Generar JWT firmado a través de JwtProviderService
    const tokenPayload = {
      sub: newUser.id,
      email: newUser.email,
      nombre: newUser.nombre,
      rol: newUser.rol,
    };
    const accessToken = await this.jwtProvider.generateToken(tokenPayload);

    // 7. Sanitizar respuesta
    const { password: _password, ...userSanitized } = newUser;

    return {
      message: `Usuario registrado exitosamente con rol ${newUser.rol}`,
      accessToken,
      user: {
        ...userSanitized,
        terapeuta: terapeutaRecord,
      },
    };
  }

  /**
   * Obtener perfil del usuario por su ID
   */
  async getProfile(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { terapeuta: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password: _password, ...userSanitized } = user;
    return userSanitized;
  }
}
