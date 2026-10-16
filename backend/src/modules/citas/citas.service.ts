import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCita } from '@prisma/client';
import { PrismaService } from '../../providers/prisma.service.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';
import { FilterCitaDto } from './dto/filter-cita.dto.js';

@Injectable()
export class CitasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Agendar una nueva cita terapéutica
   */
  async create(dto: CreateCitaDto) {
    // 1. Validar existencia del paciente
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: dto.pacienteId },
    });
    if (!paciente) {
      throw new NotFoundException(
        `Paciente con ID "${dto.pacienteId}" no encontrado.`,
      );
    }

    // 2. Validar existencia del terapeuta
    const terapeuta = await this.prisma.terapeuta.findUnique({
      where: { id: dto.terapeutaId },
    });
    if (!terapeuta) {
      throw new NotFoundException(
        `Terapeuta con ID "${dto.terapeutaId}" no encontrado.`,
      );
    }

    // 3. Validar consistencia horaria
    if (dto.horaInicio >= dto.horaFin) {
      throw new BadRequestException(
        'La hora de inicio debe ser anterior a la hora de fin.',
      );
    }

    // 4. Crear la cita en base de datos
    const fechaParsed = new Date(dto.fecha);

    const cita = await this.prisma.cita.create({
      data: {
        pacienteId: dto.pacienteId,
        terapeutaId: dto.terapeutaId,
        tipoTerapia: dto.tipoTerapia.trim(),
        fecha: fechaParsed,
        horaInicio: dto.horaInicio.trim(),
        horaFin: dto.horaFin.trim(),
        notas: dto.notas?.trim() || null,
        estado: dto.estado ?? EstadoCita.PROGRAMADA,
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombreCompleto: true,
            codigoExpediente: true,
            diagnosticoPrincipal: true,
          },
        },
        terapeuta: {
          select: {
            id: true,
            nombreCompleto: true,
            especialidad: true,
          },
        },
      },
    });

    return this.formatCitaResponse(cita);
  }

  /**
   * Obtener lista de citas con filtros opcionales (por fecha, terapeuta, paciente, estado)
   */
  async findAll(query?: FilterCitaDto) {
    const where: Record<string, unknown> = {};

    if (query?.pacienteId) where.pacienteId = query.pacienteId;
    if (query?.terapeutaId) where.terapeutaId = query.terapeutaId;
    if (query?.estado) where.estado = query.estado;

    if (query?.fecha) {
      const fechaBase = new Date(query.fecha);
      const startOfDay = new Date(fechaBase);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(fechaBase);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.fecha = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const citas = await this.prisma.cita.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            nombreCompleto: true,
            codigoExpediente: true,
            diagnosticoPrincipal: true,
          },
        },
        terapeuta: {
          select: {
            id: true,
            nombreCompleto: true,
            especialidad: true,
          },
        },
      },
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    });

    return citas.map((cita) => this.formatCitaResponse(cita));
  }

  /**
   * Obtener citas por fecha específica (YYYY-MM-DD)
   */
  async findByDate(dateStr: string) {
    return this.findAll({ fecha: dateStr });
  }

  /**
   * Obtener detalle de una cita por su ID
   */
  async findOne(id: string) {
    const cita = await this.prisma.cita.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            nombreCompleto: true,
            codigoExpediente: true,
            diagnosticoPrincipal: true,
          },
        },
        terapeuta: {
          select: {
            id: true,
            nombreCompleto: true,
            especialidad: true,
          },
        },
      },
    });

    if (!cita) {
      throw new NotFoundException(`Cita con ID "${id}" no encontrada.`);
    }

    return this.formatCitaResponse(cita);
  }

  /**
   * Actualizar una cita existente
   */
  async update(id: string, dto: UpdateCitaDto) {
    await this.findOne(id);

    if (dto.pacienteId) {
      const paciente = await this.prisma.paciente.findUnique({
        where: { id: dto.pacienteId },
      });
      if (!paciente) {
        throw new NotFoundException(
          `Paciente con ID "${dto.pacienteId}" no encontrado.`,
        );
      }
    }

    if (dto.terapeutaId) {
      const terapeuta = await this.prisma.terapeuta.findUnique({
        where: { id: dto.terapeutaId },
      });
      if (!terapeuta) {
        throw new NotFoundException(
          `Terapeuta con ID "${dto.terapeutaId}" no encontrado.`,
        );
      }
    }

    if (dto.horaInicio && dto.horaFin && dto.horaInicio >= dto.horaFin) {
      throw new BadRequestException(
        'La hora de inicio debe ser anterior a la hora de fin.',
      );
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (dto.pacienteId) dataToUpdate.pacienteId = dto.pacienteId;
    if (dto.terapeutaId) dataToUpdate.terapeutaId = dto.terapeutaId;
    if (dto.tipoTerapia) dataToUpdate.tipoTerapia = dto.tipoTerapia.trim();
    if (dto.fecha) dataToUpdate.fecha = new Date(dto.fecha);
    if (dto.horaInicio) dataToUpdate.horaInicio = dto.horaInicio.trim();
    if (dto.horaFin) dataToUpdate.horaFin = dto.horaFin.trim();
    if (dto.notas !== undefined) dataToUpdate.notas = dto.notas?.trim() || null;
    if (dto.estado) dataToUpdate.estado = dto.estado;

    const updated = await this.prisma.cita.update({
      where: { id },
      data: dataToUpdate,
      include: {
        paciente: {
          select: {
            id: true,
            nombreCompleto: true,
            codigoExpediente: true,
            diagnosticoPrincipal: true,
          },
        },
        terapeuta: {
          select: {
            id: true,
            nombreCompleto: true,
            especialidad: true,
          },
        },
      },
    });

    return this.formatCitaResponse(updated);
  }

  /**
   * Actualizar únicamente el estado de una cita (PROGRAMADA, COMPLETADA, CANCELADA)
   */
  async updateStatus(id: string, estado: EstadoCita) {
    await this.findOne(id);

    const updated = await this.prisma.cita.update({
      where: { id },
      data: { estado },
      include: {
        paciente: {
          select: {
            id: true,
            nombreCompleto: true,
            codigoExpediente: true,
            diagnosticoPrincipal: true,
          },
        },
        terapeuta: {
          select: {
            id: true,
            nombreCompleto: true,
            especialidad: true,
          },
        },
      },
    });

    return this.formatCitaResponse(updated);
  }

  /**
   * Eliminar una cita
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.cita.delete({
      where: { id },
    });

    return { message: `Cita con ID "${id}" eliminada exitosamente.` };
  }

  /**
   * Helper para estructurar la respuesta con los nombres aplanados
   * compatibles tanto con el Backend como con el Frontend.
   */
  private formatCitaResponse(cita: any) {
    return {
      ...cita,
      pacienteNombre: cita.paciente?.nombreCompleto || 'Paciente',
      terapeutaNombre: cita.terapeuta?.nombreCompleto || 'Terapeuta',
      fechaFormatted: cita.fecha instanceof Date ? cita.fecha.toISOString().split('T')[0] : cita.fecha,
    };
  }
}
