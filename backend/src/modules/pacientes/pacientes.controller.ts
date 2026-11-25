import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { EstadoPaciente } from '@prisma/client';
import { PacientesService } from './pacientes.service.js';
import { CreatePacienteDto } from './dto/create-paciente.dto.js';
import { UpdatePacienteDto } from './dto/update-paciente.dto.js';
import { CreateActividadDto } from './dto/create-actividad.dto.js';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  async obtenerPacientes(
    @Query('search') search?: string,
    @Query('estado') estado?: EstadoPaciente,
  ) {
    return this.pacientesService.findAll({ search, estado });
  }

  @Get(':id')
  async obtenerPacientePorId(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Post()
  async registrarPaciente(
    @Body() createPacienteDto: CreatePacienteDto,
    @Req() req: Request,
  ) {
    if (req.user?.rol !== 'ADMIN') {
      throw new ForbiddenException(
        'Acceso denegado: Únicamente los usuarios con rol ADMINISTRADOR tienen autorización para registrar pacientes.',
      );
    }
    return this.pacientesService.create(createPacienteDto);
  }

  @Patch(':id')
  async actualizarPaciente(
    @Param('id') id: string,
    @Body() updatePacienteDto: UpdatePacienteDto,
  ) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  async eliminarPaciente(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    if (req.user?.rol !== 'ADMIN') {
      throw new ForbiddenException(
        'Acceso denegado: Únicamente los usuarios con rol ADMINISTRADOR tienen autorización para eliminar pacientes.',
      );
    }
    return this.pacientesService.remove(id);
  }

  @Get(':id/actividades')
  async obtenerActividades(@Param('id') id: string) {
    return this.pacientesService.getActivities(id);
  }

  @Post(':id/actividades')
  async registrarActividad(
    @Param('id') id: string,
    @Body() createActividadDto: CreateActividadDto,
    @Req() req: Request,
  ) {
    return this.pacientesService.addActivity(id, createActividadDto, req.user);
  }

  @Post(':id/documentos')
  async adjuntarDocumento(
    @Param('id') id: string,
    @Body() data: { nombre: string; tamano: string; url?: string },
    @Req() req: Request,
  ) {
    const isInformeCentro = data.nombre?.startsWith('[INFORME]');
    // Si no es un informe del centro y el usuario no es ADMIN, se restringe
    if (!isInformeCentro && req.user && req.user.rol !== 'ADMIN') {
      throw new ForbiddenException(
        'Acceso restringido: Solo el administrador puede subir documentos clínicos externos al expediente del paciente.',
      );
    }
    return this.pacientesService.addDocument(id, data);
  }

  @Delete(':id/documentos/:documentoId')
  async eliminarDocumento(
    @Param('id') id: string,
    @Param('documentoId') documentoId: string,
    @Req() req: Request,
  ) {
    if (req.user && req.user.rol !== 'ADMIN') {
      const doc = await this.pacientesService.findDocument(documentoId);
      if (!doc?.nombre?.startsWith('[INFORME]')) {
        throw new ForbiddenException(
          'Acceso restringido: Solo el administrador puede eliminar documentos clínicos del expediente.',
        );
      }
    }
    return this.pacientesService.removeDocument(id, documentoId);
  }
}
