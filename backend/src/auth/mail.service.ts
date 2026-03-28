import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
      secure: false, // STARTTLS
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false
      }
    } as any);
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL');
    const link = `${appUrl}/auth/verify?token=${token}`;

    await this.transporter.sendMail({
      from: `"SECA APP" <${this.config.get('SMTP_USER')}>`,
      to: email,
      subject: '🔥 Seu acesso ao SECA APP',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
          <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 8px;">SECA<span style="color: #21c55d;">APP</span></h1>
          <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">Clique no botão abaixo para acessar sua conta. O link expira em <strong>15 minutos</strong>.</p>
          <a href="${link}" style="display: inline-block; background: #21c55d; color: white; font-weight: 800; font-size: 16px; padding: 16px 32px; border-radius: 12px; text-decoration: none;">
            ✅ Acessar Minha Conta
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">Se você não solicitou este acesso, ignore este email.</p>
        </div>
      `,
    });
  }
}
