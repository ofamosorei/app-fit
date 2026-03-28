import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não fornecido no Header (Bearer TOKEN)');
    }

    try {
      // Verifica assinatura e expiração do JWT
      const payload = await this.jwtService.verifyAsync(token);
      
      // O subject (sub) é o user.id
      const user = await this.userService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Usuário associado ao token não encontrado');
      }

      // Injeta o User Entity completo na request
      request.user = user;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
