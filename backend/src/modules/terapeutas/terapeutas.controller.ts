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
import { EstadoTerapeuta } from '@prisma/client';
import { TerapeutasService } from './terapeutas.service.js';
import { CreateTerapeutaDto } from './dto/create-terapeuta.dto.js';
import { UpdateTerapeutaDto } from './dto/update-terapeuta.dto.js';

@Controller('terapeutas')
export class TerapeutasController {
  constructor(private readonly terapeutasService: TerapeutasService) {}

  @Get()
  async obtenerTerapeutas(
    @Query('search') search?: string,
    @Query('especialidad') especialidad?: string,
    @Query('estado') estado?: EstadoTerapeuta,
  ) {
    return this.terapeutasService.findAll({ search, especialidad, estado });
  }

  @Get(':id')
  async obtenerTerapeutaPorId(@Param('id') id: string) {
    return this.terapeutasService.findOne(id);
  }

  @Post()
  async registrarTerapeuta(@Body() createTerapeutaDto: CreateTerapeutaDto) {
    return this.terapeutasService.create(createTerapeutaDto);
  }

  @Patch(':id')
  async actualizarTerapeuta(
    @Param('id') id: string,
    @Body() updateTerapeutaDto: UpdateTerapeutaDto,
  ) {
    return this.terapeutasService.update(id, updateTerapeutaDto);
  }

  @Delete(':id')
  async eliminarTerapeuta(@Param('id') id: string) {
    return this.terapeutasService.remove(id);
  }
}
