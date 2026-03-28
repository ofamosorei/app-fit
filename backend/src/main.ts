import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dns from 'dns';

// Fix para DigitalOcean tentar IPv6 pro Gmail e falhar com ENETUNREACH
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Allow large image uploads (base64 can be 5-15MB for camera photos)
  app.use(require('express').json({ limit: '20mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '20mb' }));

  // Allow frontend origin
  app.enableCors({ origin: '*' });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();

