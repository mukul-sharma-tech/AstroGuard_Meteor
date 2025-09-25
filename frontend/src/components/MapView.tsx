import React, { useRef, useEffect } from 'react';
import { SimulationResult } from '../types';
import { LeafletMapView } from './LeafletMapView';

interface MapViewProps {
  simulationResult: SimulationResult | null;
  impactLocation: { lat: number; lng: number };
  isSimulating: boolean;
  useLeaflet?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  simulationResult,
  impactLocation,
  isSimulating,
  useLeaflet = false
}) => {
  // Use Leaflet map if flag is enabled
  if (useLeaflet) {
    return (
      <LeafletMapView
        simulationResult={simulationResult}
        impactLocation={impactLocation}
        isSimulating={isSimulating}
      />
    );
  }
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Draw world map background (simplified)
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(0, 0, width, height);

      // Draw continents (very simplified world map)
      ctx.fillStyle = '#22c55e';
      
      // North America
      ctx.fillRect(width * 0.1, height * 0.2, width * 0.25, height * 0.4);
      
      // Europe/Africa
      ctx.fillRect(width * 0.35, height * 0.15, width * 0.15, height * 0.6);
      
      // Asia
      ctx.fillRect(width * 0.5, height * 0.1, width * 0.3, height * 0.5);
      
      // Australia
      ctx.fillRect(width * 0.6, height * 0.7, width * 0.15, height * 0.15);

      // Draw impact location
      const x = (impactLocation.lng + 180) / 360 * width;
      const y = (90 - impactLocation.lat) / 180 * height;
      
      // Impact zone circle
      if (simulationResult) {
        const craterRadius = Math.max(5, (simulationResult.crater_diameter_km / 100) * Math.min(width, height) * 0.1);
        
        // Outer blast radius
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, craterRadius * 3, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Fireball radius
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, y, craterRadius * 2, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Crater
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(x, y, craterRadius, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Just show impact point
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Impact location marker
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.stroke();

      // Crosshairs
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 15, y);
      ctx.lineTo(x + 15, y);
      ctx.moveTo(x, y - 15);
      ctx.lineTo(x, y + 15);
      ctx.stroke();
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [impactLocation, simulationResult]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-green-900 to-blue-900 relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Overlay info */}
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Impact Zone Analysis</h3>
        {isSimulating && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Analyzing...</span>
          </div>
        )}
        {simulationResult && (
          <div className="text-sm space-y-1">
            <p className="text-orange-400">● Fireball radius: {simulationResult.fireball_radius_km.toFixed(1)} km</p>
            <p className="text-yellow-400">● Blast radius: {(simulationResult.crater_diameter_km * 3).toFixed(1)} km</p>
            <p className="text-red-400">● Crater: {simulationResult.crater_diameter_km.toFixed(1)} km</p>
            <p className="text-blue-400">● Location: {impactLocation.lat.toFixed(2)}°, {impactLocation.lng.toFixed(2)}°</p>
          </div>
        )}
      </div>

      {/* Legend */}
      {simulationResult && !isSimulating && (
        <div className="absolute bottom-4 right-4 text-white text-xs space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
            <span>Crater zone</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-orange-500 mr-2"></div>
            <span>Fireball radius</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-yellow-500 mr-2 border-dashed border-t-2"></div>
            <span>Blast radius</span>
          </div>
        </div>
      )}
    </div>
  );
};
