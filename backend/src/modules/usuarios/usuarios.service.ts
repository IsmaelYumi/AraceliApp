import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { EstadoUsuario, RolUsuario } from '@prisma/client';
import { PrismaService } from '../../providers/prisma.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear nuevo usuario con rol específico (ADMIN, MANAGER, USER, GUEST)
   */
  async create(dto: CreateUsuarioDto) {
    const emailLower = dto.email.toLowerCase().trim();

    const existing = await this.prisma.usuario.findUnique({
      where: { email: emailLower },
    });

    if (existing) {
      throw new ConflictException(
        `El correo electrónico "${emailLower}" ya se encuentra registrado.`,
      );
    }

    // El paciente o usuario que no accede al sistema no necesita contraseña
    const hashedPassword = dto.password?.trim()
      ? await bcrypt.hash(dto.password.trim(), 10)
      : `$LOCKED_NO_ACCESS$${crypto.randomUUID()}`;

    const user = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre.trim(),
        email: emailLower,
        password: hashedPassword,
        rol: dto.rol ?? RolUsuario.USER,
        estado: dto.estado ?? EstadoUsuario.ACTIVE,
        telefono: dto.telefono?.trim() || null,
        avatarUrl: dto.avatarUrl?.trim() || null,
      },
    });

    const { password, ...userSanitized } = user;
    void password;
    return userSanitized;
  }

  /**
   * Listar todos los usuarios con filtros opcionales
   */
  async findAll(query?: { rol?: RolUsuario; search?: string }) {
    const whereClause: Record<string, unknown> = {};

    if (query?.rol) {
      whereClause.rol = query.rol;
    }

    if (query?.search) {
      whereClause.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { telefono: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.usuario.findMany({
      where: whereClause,
      include: {
        terapeuta: {
          select: {
            id: true,
            especialidad: true,
            cedulaProfesional: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => {
      const { password, ...sanitized } = user;
      void password;
      return sanitized;
    });
  }

  /**
   * Obtener un usuario por su ID
   */
  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        terapeuta: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    const { password: _, ...userSanitized } = user;
    return userSanitized;
  }

  /**
   * Actualizar datos del usuario
   */
  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {};

    if (dto.nombre) updateData.nombre = dto.nombre.trim();
    if (dto.email) {
      const emailLower = dto.email.toLowerCase().trim();
      const existing = await this.prisma.usuario.findFirst({
        where: { email: emailLower, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(
          `El correo "${emailLower}" ya está siendo utilizado por otro usuario.`,
        );
      }
      updateData.email = emailLower;
    }
    if (dto.rol) updateData.rol = dto.rol;
    if (dto.estado) updateData.estado = dto.estado;
    if (dto.telefono !== undefined) updateData.telefono = dto.telefono?.trim() || null;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl?.trim() || null;
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password.trim(), 10);
    }

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
    });

    const { password, ...userSanitized } = updated;
    void password;
    return userSanitized;
  }

  /**
   * Cambiar estado de activación del usuario
   */
  async updateStatus(id: string, estado: EstadoUsuario) {
    await this.findOne(id);

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { estado },
    });

    const { password, ...userSanitized } = updated;
    void password;
    return userSanitized;
  }

  /**
   * Eliminar usuario
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.usuario.delete({
      where: { id },
    });

    return { message: `Usuario con ID ${id} eliminado correctamente.` };
  }
}