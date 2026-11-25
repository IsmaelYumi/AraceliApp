import { Module } from '@nestjs/common';
import { TerapeutasController } from './terapeutas.controller.js';
import { TerapeutasService } from './terapeutas.service.js';

@Module({
  controllers: [TerapeutasController],
  providers: [TerapeutasService],
  exports: [TerapeutasService],
})
export class TerapeutasModule {}
