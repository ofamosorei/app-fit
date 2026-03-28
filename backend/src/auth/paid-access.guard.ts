import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class PaidAccessGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // User foi injetado pelo JwtAuthGuard

    if (!user) {
      throw new UnauthorizedException(
        'Usuário não autenticado. O JwtAuthGuard deve rodar antes deste Guard.',
      );
    }

    // Chama a lógica centralizada no UserService
    const hasAccess = this.userService.isAccessActive(user);
    if (!hasAccess) {
      throw new ForbiddenException(
        'Acesso negado: O usuário ainda não possui um pagamento confirmado',
      );
    }

    return true; // Acesso liberado
  }
}
