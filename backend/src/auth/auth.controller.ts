import { Controller, Post, Get, Body, Query, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/magic-link
  // Body: { "email": "usuario@gmail.com" }
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

  // POST /auth/demo-login BYPASS TEMPORÁRIO PARA GRAVAÇÃO DE VÍDEOS
  @Post('demo-login')
  async demoLogin(@Body('email') email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Email inválido.');
    }
    return this.authService.demoLogin(email.toLowerCase().trim());
  }

  // GET /auth/me
  // Valida o token JWT e retorna o status do usuario
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return req.user;
  }
}
