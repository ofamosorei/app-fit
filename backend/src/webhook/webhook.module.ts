import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule], // fornece UserService
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
