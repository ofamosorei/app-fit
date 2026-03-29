import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';

interface KiwifyPayload {
  event: string;
  status?: string;
  order_status?: string;
  id?: string;
  order_id?: string;
  token?: string;
  customer?: {
    email?: string;
    name?: string;
    full_name?: string;
  };
  Customer?: {
    email?: string;
    name?: string;
    full_name?: string;
  };
  data?: {
    id?: string;
    order_id?: string;
    customer?: {
      email?: string;
      name?: string;
      full_name?: string;
    };
  };
}

interface KiwifyRequestAuth {
  queryToken?: string;
  bodyToken?: string;
  headerToken?: string | string[];
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async handleKiwify(
    payload: KiwifyPayload,
    auth: KiwifyRequestAuth,
  ): Promise<{ received: boolean }> {
    this.validateWebhookToken(auth);

    // Log completo para debug em produção
    this.logger.log(`[Kiwify] Payload recebido: ${JSON.stringify(payload)}`);

    // A Kiwify envia o status no campo 'order_status' e o evento às vezes não existe
    const status = payload?.order_status || payload?.status || payload?.event;
    
    // 1. Ignorar se não for aprovado
    if (status !== 'approved' && status !== 'order_approved' && status !== 'paid') {
      this.logger.log(`[Kiwify] Status ignorado: ${status}`);
      return { received: true };
    }

    // A Kiwify envia Customer com C maiúsculo ou minúsculo
    const customer = payload?.Customer || payload?.customer || payload?.data?.customer || {};
    const orderId = payload?.order_id || payload?.id || payload?.data?.id;
    const email = customer?.email?.toLowerCase().trim();
    const name = customer?.full_name || customer?.name || '';

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
      const delivery = await this.authService.sendMagicLink(user.email);
      this.logger.log(
        `[Kiwify] Email de acesso enviado com sucesso para ${user.email} | provider=${delivery.provider} | messageId=${delivery.messageId}`,
      );
    } catch (error) {
      this.logger.error(`[Kiwify] Erro ao enviar email para ${user.email}`, error);
    }

    return { received: true };
  }

  private validateWebhookToken(auth: KiwifyRequestAuth): void {
    const expectedToken = this.configService.get<string>('KIWIFY_WEBHOOK_TOKEN')?.trim();

    if (!expectedToken) {
      throw new InternalServerErrorException(
        'KIWIFY_WEBHOOK_TOKEN não configurado no servidor.',
      );
    }

    const candidates = [
      auth.headerToken,
      auth.queryToken,
      auth.bodyToken,
    ]
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map((value) => value?.toString().trim())
      .filter((value): value is string => Boolean(value));

    const isValid = candidates.some((value) => value === expectedToken);

    if (!isValid) {
      this.logger.warn('[Kiwify] Webhook rejeitado por token inválido ou ausente.');
      throw new UnauthorizedException('Webhook não autorizado.');
    }
  }
}
