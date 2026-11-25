import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CitasService } from './citas.service.js';
import { CitasController } from './citas.controller.js';
import { AuthMiddleware } from '../../middlewares/auth.middleware.js';

@Module({
  controllers: [CitasController],
  providers: [CitasService],
  exports: [CitasService],
})
export class CitasModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(CitasController);
  }
}
