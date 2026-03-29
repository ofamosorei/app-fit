import { Controller, Post, Get, Body, Query, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RateLimit } from '../security/rate-limit.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/magic-link
  // Body: { "email": "usuario@gmail.com" }
  @RateLimit({ limit: 5, windowMs: 10 * 60 * 1000 })
  @Post('magic-link')
  async requestMagicLink(@Body('email') email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Email inválido.');
    }
    return this.authService.sendMagicLink(email.toLowerCase().trim());
  }

  // GET /auth/verify?token=xxxx
  // Retorna: { "accessToken": "eyJhbGci..." }
  @Get('verify')
  async verifyToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token não informado.');
    }
    return this.authService.verifyMagicLink(token);
  }

  @RateLimit({ limit: 10, windowMs: 10 * 60 * 1000 })
  @Post('login-password')
  async loginWithPassword(@Body() body: { email: string; password: string }) {
    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;

    if (!email || !email.includes('@') || !password) {
      throw new BadRequestException('Informe email e senha.');
    }

    return this.authService.loginWithPassword(email, password);
  }

  // GET /auth/me
  // Valida o token JWT e retorna o status do usuario
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return req.user;
  }

  // PUT /auth/me/profile
  // Salva os dados de onboarding no perfil do usuário
  @UseGuards(JwtAuthGuard)
  @Post('me/profile')
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    return this.authService.updateUserProfile(req.user.id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/password')
  async setPassword(
    @Request() req: any,
    @Body() body: { password: string; confirmPassword: string },
  ) {
    return this.authService.setPassword(req.user.id, body?.password, body?.confirmPassword);
  }
}
