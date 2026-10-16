import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';
import { AuthMiddleware } from '../../middlewares/auth.middleware.js';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar el middleware de validación JWT a todas las rutas de Usuarios
    consumer
      .apply(AuthMiddleware)
      .forRoutes(UsuariosController);
  }
}
