import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { UserService } from '../user/user.service';
import { MailService } from './mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MagicLinkToken } from './magic-link-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(MagicLinkToken)
    private readonly magicLinkTokenRepo: Repository<MagicLinkToken>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async sendMagicLink(
    email: string,
  ): Promise<{ message: string; provider: 'brevo'; messageId: string }> {
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

    await this.magicLinkTokenRepo.delete({ email });

    await this.magicLinkTokenRepo.save(
      this.magicLinkTokenRepo.create({
        email,
        tokenHash: this.hashToken(token),
        expiresAt,
        usedAt: null,
      }),
    );

    // Envia email com o link
    const delivery = await this.mailService.sendMagicLink(email, token);

    return {
      message: 'Link de acesso enviado para o seu email.',
      ...delivery,
    };
  }

  async verifyMagicLink(token: string): Promise<{ accessToken: string; requiresPasswordSetup: boolean }> {
    const entry = await this.magicLinkTokenRepo.findOne({
      where: {
        tokenHash: this.hashToken(token),
      },
    });

    if (!entry) {
      throw new UnauthorizedException('Token inválido ou já utilizado.');
    }

    if (entry.usedAt) {
      throw new UnauthorizedException('Token inválido ou já utilizado.');
    }

    if (new Date() > entry.expiresAt) {
      await this.magicLinkTokenRepo.delete({ id: entry.id });
      throw new UnauthorizedException('Token expirado. Solicite um novo link.');
    }

    entry.usedAt = new Date();
    await this.magicLinkTokenRepo.save(entry);

    // Busca usuário no banco
    const user = await this.userService.findByEmail(entry.email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Gera JWT de 30 dias
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, requiresPasswordSetup: !user.hasPassword };
  }

  async loginWithPassword(email: string, password: string): Promise<{ accessToken: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userService.findByEmailWithPassword(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    if (!user.hasPaid) {
      throw new UnauthorizedException('Seu acesso ainda não está liberado.');
    }

    if (!user.hasPassword || !user.passwordHash) {
      throw new UnauthorizedException('Defina sua senha primeiro pelo link de acesso enviado no email.');
    }

    if (!this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async setPassword(userId: string, password: string, confirmPassword: string) {
    if (!password || password.length < 4) {
      throw new BadRequestException('Sua senha precisa ter pelo menos 4 caracteres.');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('A confirmação da senha não confere.');
    }

    const passwordHash = this.hashPassword(password);
    const user = await this.userService.updateProfile(userId, {
      passwordHash,
      hasPassword: true,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return { message: 'Senha definida com sucesso.', user };
  }

  async updateUserProfile(userId: string, data: any): Promise<any> {
    const user = await this.userService.updateProfile(userId, data);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return { message: 'Perfil atualizado com sucesso', user };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    const hashedBuffer = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');

    if (hashedBuffer.length !== keyBuffer.length) {
      return false;
    }

    return timingSafeEqual(hashedBuffer, keyBuffer);
  }
}
