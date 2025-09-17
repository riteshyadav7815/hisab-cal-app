"use client";
import { useEffect, useRef, useCallback, useMemo } from "react";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Throttle function to limit animation frame rate
const throttle = (func: (...args: any[]) => void, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Check if device is low performance (mobile or older devices)
const isLowPerformanceDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check for older devices or limited memory
  const memory = (navigator as any).deviceMemory || 0;
  const cores = navigator.hardwareConcurrency || 0;
  
  return isMobile || memory < 4 || cores < 4;
};

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const frameRateRef = useRef<number>(30); // Target 30 FPS

  // Optimized particle count based on device
  const getParticleCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Reduce particles on mobile and low-performance devices
      const isLowPerf = isLowPerformanceDevice();
      if (window.innerWidth < 768 || isLowPerf) return 30; // Even fewer particles on mobile/low perf
      return 80; // Reduced from 100 for better performance
    }
    return 80;
  }, []);

  // Optimized wave point spacing based on device
  const getWaveSpacing = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isLowPerf = isLowPerformanceDevice();
      if (window.innerWidth < 768 || isLowPerf) return 12; // Wider spacing on mobile/low perf
      return 6; // Wider spacing for better performance
    }
    return 6;
  }, []);

  const animate = useCallback((timestamp: number) => {
    if (!isBrowser) return;
    
    // Frame rate limiting
    const elapsed = timestamp - lastFrameTimeRef.current;
    const frameInterval = 1000 / frameRateRef.current;
    
    if (elapsed < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.01;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#1A1735';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, 'rgba(123, 47, 247, 0.1)');
    gradient.addColorStop(0.5, 'rgba(0, 245, 212, 0.05)');
    gradient.addColorStop(1, 'rgba(26, 23, 53, 0.8)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw floating particles (optimized count)
    const particleCount = getParticleCount();
    ctx.fillStyle = 'rgba(0, 245, 212, 0.5)'; // Reduced opacity for better performance
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(timeRef.current + i * 0.1) * 0.5 + 0.5) * canvas.width;
      const y = (Math.cos(timeRef.current * 0.7 + i * 0.1) * 0.5 + 0.5) * canvas.height;
      const size = Math.sin(timeRef.current * 2 + i) * 1.5 + 2; // Smaller particles
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw wave effect (optimized spacing)
    const waveSpacing = getWaveSpacing();
    ctx.strokeStyle = 'rgba(123, 47, 247, 0.2)'; // Reduced opacity
    ctx.lineWidth = 1.5; // Thinner line
    ctx.beginPath();
    
    for (let x = 0; x < canvas.width; x += waveSpacing) {
      const y = canvas.height / 2 + Math.sin(x * 0.01 + timeRef.current) * 30; // Reduced amplitude
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    animationRef.current = requestAnimationFrame(animate);
  }, [getParticleCount, getWaveSpacing]);

  const handleResize = useCallback(() => {
    if (!isBrowser) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Start animation with throttling for better performance
    const throttledAnimate = throttle(animate, 16); // ~60fps max
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, handleResize]);

  return (
    <div className="absolute inset-0 -z-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: '#1A1735' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
    </div>
  );
}