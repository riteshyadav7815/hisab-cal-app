import { NextRequest, NextResponse } from 'next/server';

export function withPerformanceLogging<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  apiName: string
): T {
  return (async (...args: Parameters<T>) => {
    const start = Date.now();
    const req = args[0] as NextRequest;
    
    try {
      const response = await handler(...args);
      const duration = Date.now() - start;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        if (duration > 1000) {
          console.warn(`⚠️  Slow API: ${apiName} took ${duration}ms`);
        } else {
          console.log(`✅ API: ${apiName} completed in ${duration}ms`);
        }
      }
      
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${apiName} failed after ${duration}ms:`, error);
      }
      throw error;
    }
  }) as T;
}

export function logSlowQueries() {
  const originalQuery = console.log;
  
  return {
    enable: () => {
      // This would integrate with Prisma logging if needed
    },
    disable: () => {
      // Restore original logging
    }
  };
}