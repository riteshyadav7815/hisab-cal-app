import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; expiry: number }>();

export function withRateLimit(
  req: NextRequest,
  options: {
    windowMs: number;
    maxRequests: number;
  }
): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const requestData = rateLimitMap.get(ip);

  if (requestData && requestData.expiry > now) {
    if (requestData.count + 1 > options.maxRequests) {
      return new NextResponse('Too many requests', { status: 429 });
    }
    rateLimitMap.set(ip, { ...requestData, count: requestData.count + 1 });
  } else {
    rateLimitMap.set(ip, { count: 1, expiry: now + options.windowMs });
  }

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.expiry < windowStart) {
      rateLimitMap.delete(key);
    }
  }

  return null;
}
