import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AiModule } from './ai/ai.module';
import { PlanModule } from './plan/plan.module';
import { ScannerModule } from './scanner/scanner.module';
import { AuthModule } from './auth/auth.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // criar tabelas automaticamente (apenas dev/staging)
        ssl: { rejectUnauthorized: false }, // necessário para Supabase
        logging: false,
      }),
    }),
    UserModule,
    AuthModule,
    WebhookModule,
    AiModule,
    PlanModule,
    ScannerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

