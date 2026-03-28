import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  // POST /webhook/kiwify
  // Chamado automaticamente pela Kiwify a cada evento de pagamento
  @Post('kiwify')
  @HttpCode(200) // Garante resposta 200 sempre (Kiwify espera 200 rapidamente)
  async kiwify(@Body() payload: any) {
    return this.webhookService.handleKiwify(payload);
  }
}
