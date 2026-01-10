import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export class RateLimiter {
  static create(options: RateLimitOptions) {
    const {
      windowMs,
      maxRequests,
      message = 'Too many requests, please try again later',
      skipSuccessfulRequests = false,
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = (req as any).user?.userId || req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${identifier}:${req.originalUrl}`;

      const now = Date.now();
      let record = rateLimitStore.get(key);

      if (!record || now > record.resetTime) {
        record = {
          count: 0,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, record);
      }

      record.count++;

      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

      if (record.count > maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());

        return res.status(429).json({
          success: false,
          message,
          retryAfter,
        });
      }

      if (skipSuccessfulRequests) {
        res.on('finish', () => {
          if (res.statusCode < 400 && record) {
            record.count--;
          }
        });
      }

      next();
    };
  }

  static cleanupExpired() {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

export const authLimiter = RateLimiter.create({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many login attempts, please try again in 15 minutes',
});

export const apiLimiter = RateLimiter.create({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Too many API requests, please try again later',
});

export const uploadLimiter = RateLimiter.create({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  message: 'File upload limit exceeded, please try again in an hour',
});

setInterval(() => {
  RateLimiter.cleanupExpired();
}, 10 * 60 * 1000);