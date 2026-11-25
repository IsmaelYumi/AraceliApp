import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoTerapeuta, RolUsuario, EstadoUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../../providers/prisma.service.js';
import { CreateTerapeutaDto } from './dto/create-terapeuta.dto.js';
import { UpdateTerapeutaDto } from './dto/update-terapeuta.dto.js';

@Injectable()
export class TerapeutasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper para formatear respuesta de terapeuta
   */
  private formatTerapeuta(t: any) {
    return {
      ...t,
      fechaIngreso: t.fechaIngreso
        ? new Date(t.fechaIngreso).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      totalCitas: t._count?.citas ?? 0,
      totalActividades: t._count?.actividades ?? 0,
    };
  }

  /**
   * Listar todos los terapeutas con filtros opcionales
   */
  async findAll(query?: { search?: string; especialidad?: string; estado?: EstadoTerapeuta }) {
    const where: Record<string, unknown> = {};

    if (query?.estado) {
      where.estado = query.estado;
    }

    if (query?.especialidad) {
      where.especialidad = { contains: query.especialidad, mode: 'insensitive' };
    }

    if (query?.search) {
      where.OR = [
        { nombreCompleto: { contains: query.search, mode: 'insensitive' } },
        { especialidad: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { cedulaProfesional: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const terapeutas = await this.prisma.terapeuta.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            rol: true,
            estado: true,
          },
        },
        _count: {
          select: {
            citas: true,
            actividades: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return terapeutas.map((t) => this.formatTerapeuta(t));
  }

  /**
   * Obtener detalle de terapeuta por su ID
   */
  async findOne(id: string) {
    const terapeuta = await this.prisma.terapeuta.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            rol: true,
            estado: true,
          },
        },
        citas: {
          include: {
            paciente: {
              select: {
                id: true,
                nombreCompleto: true,
                codigoExpediente: true,
              },
            },
          },
          orderBy: { fecha: 'asc' },
        },
        actividades: {
          orderBy: { fecha: 'desc' },
          take: 10,
        },
      },
    });

    if (!terapeuta) {
      throw new NotFoundException(`Terapeuta con ID "${id}" no encontrado.`);
    }

    return this.formatTerapeuta(terapeuta);
  }

  /**
   * Registrar nuevo terapeuta
   */
  async create(dto: CreateTerapeutaDto) {
    const emailLower = dto.email.toLowerCase().trim();
    const cedulaTrimmed = dto.cedulaProfesional.trim();

    const existingEmail = await this.prisma.terapeuta.findUnique({
      where: { email: emailLower },
    });
    if (existingEmail) {
      throw new ConflictException(
        `El correo "${emailLower}" ya está registrado para otro terapeuta.`,
      );
    }

    const existingCedula = await this.prisma.terapeuta.findUnique({
      where: { cedulaProfesional: cedulaTrimmed },
    });
    if (existingCedula) {
      throw new ConflictException(
        `La cédula profesional "${cedulaTrimmed}" ya se encuentra registrada.`,
      );
    }

    const nombreCompleto = `${dto.nombres.trim()} ${dto.apellidos.trim()}`;

    // Crear o vincular usuario con la cédula como contraseña
    const passwordRaw = dto.password?.trim() || cedulaTrimmed;
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    let usuarioId = dto.usuarioId || null;
    if (!usuarioId) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: emailLower },
      });
      if (existingUser) {
        usuarioId = existingUser.id;
        if (!existingUser.password) {
          await this.prisma.usuario.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
          });
        }
      } else {
        const newUser = await this.prisma.usuario.create({
          data: {
            nombre: nombreCompleto,
            email: emailLower,
            password: hashedPassword,
            rol: RolUsuario.USER,
            estado: EstadoUsuario.ACTIVE,
            telefono: dto.telefono.trim(),
            avatarUrl: dto.avatarUrl?.trim() || null,
          },
        });
        usuarioId = newUser.id;
      }
    }

    const terapeuta = await this.prisma.terapeuta.create({
      data: {
        nombres: dto.nombres.trim(),
        apellidos: dto.apellidos.trim(),
        nombreCompleto,
        especialidad: dto.especialidad.trim(),
        cedulaProfesional: cedulaTrimmed,
        telefono: dto.telefono.trim(),
        email: emailLower,
        fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : new Date(),
        avatarUrl: dto.avatarUrl?.trim() || null,
        estado: dto.estado || EstadoTerapeuta.ACTIVO,
        usuarioId,
      },
    });

    return this.formatTerapeuta(terapeuta);
  }

  /**
   * Actualizar terapeuta
   */
  async update(id: string, dto: UpdateTerapeutaDto) {
    await this.findOne(id);

    const dataToUpdate: Record<string, unknown> = {};
    if (dto.nombres) dataToUpdate.nombres = dto.nombres.trim();
    if (dto.apellidos) dataToUpdate.apellidos = dto.apellidos.trim();
    if (dto.nombres || dto.apellidos) {
      const current = await this.prisma.terapeuta.findUnique({ where: { id } });
      const nombres = dto.nombres?.trim() || current?.nombres || '';
      const apellidos = dto.apellidos?.trim() || current?.apellidos || '';
      dataToUpdate.nombreCompleto = `${nombres} ${apellidos}`.trim();
    }
    if (dto.especialidad) dataToUpdate.especialidad = dto.especialidad.trim();
    if (dto.telefono) dataToUpdate.telefono = dto.telefono.trim();
    if (dto.avatarUrl !== undefined) dataToUpdate.avatarUrl = dto.avatarUrl?.trim() || null;
    if (dto.estado) dataToUpdate.estado = dto.estado;

    if (dto.email) {
      const emailLower = dto.email.toLowerCase().trim();
      const existing = await this.prisma.terapeuta.findFirst({
        where: { email: emailLower, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`El correo "${emailLower}" ya está en uso.`);
      }
      dataToUpdate.email = emailLower;
    }

    if (dto.cedulaProfesional) {
      const cedulaTrimmed = dto.cedulaProfesional.trim();
      const existing = await this.prisma.terapeuta.findFirst({
        where: { cedulaProfesional: cedulaTrimmed, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`La cédula "${cedulaTrimmed}" ya está en uso.`);
      }
      dataToUpdate.cedulaProfesional = cedulaTrimmed;
    }

    const updated = await this.prisma.terapeuta.update({
      where: { id },
      data: dataToUpdate,
    });

    // Sincronizar automáticamente en la cuenta de usuario vinculada
    if (updated.usuarioId) {
      const userUpdate: Record<string, unknown> = {};
      if (dataToUpdate.nombreCompleto) userUpdate.nombre = dataToUpdate.nombreCompleto;
      if (dataToUpdate.email) userUpdate.email = dataToUpdate.email;
      if (dataToUpdate.telefono !== undefined) userUpdate.telefono = dataToUpdate.telefono;
      if (dto.avatarUrl !== undefined) userUpdate.avatarUrl = dto.avatarUrl?.trim() || null;
      if (Object.keys(userUpdate).length > 0) {
        await this.prisma.usuario.update({
          where: { id: updated.usuarioId },
          data: userUpdate,
        });
      }
    } else {
      const matchingUser = await this.prisma.usuario.findUnique({
        where: { email: updated.email },
      });
      if (matchingUser) {
        await this.prisma.terapeuta.update({
          where: { id: updated.id },
          data: { usuarioId: matchingUser.id },
        });
        if (dto.avatarUrl !== undefined) {
          await this.prisma.usuario.update({
            where: { id: matchingUser.id },
            data: { avatarUrl: dto.avatarUrl?.trim() || null },
          });
        }
      }
    }

    return this.formatTerapeuta(updated);
  }

  /**
   * Eliminar o desactivar terapeuta
   */
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.terapeuta.delete({ where: { id } });
    return { message: `Terapeuta con ID "${id}" eliminado exitosamente.` };
  }
}
