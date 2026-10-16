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
import { EstadoUsuario, RolUsuario } from '@prisma/client';
import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async registrarUsuario(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  async obtenerUsuarios(
    @Query('rol') rol?: RolUsuario,
    @Query('search') search?: string,
  ) {
    return this.usuariosService.findAll({ rol, search });
  }

  @Get(':id')
  async obtenerUsuarioPorId(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  async actualizarUsuario(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/status')
  async actualizarEstado(
    @Param('id') id: string,
    @Body('estado') estado: EstadoUsuario,
  ) {
    return this.usuariosService.updateStatus(id, estado);
  }

  @Delete(':id')
  async eliminarUsuario(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
