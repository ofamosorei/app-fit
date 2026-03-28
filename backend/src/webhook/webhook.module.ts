import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserModule, AuthModule], // fornece UserService e AuthService
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
