import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  async sendMagicLink(email: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL') || 'https://secaapp.com';
    const link = `${appUrl}/auth/verify?token=${token}`;
    const brevoApiKey = this.config.get<string>('BREVO_API_KEY');

    if (!brevoApiKey) {
      this.logger.error('BREVO_API_KEY não configurada no .env!');
      return;
    }

    const payload = {
      sender: {
        name: 'SECA APP',
        email: 'suporte@secaapp.com', // E-mail profissional configurado na Brevo
      },
      to: [
        { email: email },
      ],
      subject: '🔥 Seu acesso ao SECA APP',
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
          <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 8px;">SECA<span style="color: #21c55d;">APP</span></h1>
          <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">Obrigado por confiar no nosso protocolo! Clique no botão abaixo para acessar sua conta gratuitamente e começar a sua jornada.</p>
          <a href="${link}" style="display: inline-block; background: #21c55d; color: white; font-weight: 800; font-size: 16px; padding: 16px 32px; border-radius: 12px; text-decoration: none;">
            ✅ Acessar Minha Conta
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">Se você não solicitou este acesso, ignore este email.</p>
        </div>
      `,
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Falha no envio via Brevo: ${response.status} - ${errorData}`);
      } else {
        this.logger.log(`E-mail Magico enviado para ${email} usando a API HTTP Brevo!`);
      }
    } catch (error) {
      this.logger.error('Exceção ao enviar via Brevo HTTP API:', error);
    }
  }
}
