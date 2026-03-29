import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from './rate-limit.decorator';

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const key = this.buildKey(request);
    const now = Date.now();
    const currentEntry = this.store.get(key);

    if (!currentEntry || currentEntry.expiresAt <= now) {
      this.store.set(key, {
        count: 1,
        expiresAt: now + options.windowMs,
      });
      return true;
    }

    if (currentEntry.count >= options.limit) {
      throw new HttpException(
        'Muitas tentativas. Aguarde um pouco antes de tentar novamente.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    currentEntry.count += 1;
    this.store.set(key, currentEntry);
    return true;
  }

  private buildKey(request: any): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : request.ip || request.socket?.remoteAddress || 'unknown';

    return `${request.method}:${request.route?.path || request.path}:${ip}`;
  }
}
