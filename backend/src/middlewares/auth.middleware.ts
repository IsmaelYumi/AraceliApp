import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import {
  JwtProviderService,
  type JwtUserPayload,
} from '../providers/jwt.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

/**
 * Middleware para validar el token JWT en las solicitudes entrantes.
 * Extrae el Bearer token, verifica su firma con JwtProviderService
 * e inyecta el usuario autenticado en `req.user`.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtProvider: JwtProviderService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(
        'Token de autorización no proporcionado en la solicitud.',
      );
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Formato de autorización no válido. Debe ser: Bearer <token>',
      );
    }

    try {
      const payload = await this.jwtProvider.verifyToken<JwtUserPayload>(token);
      req.user = payload;
      next();
    } catch {
      throw new UnauthorizedException(
        'Token JWT inválido, adulterado o expirado.',
      );
    }
  }
}
