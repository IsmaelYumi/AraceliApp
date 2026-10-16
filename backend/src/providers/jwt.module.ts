import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './jwt.config.js';
import { JwtProviderService } from './jwt.service.js';

@Global()
@Module({
  imports: [JwtModule.register(getJwtConfig())],
  providers: [JwtProviderService],
  exports: [JwtModule, JwtProviderService],
})
export class JwtProviderModule {}
