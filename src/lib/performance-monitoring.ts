// Performance monitoring utility for API calls
import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: Date;
  userId?: string;
  statusCode: number;
  memory?: number;
}

const performanceLog: PerformanceMetrics[] = [];

export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  endpointName: string
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    let response: NextResponse;
    let statusCode = 200;
    
    try {
      response = await handler(...args);
      statusCode = response.status;
    } catch (error) {
      statusCode = 500;
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;
    const duration = endTime - startTime;
    const memoryUsed = endMemory - startMemory;
    
    // Log performance metrics
    const metrics: PerformanceMetrics = {
      endpoint: endpointName,
      method: args[0] instanceof Request ? (args[0] as Request).method : 'Unknown',
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      timestamp: new Date(),
      statusCode,
      memory: memoryUsed,
    };
    
    // Store in memory (in production, you'd want to use a proper logging service)
    performanceLog.push(metrics);
    
    // Keep only last 100 entries to prevent memory leaks
    if (performanceLog.length > 100) {
      performanceLog.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const color = duration > 1000 ? '\x1b[31m' : duration > 500 ? '\x1b[33m' : '\x1b[32m';
      console.log(
        `${color}⚡ ${endpointName}: ${duration.toFixed(2)}ms (${memoryUsed > 0 ? '+' : ''}${(memoryUsed / 1024 / 1024).toFixed(2)}MB) [${statusCode}]\x1b[0m`
      );
    }
    
    // Add performance headers
    response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    response.headers.set('X-Memory-Usage', `${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
    
    return response;
  };
}

// Get performance metrics (for admin dashboard)
export function getPerformanceMetrics(): PerformanceMetrics[] {
  return [...performanceLog];
}

// Get slow endpoints (duration > 1000ms)
export function getSlowEndpoints(): PerformanceMetrics[] {
  return performanceLog.filter(metric => metric.duration > 1000);
}

// Get average response time for an endpoint
export function getAverageResponseTime(endpoint: string): number {
  const endpointMetrics = performanceLog.filter(metric => metric.endpoint === endpoint);
  if (endpointMetrics.length === 0) return 0;
  
  const totalTime = endpointMetrics.reduce((sum, metric) => sum + metric.duration, 0);
  return Math.round((totalTime / endpointMetrics.length) * 100) / 100;
}

// Clear performance logs
export function clearPerformanceLogs(): void {
  performanceLog.length = 0;
}

// Performance analysis
export function getPerformanceAnalysis() {
  const totalRequests = performanceLog.length;
  const slowRequests = performanceLog.filter(m => m.duration > 1000).length;
  const averageResponseTime = totalRequests > 0 
    ? performanceLog.reduce((sum, m) => sum + m.duration, 0) / totalRequests 
    : 0;
  
  const endpointStats = performanceLog.reduce((acc, metric) => {
    if (!acc[metric.endpoint]) {
      acc[metric.endpoint] = {
        count: 0,
        totalTime: 0,
        maxTime: 0,
        minTime: Infinity,
        errors: 0,
      };
    }
    
    const stats = acc[metric.endpoint];
    stats.count++;
    stats.totalTime += metric.duration;
    stats.maxTime = Math.max(stats.maxTime, metric.duration);
    stats.minTime = Math.min(stats.minTime, metric.duration);
    
    if (metric.statusCode >= 400) {
      stats.errors++;
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  return {
    totalRequests,
    slowRequests,
    slowRequestPercentage: totalRequests > 0 ? (slowRequests / totalRequests) * 100 : 0,
    averageResponseTime: Math.round(averageResponseTime * 100) / 100,
    endpointStats: Object.entries(endpointStats).map(([endpoint, stats]) => ({
      endpoint,
      ...stats,
      averageTime: Math.round((stats.totalTime / stats.count) * 100) / 100,
      errorRate: (stats.errors / stats.count) * 100,
    })),
  };
}