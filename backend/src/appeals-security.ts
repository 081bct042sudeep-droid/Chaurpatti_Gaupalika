import { CanActivate, ExecutionContext, HttpException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import type { Request } from 'express';

@Injectable()
export class AppealsSecurityService {
  private readonly secret = process.env.VISITOR_TOKEN_SECRET || 'local-development-only-change-this-secret';

  constructor() {
    if (process.env.NODE_ENV === 'production' && (!process.env.VISITOR_TOKEN_SECRET || process.env.VISITOR_TOKEN_SECRET.length < 32)) {
      throw new ServiceUnavailableException('VISITOR_TOKEN_SECRET must be configured with at least 32 characters in production.');
    }
  }

  issueVisitorToken() {
    const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const nonce = randomBytes(24).toString('hex');
    const payload = `${expires}.${nonce}`;
    return `${payload}.${this.sign(payload)}`;
  }

  visitorHash(token?: string) {
    if (!token) throw new UnauthorizedException('A valid visitor session is required');
    const [expiresText, nonce, signature, extra] = token.split('.');
    const payload = `${expiresText}.${nonce}`;
    if (!expiresText || !nonce || !signature || extra || !/^\d+$/.test(expiresText) || !/^[a-f0-9]{48}$/.test(nonce)) throw new UnauthorizedException('Invalid visitor session');
    const expected = this.sign(payload);
    const supplied = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (supplied.length !== expectedBuffer.length || !timingSafeEqual(supplied, expectedBuffer) || Number(expiresText) < Math.floor(Date.now() / 1000)) throw new UnauthorizedException('Visitor session expired');
    return createHash('sha256').update(nonce).digest('hex');
  }

  private sign(value: string) { return createHmac('sha256', this.secret).update(value).digest('hex'); }
}

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const configured = process.env.ADMIN_API_KEY;
    if (!configured || configured.length < 24) throw new ServiceUnavailableException('Admin actions are disabled until ADMIN_API_KEY is configured with at least 24 characters.');
    const request = context.switchToHttp().getRequest<Request>();
    const supplied = (request.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    const a = Buffer.from(configured); const b = Buffer.from(supplied);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Admin access required');
    return true;
  }
}

@Injectable()
export class AppealsRateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const bucket = `${request.ip}:${request.method}:${request.route?.path ?? request.path}`;
    const now = Date.now();
    const current = this.hits.get(bucket);
    if (!current || current.resetAt <= now) this.hits.set(bucket, { count: 1, resetAt: now + 60_000 });
    else if (++current.count > (request.path.endsWith('/visitor-token') ? 30 : request.method === 'GET' ? 180 : 30)) throw new HttpException('Too many requests. Please try again shortly.', 429);
    if (this.hits.size > 10_000) for (const [key, value] of this.hits) if (value.resetAt <= now) this.hits.delete(key);
    return true;
  }
}
