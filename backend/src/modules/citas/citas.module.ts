import { Module } from '@nestjs/common';
import { CitasService } from './citas.service.js';
import { CitasController } from './citas.controller.js';

@Module({
  controllers: [CitasController],
  providers: [CitasService],
  exports: [CitasService],
})
export class CitasModule {}
