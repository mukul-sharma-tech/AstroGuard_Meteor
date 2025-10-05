import React, { useRef, useEffect } from 'react';

interface ThreeSceneProps {
  originalTrajectory: number[][];
  deflectedTrajectory: number[][];
  impactLocation?: { lat: number; lng: number };
  isSimulating: boolean;
  quality?: 'low' | 'med' | 'high';
  time?: number; // 0..1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  originalTrajectory,
  deflectedTrajectory,
  impactLocation,
  isSimulating,
  quality = 'med',
  time = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2 / window.devicePixelRatio;
      const centerY = canvas.height / 2 / window.devicePixelRatio;
      const radius = Math.min(centerX, centerY) * 0.8;

      // Draw Earth
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e40af';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw continents (simplified)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.3, centerY - radius * 0.2, radius * 0.4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + radius * 0.2, centerY + radius * 0.3, radius * 0.3, 0, 2 * Math.PI);
      ctx.fill();

      // Select point stride by quality
      const stride = quality === 'low' ? 4 : quality === 'high' ? 1 : 2;

      // Draw trajectories if available
      if (originalTrajectory.length > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < originalTrajectory.length; i += stride) {
          const point = originalTrajectory[i];
          const x = centerX + (point[0] / 1e11) * radius * 0.5;
          const y = centerY + (point[1] / 1e11) * radius * 0.5;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Draw asteroid moving along path
        const idx = Math.max(0, Math.min(originalTrajectory.length - 1, Math.floor(time * (originalTrajectory.length - 1))));
        const lastPoint = originalTrajectory[idx];
        const asteroidX = centerX + (lastPoint[0] / 1e11) * radius * 0.5;
        const asteroidY = centerY + (lastPoint[1] / 1e11) * radius * 0.5;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(asteroidX, asteroidY, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      if (deflectedTrajectory.length > 0) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let i = 0; i < deflectedTrajectory.length; i += stride) {
          const point = deflectedTrajectory[i];
          const x = centerX + (point[0] / 1e11) * radius * 0.5;
          const y = centerY + (point[1] / 1e11) * radius * 0.5;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw impact location if available
      if (impactLocation) {
        const lat = impactLocation.lat;
        const lng = impactLocation.lng;
        const x = centerX + (lng / 180) * radius * 0.9;
        const y = centerY - (lat / 90) * radius * 0.9;
        
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [originalTrajectory, deflectedTrajectory, impactLocation, quality, time]);

  const hasData = originalTrajectory.length > 0 || deflectedTrajectory.length > 0;

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'radial-gradient(circle, #1e1b4b 0%, #000000 100%)' }}
      />
      
      {/* Overlay info */}
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">3D Visualization</h3>
        {isSimulating && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Calculating...</span>
          </div>
        )}
        {hasData && !isSimulating && (
          <div className="text-sm space-y-1">
            <p className="text-red-400">● Original trajectory ({originalTrajectory.length} points)</p>
            <p className="text-green-400">● Deflected trajectory ({deflectedTrajectory.length} points)</p>
            <p className="text-yellow-400">● Asteroid position</p>
            {impactLocation && <p className="text-orange-400">● Impact location</p>}
          </div>
        )}
      </div>

      {/* Legend */}
      {hasData && !isSimulating && (
        <div className="absolute bottom-4 right-4 text-white text-xs space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-red-500 mr-2"></div>
            <span>Original path</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-green-500 mr-2 border-dashed border-t-2"></div>
            <span>Deflected path</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span>Asteroid</span>
          </div>
          {impactLocation && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
              <span>Impact zone</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
