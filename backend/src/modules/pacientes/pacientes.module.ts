import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PacientesController } from './pacientes.controller.js';
import { PacientesService } from './pacientes.service.js';
import { AuthMiddleware } from '../../middlewares/auth.middleware.js';

@Module({
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService],
})
export class PacientesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(PacientesController);
  }
}
