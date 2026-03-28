import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';

interface KiwifyPayload {
  event: string;
  data?: {
    id?: string;
    order_id?: string;
    customer?: {
      email?: string;
      name?: string;
    };
  };
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async handleKiwify(payload: KiwifyPayload): Promise<{ received: boolean }> {
    const event = payload?.event;

    // 1. Ignorar eventos que não sejam order_approved
    if (event !== 'order_approved') {
      this.logger.log(`[Kiwify] Evento ignorado: ${event}`);
      return { received: true };
    }

    const orderId = payload?.data?.id || payload?.data?.order_id;
    const email = payload?.data?.customer?.email?.toLowerCase().trim();
    const name = payload?.data?.customer?.name || '';

    // 2. Validar campos obrigatórios
    if (!orderId || !email) {
      this.logger.warn('[Kiwify] Payload incompleto — order_id ou email ausente', payload);
      return { received: true };
    }

    // 3. Deduplicação: checar se esse pedido já foi processado
    const existing = await this.userService.findByKiwifyOrderId(orderId);
    if (existing) {
      this.logger.log(`[Kiwify] Pedido já processado: orderId=${orderId} | email=${email}`);
      return { received: true };
    }

    // 4. Criar ou atualizar usuário com acesso liberado
    const user = await this.userService.createOrUpdateFromKiwify({ email, name, kiwifyOrderId: orderId });
    this.logger.log(`[Kiwify] Acesso liberado ✅ | email=${user.email} | orderId=${orderId}`);

    // 5. Disparar email de boas-vindas com Magic Link
    try {
      await this.authService.sendMagicLink(user.email);
      this.logger.log(`[Kiwify] Email de acesso enviado com sucesso para ${user.email}`);
    } catch (error) {
      this.logger.error(`[Kiwify] Erro ao enviar email para ${user.email}`, error);
    }

    return { received: true };
  }
}
