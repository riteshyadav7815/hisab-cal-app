import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
}

export function usePerformanceMonitor(onMetricsUpdate?: (metrics: PerformanceMetrics) => void) {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const frameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measurePerformance = (timestamp: number) => {
      frameCountRef.current++;
      
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - lastTimeRef.current;
      
      if (elapsed >= 1000) { // Update every second
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        const frameTime = frameTimeRef.current / frameCountRef.current;
        
        const metrics: PerformanceMetrics = {
          fps,
          frameTime,
        };
        
        // Add memory usage if available
        if ('memory' in performance) {
          // @ts-ignore
          metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
        }
        
        onMetricsUpdate?.(metrics);
        
        frameCountRef.current = 0;
        lastTimeRef.current = timestamp;
        frameTimeRef.current = 0;
      }
      
      frameTimeRef.current += timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      animationFrameRef.current = requestAnimationFrame(measurePerformance);
    };
    
    animationFrameRef.current = requestAnimationFrame(measurePerformance);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onMetricsUpdate]);
}