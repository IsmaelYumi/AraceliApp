import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './providers/prisma.module.js';
import { JwtProviderModule } from './providers/jwt.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsuariosModule } from './modules/usuarios/usuarios.module.js';
import { CitasModule } from './modules/citas/citas.module.js';

@Module({
  imports: [PrismaModule, JwtProviderModule, AuthModule, UsuariosModule, CitasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
