import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EstadoCita } from '@prisma/client';
import { CitasService } from './citas.service.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';
import { FilterCitaDto } from './dto/filter-cita.dto.js';

@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  async agendarCita(@Body() createCitaDto: CreateCitaDto) {
    return this.citasService.create(createCitaDto);
  }

  @Get()
  async obtenerCitas(@Query() query: FilterCitaDto) {
    return this.citasService.findAll(query);
  }

  @Get('fecha/:fecha')
  async obtenerCitasPorFecha(@Param('fecha') fecha: string) {
    return this.citasService.findByDate(fecha);
  }

  @Get(':id')
  async obtenerCitaPorId(@Param('id') id: string) {
    return this.citasService.findOne(id);
  }

  @Patch(':id')
  async actualizarCita(
    @Param('id') id: string,
    @Body() updateCitaDto: UpdateCitaDto,
  ) {
    return this.citasService.update(id, updateCitaDto);
  }

  @Patch(':id/status')
  async actualizarEstadoCita(
    @Param('id') id: string,
    @Body('estado') estado: EstadoCita,
  ) {
    return this.citasService.updateStatus(id, estado);
  }

  @Delete(':id')
  async cancelarOEliminarCita(@Param('id') id: string) {
    return this.citasService.remove(id);
  }
}
