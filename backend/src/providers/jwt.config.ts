import type { JwtModuleOptions } from '@nestjs/jwt';

/**
 * Configuración centralizada para la generación y validación de tokens JWT.
 */
export const getJwtConfig = (): JwtModuleOptions => ({
  global: true,
  secret: process.env.JWT_SECRET || 'araceli-app-secret-key-change-in-prod',
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  },
});
