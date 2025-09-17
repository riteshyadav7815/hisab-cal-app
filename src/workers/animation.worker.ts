// Web Worker for animation calculations
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'CALCULATE_PARTICLES':
      const { time, canvasWidth, canvasHeight } = data;
      const particles = [];
      
      for (let i = 0; i < 100; i++) {
        const x = (Math.sin(time + i * 0.1) * 0.5 + 0.5) * canvasWidth;
        const y = (Math.cos(time * 0.7 + i * 0.1) * 0.5 + 0.5) * canvasHeight;
        const size = Math.sin(time * 2 + i) * 2 + 3;
        particles.push({ x, y, size });
      }
      
      self.postMessage({ type: 'PARTICLES_CALCULATED', particles });
      break;
      
    case 'CALCULATE_WAVE':
      const { waveTime, waveCanvasWidth } = data;
      const wavePoints = [];
      
      for (let x = 0; x < waveCanvasWidth; x += 4) {
        const y = canvasHeight / 2 + Math.sin(x * 0.01 + waveTime) * 50;
        wavePoints.push({ x, y });
      }
      
      self.postMessage({ type: 'WAVE_CALCULATED', wavePoints });
      break;
      
    default:
      break;
  }
};

export {};