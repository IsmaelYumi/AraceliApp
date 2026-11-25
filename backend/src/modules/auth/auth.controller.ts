import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtProviderService } from '../../providers/jwt.service.js';
import { LoginDto, RegisterDto } from './dto/index.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtProvider: JwtProviderService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  async getProfile(@Headers('authorization') authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización no proporcionado.');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const payload = await this.jwtProvider.verifyToken(token);
    return this.authService.getProfile(payload.sub);
  }

  @Post('logout')
  async logout() {
    return { message: 'Sesión finalizada exitosamente.' };
  }
}
