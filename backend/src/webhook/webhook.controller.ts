import { Controller, Post, Body, HttpCode, Query, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  // POST /webhook/kiwify
  // Chamado automaticamente pela Kiwify a cada evento de pagamento
  @Post('kiwify')
  @HttpCode(200)
  async kiwify(
    @Body() payload: any,
    @Query('token') queryToken: string | undefined,
    @Req() req: any,
  ) {
    return this.webhookService.handleKiwify(payload, {
      queryToken,
      bodyToken: payload?.token,
      headerToken:
        req.headers['x-kiwify-token'] ||
        req.headers['x-webhook-token'] ||
        req.headers['x-api-token'],
    });
  }
}
