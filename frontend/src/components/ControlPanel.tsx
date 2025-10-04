import React, { useState, useEffect } from 'react';
import { Asteroid, SimulationParams } from '../types';
import { asteroidApi } from '../utils/api';
import { Play, Shield, Info } from 'lucide-react';

interface ControlPanelProps {
  onSimulate: (params: SimulationParams) => void;
  onMitigationChange: (deltaV: number) => void;
  isSimulating: boolean;
  selectedAsteroid: Asteroid | null;
  onAsteroidSelect: (asteroid: Asteroid) => void;
  quality: 'low' | 'med' | 'high';
  onQualityChange: (q: 'low' | 'med' | 'high') => void;
  time: number;
  onTimeChange: (t: number) => void;
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  useLeafletMap: boolean;
  onToggleLeaflet: (enabled: boolean) => void;
  useThreeGlobe: boolean;
  onToggleThreeGlobe: (enabled: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onSimulate,
  onMitigationChange,
  isSimulating,
  selectedAsteroid,
  onAsteroidSelect,
  quality,
  onQualityChange,
  time,
  onTimeChange,
  isPlaying,
  onTogglePlay,
  animationSpeed,
  onAnimationSpeedChange,
  useLeafletMap,
  onToggleLeaflet,
  useThreeGlobe,
  onToggleThreeGlobe
}) => {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [impactLat, setImpactLat] = useState(34.05);
  const [impactLon, setImpactLon] = useState(-118.24);
  const [mitigationDeltaV, setMitigationDeltaV] = useState(0);
  const [showInfo, setShowInfo] = useState<string | null>(null);

  useEffect(() => {
    const loadAsteroids = async () => {
      try {
        console.log('Loading asteroids...');
        const data = await asteroidApi.getAsteroids();
        console.log('Asteroids loaded:', data);
        setAsteroids(data);
        // Only select first asteroid if no asteroid is currently selected
        if (data.length > 0 && !selectedAsteroid) {
          onAsteroidSelect(data[0]);
        }
      } catch (error) {
        console.error('Failed to load asteroids:', error);
        // Set some fallback data to prevent white screen
        const fallbackAsteroids = [
          {
            id: 'test-asteroid',
            name: 'Test Asteroid',
            diameter: 0.1,
            velocity: 15,
            impact_probability: 0.001,
            palermo_scale: 0
          }
        ];
        setAsteroids(fallbackAsteroids);
        // Only select fallback asteroid if no asteroid is currently selected
        if (!selectedAsteroid) {
          onAsteroidSelect(fallbackAsteroids[0]);
        }
      }
    };

    loadAsteroids();
  }, []); // Remove onAsteroidSelect from dependencies to prevent re-runs

  const handleSimulate = () => {
    if (selectedAsteroid) {
      onSimulate({
        asteroidId: selectedAsteroid.id,
        impactLat,
        impactLon,
        mitigationDeltaV
      });
    }
  };

  const handleMitigationChange = (value: number) => {
    setMitigationDeltaV(value);
    onMitigationChange(value);
  };

  const infoItems = {
    'diameter': 'Asteroid diameter affects impact energy - larger asteroids create more devastating impacts.',
    'velocity': 'Impact velocity determines kinetic energy - faster impacts are exponentially more destructive.',
    'mitigation': 'Delta-V (velocity change) applied to deflect the asteroid. Even small changes can significantly alter the trajectory.',
    'impact-probability': 'The probability that this asteroid will impact Earth based on current orbital calculations.',
    'palermo-scale': 'A logarithmic scale comparing the impact hazard to the average background risk.'
  };

  return (
    <div className="bg-space-900 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 font-space flex items-center">
        <Shield className="mr-2" />
        Mission Control
      </h2>

      {/* Asteroid Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select Asteroid
          <button
            onClick={() => setShowInfo(showInfo === 'impact-probability' ? null : 'impact-probability')}
            className="ml-2 text-space-300 hover:text-space-200"
          >
            <Info size={16} />
          </button>
        </label>
        <select
          value={selectedAsteroid?.id || ''}
          onChange={(e) => {
            const asteroid = asteroids.find(a => a.id === e.target.value);
            if (asteroid) onAsteroidSelect(asteroid);
          }}
          className="w-full p-3 bg-space-800 border border-space-700 rounded-lg focus:ring-2 focus:ring-asteroid-500 focus:border-transparent"
        >
          {asteroids.map((asteroid) => (
            <option key={asteroid.id} value={asteroid.id}>
              {asteroid.name} - {asteroid.diameter.toFixed(1)}km - {asteroid.velocity.toFixed(1)}km/s
            </option>
          ))}
        </select>
        {showInfo === 'impact-probability' && (
          <div className="mt-2 p-3 bg-space-800 rounded text-sm">
            {infoItems['impact-probability']}
          </div>
        )}
      </div>

      {/* Impact Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Impact Location</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-space-300 mb-1">Latitude</label>
            <input
              type="number"
              value={impactLat}
              onChange={(e) => setImpactLat(parseFloat(e.target.value))}
              className="w-full p-2 bg-space-800 border border-space-700 rounded focus:ring-2 focus:ring-asteroid-500"
              step="0.01"
              min="-90"
              max="90"
            />
          </div>
          <div>
            <label className="block text-xs text-space-300 mb-1">Longitude</label>
            <input
              type="number"
              value={impactLon}
              onChange={(e) => setImpactLon(parseFloat(e.target.value))}
              className="w-full p-2 bg-space-800 border border-space-700 rounded focus:ring-2 focus:ring-asteroid-500"
              step="0.01"
              min="-180"
              max="180"
            />
          </div>
        </div>
      </div>

      {/* Mitigation Controls */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Deflection Force (ΔV)
          <button
            onClick={() => setShowInfo(showInfo === 'mitigation' ? null : 'mitigation')}
            className="ml-2 text-space-300 hover:text-space-200"
          >
            <Info size={16} />
          </button>
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="50"
            value={mitigationDeltaV}
            onChange={(e) => handleMitigationChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-space-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-space-300">
            <span>0 m/s</span>
            <span className="font-bold text-asteroid-400">{mitigationDeltaV.toFixed(1)} m/s</span>
            <span>50 m/s</span>
          </div>
        </div>
        {showInfo === 'mitigation' && (
          <div className="mt-2 p-3 bg-space-800 rounded text-sm">
            {infoItems['mitigation']}
          </div>
        )}
      </div>

      {/* Visualization Quality */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Quality</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low','med','high'] as const).map((q) => (
            <button
              key={q}
              onClick={() => onQualityChange(q)}
              className={`py-2 rounded text-sm ${quality===q ? 'bg-asteroid-600' : 'bg-space-800 border border-space-700'}`}
            >
              {q.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slider / Animation */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Time</label>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onTogglePlay(!isPlaying)}
            className={`px-3 py-2 rounded ${isPlaying ? 'bg-red-600' : 'bg-asteroid-600'}`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={time}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-space-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-space-300 w-10 text-right">{Math.round(time*100)}%</span>
        </div>
      </div>

      {/* Animation Speed */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Animation Speed</label>
        <div className="space-y-2">
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => onAnimationSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-space-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-space-300">
            <span>0.5x</span>
            <span className="font-bold text-asteroid-400">{animationSpeed.toFixed(1)}x</span>
            <span>3.0x</span>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Visual Change Setting</label>
        <div className="space-y-2 text-sm">
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={useLeafletMap} onChange={(e)=>onToggleLeaflet(e.target.checked)} />
            <span>Use Leaflet map</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={useThreeGlobe} onChange={(e)=>onToggleThreeGlobe(e.target.checked)} />
            <span>Enable globe </span>
          </label>
        </div>
      </div>

      {/* Simulation Button */}
      <button
        onClick={handleSimulate}
        disabled={isSimulating || !selectedAsteroid}
        className="w-full bg-gradient-to-r from-asteroid-500 to-asteroid-600 hover:from-asteroid-600 hover:to-asteroid-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
      >
        {isSimulating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Simulating...
          </>
        ) : (
          <>
            <Play className="mr-2" />
            Simulate Impact
          </>
        )}
      </button>

      {/* Asteroid Info */}
      {selectedAsteroid && (
        <div className="mt-6 p-4 bg-space-800 rounded-lg">
          <h3 className="font-bold text-asteroid-400 mb-2">Asteroid Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Diameter:</span>
              <span className="font-mono">{selectedAsteroid.diameter.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between">
              <span>Velocity:</span>
              <span className="font-mono">{selectedAsteroid.velocity.toFixed(2)} km/s</span>
            </div>
            <div className="flex justify-between">
              <span>Impact Probability:</span>
              <span className="font-mono">{(selectedAsteroid.impact_probability * 100).toFixed(6)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Palermo Scale:</span>
              <span className="font-mono">{selectedAsteroid.palermo_scale.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
