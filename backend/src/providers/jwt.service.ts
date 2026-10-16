import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';

export interface JwtUserPayload {
  sub: string;
  email: string;
  nombre: string;
  rol: string;
  [key: string]: unknown;
}

@Injectable()
export class JwtProviderService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Genera y firma un token JWT con la información del usuario
   */
  async generateToken(
    payload: JwtUserPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, options);
  }

  /**
   * Valida la firma del token y retorna el payload decodificado
   */
  async verifyToken<T extends object = JwtUserPayload>(
    token: string,
  ): Promise<T> {
    try {
      return await this.jwtService.verifyAsync<T>(token);
    } catch {
      throw new UnauthorizedException(
        'El token de autenticación es inválido o ha expirado.',
      );
    }
  }

  /**
   * Decodifica el token sin verificar la firma (para inspección rápida)
   */
  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
}
