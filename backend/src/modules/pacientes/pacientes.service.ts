import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoPaciente } from '@prisma/client';
import { PrismaService } from '../../providers/prisma.service.js';
import { CreatePacienteDto } from './dto/create-paciente.dto.js';
import { UpdatePacienteDto } from './dto/update-paciente.dto.js';
import { CreateActividadDto } from './dto/create-actividad.dto.js';

@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper para calcular la edad textual del paciente (ej. "2 años 4 meses")
   */
  private calculateAgeText(birthDate: Date): string {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years === 0) {
      return `${Math.max(1, months)} meses`;
    }
    return `${years} años${months > 0 ? ` ${months} meses` : ''}`;
  }

  /**
   * Da formato consistente a la entidad Paciente para el Frontend
   */
  private formatPacienteResponse(paciente: any) {
    const birthDate = new Date(paciente.fechaNacimiento);
    const edadTexto = this.calculateAgeText(birthDate);

    return {
      ...paciente,
      edadTexto,
      fechaNacimiento: birthDate.toISOString().split('T')[0],
      fechaIngreso: paciente.fechaIngreso
        ? new Date(paciente.fechaIngreso).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      tutor: paciente.tutor || {
        nombreCompleto: 'Sin tutor registrado',
        parentesco: 'Apoderado',
        telefono: 'N/A',
      },
      segundoContacto: paciente.segundoContacto || null,
      documentosPdf: paciente.documentosPdf || [],
    };
  }

  /**
   * Listar todos los pacientes con filtros opcionales
   */
  async findAll(query?: { search?: string; estado?: EstadoPaciente }) {
    const where: Record<string, unknown> = {};

    if (query?.estado) {
      where.estado = query.estado;
    }

    if (query?.search) {
      where.OR = [
        { nombreCompleto: { contains: query.search, mode: 'insensitive' } },
        { codigoExpediente: { contains: query.search, mode: 'insensitive' } },
        { diagnosticoPrincipal: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const pacientes = await this.prisma.paciente.findMany({
      where,
      include: {
        tutor: true,
        segundoContacto: true,
        documentosPdf: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pacientes.map((p) => this.formatPacienteResponse(p));
  }

  /**
   * Obtener detalle completo de un paciente por su ID
   */
  async findOne(id: string) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
      include: {
        tutor: true,
        segundoContacto: true,
        documentosPdf: true,
        actividades: {
          orderBy: { fecha: 'desc' },
        },
        citas: {
          orderBy: { fecha: 'asc' },
        },
      },
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID "${id}" no encontrado.`);
    }
    return this.formatPacienteResponse(paciente);
  }

  /**
   * Registrar un nuevo paciente con su tutor y segundo contacto
   */
  async create(dto: CreatePacienteDto) {
    const totalCount = await this.prisma.paciente.count();
    const codigoExpediente = `EXP-2026-${String(totalCount + 1).padStart(3, '0')}`;

    const nombreCompleto = `${dto.nombres.trim()} ${dto.apellidos.trim()}`;

    const paciente = await this.prisma.paciente.create({
      data: {
        codigoExpediente,
        nombres: dto.nombres.trim(),
        apellidos: dto.apellidos.trim(),
        nombreCompleto,
        fechaNacimiento: new Date(dto.fechaNacimiento),
        genero: dto.genero || 'masculino',
        grupoSanguineo: dto.grupoSanguineo?.trim() || null,
        diagnosticoPrincipal: dto.diagnosticoPrincipal.trim(),
        condicionesMedicas: dto.condicionesMedicas?.trim() || null,
        observacionesAdmision: dto.observacionesAdmision?.trim() || null,
        antecedentes: dto.antecedentes?.trim() || null,
        avatarUrl: dto.avatarUrl?.trim() || null,
        estado: dto.estado || EstadoPaciente.ACTIVO,
        tutor: dto.tutor
          ? {
              create: {
                nombreCompleto: dto.tutor.nombreCompleto.trim(),
                parentesco: dto.tutor.parentesco.trim(),
                dni: dto.tutor.dni?.trim() || null,
                telefono: dto.tutor.telefono.trim(),
                email: dto.tutor.email?.trim() || null,
                direccion: dto.tutor.direccion?.trim() || null,
              },
            }
          : undefined,
        segundoContacto: dto.segundoContacto
          ? {
              create: {
                nombre: dto.segundoContacto.nombre.trim(),
                parentesco: dto.segundoContacto.parentesco.trim(),
                telefono: dto.segundoContacto.telefono.trim(),
              },
            }
          : undefined,
        documentosPdf: dto.documentosPdf?.length
          ? {
              create: dto.documentosPdf.map((d) => ({
                nombre: d.nombre.trim(),
                tamano: d.tamano.trim(),
                url: d.url?.trim() || null,
              })),
            }
          : undefined,
      },
      include: {
        tutor: true,
        segundoContacto: true,
        documentosPdf: true,
      },
    });

    return this.formatPacienteResponse(paciente);
  }

  /**
   * Actualizar expediente del paciente
   */
  async update(id: string, dto: UpdatePacienteDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {};
    if (dto.nombres) updateData.nombres = dto.nombres.trim();
    if (dto.apellidos) updateData.apellidos = dto.apellidos.trim();
    if (dto.nombres || dto.apellidos) {
      const current = await this.prisma.paciente.findUnique({ where: { id } });
      const nombres = dto.nombres?.trim() || current?.nombres || '';
      const apellidos = dto.apellidos?.trim() || current?.apellidos || '';
      updateData.nombreCompleto = `${nombres} ${apellidos}`.trim();
    }
    if (dto.fechaNacimiento) updateData.fechaNacimiento = new Date(dto.fechaNacimiento);
    if (dto.genero) updateData.genero = dto.genero;
    if (dto.grupoSanguineo !== undefined) updateData.grupoSanguineo = dto.grupoSanguineo;
    if (dto.diagnosticoPrincipal) updateData.diagnosticoPrincipal = dto.diagnosticoPrincipal.trim();
    if (dto.condicionesMedicas !== undefined) updateData.condicionesMedicas = dto.condicionesMedicas?.trim() || null;
    if (dto.observacionesAdmision !== undefined) updateData.observacionesAdmision = dto.observacionesAdmision?.trim() || null;
    if (dto.antecedentes !== undefined) updateData.antecedentes = dto.antecedentes?.trim() || null;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl?.trim() || null;
    if (dto.estado) updateData.estado = dto.estado;

    // Actualizar tutor si se envía
    if (dto.tutor) {
      await this.prisma.tutorLegal.upsert({
        where: { pacienteId: id },
        create: {
          pacienteId: id,
          nombreCompleto: dto.tutor.nombreCompleto.trim(),
          parentesco: dto.tutor.parentesco.trim(),
          dni: dto.tutor.dni?.trim() || null,
          telefono: dto.tutor.telefono.trim(),
          email: dto.tutor.email?.trim() || null,
          direccion: dto.tutor.direccion?.trim() || null,
        },
        update: {
          nombreCompleto: dto.tutor.nombreCompleto.trim(),
          parentesco: dto.tutor.parentesco.trim(),
          dni: dto.tutor.dni?.trim() || null,
          telefono: dto.tutor.telefono.trim(),
          email: dto.tutor.email?.trim() || null,
          direccion: dto.tutor.direccion?.trim() || null,
        },
      });
    }

    const updated = await this.prisma.paciente.update({
      where: { id },
      data: updateData,
      include: {
        tutor: true,
        segundoContacto: true,
        documentosPdf: true,
      },
    });

    return this.formatPacienteResponse(updated);
  }

  /**
   * Eliminar un paciente y toda su información asociada en cascada
   */
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.$transaction([
      this.prisma.documentoPdf.deleteMany({ where: { pacienteId: id } }),
      this.prisma.actividadClinica.deleteMany({ where: { pacienteId: id } }),
      this.prisma.cita.deleteMany({ where: { pacienteId: id } }),
      this.prisma.tutorLegal.deleteMany({ where: { pacienteId: id } }),
      this.prisma.segundoContacto.deleteMany({ where: { pacienteId: id } }),
      this.prisma.paciente.delete({ where: { id } }),
    ]);
    return { message: `Paciente con ID "${id}" y toda su información asociada han sido eliminados exitosamente.` };
  }

  /**
   * Obtener las actividades clínicas de un paciente
   */
  async getActivities(pacienteId: string) {
    await this.findOne(pacienteId);
    return this.prisma.actividadClinica.findMany({
      where: { pacienteId },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Registrar nueva evolución o actividad clínica
   */
  async addActivity(pacienteId: string, dto: CreateActividadDto, userPayload?: any) {
    await this.findOne(pacienteId);

    // 1. Determinar terapeuta responsable y nombre
    let terapeutaId = dto.terapeutaId?.trim() || undefined;
    let terapeutaNombre = dto.terapeutaNombre?.trim() || undefined;

    if (userPayload) {
      if (!terapeutaId && userPayload.terapeutaId) {
        terapeutaId = userPayload.terapeutaId;
      }
      if (!terapeutaNombre && userPayload.nombre) {
        terapeutaNombre = userPayload.nombre;
      }
      if (!terapeutaId) {
        const terapeutaEncontrado = await this.prisma.terapeuta.findFirst({
          where: {
            OR: [
              { usuarioId: userPayload.sub },
              { email: userPayload.email },
              { email: typeof userPayload.email === 'string' ? userPayload.email.toLowerCase() : undefined },
            ].filter(Boolean) as any,
          },
        });
        if (terapeutaEncontrado) {
          terapeutaId = terapeutaEncontrado.id;
          if (!terapeutaNombre) terapeutaNombre = terapeutaEncontrado.nombreCompleto;
        }
      }
    }

    let terapeuta = null;
    if (terapeutaId) {
      terapeuta = await this.prisma.terapeuta.findUnique({
        where: { id: terapeutaId },
      });
      if (terapeuta && !terapeutaNombre) {
        terapeutaNombre = terapeuta.nombreCompleto;
      }
    }

    const especialidad =
      dto.especialidad?.trim() ||
      terapeuta?.especialidad?.trim() ||
      (userPayload?.especialidad as string)?.trim() ||
      'Estimulación Temprana';

    // 2. Calcular número de proceso automático autoincremental si no se envía
    let numeroProceso = dto.numeroProceso?.trim();
    if (!numeroProceso) {
      const existingActivities = await this.prisma.actividadClinica.findMany({
        where: { pacienteId },
        select: { numeroProceso: true },
      });
      let maxNum = existingActivities.length;
      for (const act of existingActivities) {
        const match = act.numeroProceso?.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
      numeroProceso = `PROC-${String(maxNum + 1).padStart(2, '0')}`;
    }

    return this.prisma.actividadClinica.create({
      data: {
        pacienteId,
        terapeutaId: terapeutaId || null,
        terapeutaNombre: terapeutaNombre || 'Especialista en Sesión',
        especialidad,
        titulo: dto.titulo.trim(),
        numeroProceso,
        duracionMinutos: dto.duracionMinutos || 45,
        descripcion: dto.descripcion.trim(),
        observaciones: dto.observaciones?.trim() || null,
        revisado: dto.revisado ?? false,
      },
    });
  }

  /**
   * Adjuntar documento PDF al expediente del paciente
   */
  async addDocument(
    pacienteId: string,
    data: { nombre: string; tamano: string; url?: string },
  ) {
    await this.findOne(pacienteId);

    return this.prisma.documentoPdf.create({
      data: {
        pacienteId,
        nombre: data.nombre.trim(),
        tamano: data.tamano.trim(),
        url: data.url?.trim() || null,
      },
    });
  }

  /**
   * Buscar un documento PDF por su ID
   */
  async findDocument(documentoId: string) {
    return this.prisma.documentoPdf.findUnique({
      where: { id: documentoId },
    });
  }

  /**
   * Eliminar un documento PDF del expediente
   */
  async removeDocument(pacienteId: string, documentoId: string) {
    await this.findOne(pacienteId);

    const doc = await this.prisma.documentoPdf.findUnique({
      where: { id: documentoId },
    });

    if (!doc || doc.pacienteId !== pacienteId) {
      throw new NotFoundException(
        `Documento PDF con ID "${documentoId}" no encontrado para este paciente.`,
      );
    }

    await this.prisma.documentoPdf.delete({
      where: { id: documentoId },
    });

    return { message: 'Documento PDF eliminado exitosamente.' };
  }
}
