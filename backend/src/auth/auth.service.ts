import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { UserService } from '../user/user.service';
import { MailService } from './mail.service';

// Token store em memória: token → { email, expiresAt }
// Nota: em produção com múltiplas instâncias, use Redis para compartilhar.
const magicLinkTokens = new Map<string, { email: string; expiresAt: Date }>();

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async sendMagicLink(email: string): Promise<{ message: string }> {
    // Verifica se o usuário existe no banco
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'Email não encontrado. Verifique se o email utilizado na compra está correto.',
      );
    }

    // Gera token aleatório seguro (diferente do JWT)
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salva no store em memória
    magicLinkTokens.set(token, { email, expiresAt });

    // Envia email com o link
    await this.mailService.sendMagicLink(email, token);

    return { message: 'Link de acesso enviado para o seu email.' };
  }

  async verifyMagicLink(token: string): Promise<{ accessToken: string }> {
    const entry = magicLinkTokens.get(token);

    if (!entry) {
      throw new UnauthorizedException('Token inválido ou já utilizado.');
    }

    if (new Date() > entry.expiresAt) {
      magicLinkTokens.delete(token);
      throw new UnauthorizedException('Token expirado. Solicite um novo link.');
    }

    // Token válido — remove do store (uso único)
    magicLinkTokens.delete(token);

    // Busca usuário no banco
    const user = await this.userService.findByEmail(entry.email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Gera JWT de 30 dias
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  // BYPASS TEMPORÁRIO PARA GRAVAÇÃO DE VÍDEOS
  async demoLogin(email: string): Promise<{ accessToken: string }> {
    const user = await this.userService.createOrUpdateFromKiwify({
      email,
      name: email.split('@')[0],
      kiwifyOrderId: `demo-${Date.now()}`,
    });

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
