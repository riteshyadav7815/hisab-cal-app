"use client";
import { useEffect, useRef } from "react";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only run in browser environment
    if (!isBrowser) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simple animated background without Three.js for now
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
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
      
      // Draw floating particles
      ctx.fillStyle = 'rgba(0, 245, 212, 0.6)';
      for (let i = 0; i < 100; i++) {
        const x = (Math.sin(time + i * 0.1) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.7 + i * 0.1) * 0.5 + 0.5) * canvas.height;
        const size = Math.sin(time * 2 + i) * 2 + 3;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw wave effect
      ctx.strokeStyle = 'rgba(123, 47, 247, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let x = 0; x < canvas.width; x += 4) {
        const y = canvas.height / 2 + Math.sin(x * 0.01 + time) * 50;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Reduce animation intensity on mobile devices
  useEffect(() => {
    if (!isBrowser) return;
    
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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