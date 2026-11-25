import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { EstadoCita } from '@prisma/client';
import { CitasService } from './citas.service.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';
import { FilterCitaDto } from './dto/filter-cita.dto.js';

@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  async agendarCita(
    @Body() createCitaDto: CreateCitaDto,
    @Req() req: Request,
  ) {
    return this.citasService.create(createCitaDto, req.user);
  }

  @Get()
  async obtenerCitas(@Query() query: FilterCitaDto, @Req() req: Request) {
    return this.citasService.findAll(query, req.user);
  }

  @Get('fecha/:fecha')
  async obtenerCitasPorFecha(
    @Param('fecha') fecha: string,
    @Req() req: Request,
  ) {
    return this.citasService.findByDate(fecha, req.user);
  }

  @Get(':id')
  async obtenerCitaPorId(@Param('id') id: string, @Req() req: Request) {
    return this.citasService.findOne(id, req.user);
  }

  @Patch(':id')
  async actualizarCita(
    @Param('id') id: string,
    @Body() updateCitaDto: UpdateCitaDto,
    @Req() req: Request,
  ) {
    return this.citasService.update(id, updateCitaDto, req.user);
  }

  @Patch(':id/status')
  async actualizarEstadoCita(
    @Param('id') id: string,
    @Body('estado') estado: EstadoCita,
    @Req() req: Request,
  ) {
    return this.citasService.updateStatus(id, estado, req.user);
  }

  @Delete(':id')
  async cancelarOEliminarCita(@Param('id') id: string, @Req() req: Request) {
    return this.citasService.remove(id, req.user);
  }
}
