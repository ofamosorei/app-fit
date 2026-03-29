import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dns from 'dns';

// Fix para DigitalOcean tentar IPv6 pro Gmail e falhar com ENETUNREACH
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appUrl = process.env.APP_URL || 'https://secaapp.com';
  const allowedOrigins = new Set([
    appUrl,
    appUrl.replace('://secaapp.com', '://www.secaapp.com'),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);
  
  // Allow large image uploads (base64 can be 5-15MB for camera photos)
  app.use(require('express').json({ limit: '20mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '20mb' }));

  // Allow only trusted frontend origins in production, while keeping local dev working.
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin nao permitida pelo CORS'));
    },
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
