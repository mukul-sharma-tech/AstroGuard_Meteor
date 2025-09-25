import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SimulationResult } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapViewProps {
  simulationResult: SimulationResult | null;
  impactLocation: { lat: number; lng: number };
  isSimulating: boolean;
}

// Component to update map center when impact location changes
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  
  return null;
};

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  simulationResult,
  impactLocation,
  isSimulating
}) => {
  const mapRef = useRef<L.Map>(null);

  // Calculate circle radii based on simulation results
  const getCircleRadius = (baseRadiusKm: number) => {
    // Convert km to meters for Leaflet
    return baseRadiusKm * 1000;
  };

  const getCircleColor = (type: 'crater' | 'fireball' | 'blast') => {
    switch (type) {
      case 'crater': return '#dc2626';
      case 'fireball': return '#f97316';
      case 'blast': return '#fbbf24';
      default: return '#6b7280';
    }
  };

  const getCircleOpacity = (type: 'crater' | 'fireball' | 'blast') => {
    switch (type) {
      case 'crater': return 0.8;
      case 'fireball': return 0.6;
      case 'blast': return 0.4;
      default: return 0.5;
    }
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={[impactLocation.lat, impactLocation.lng]}
        zoom={8}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={[impactLocation.lat, impactLocation.lng]} />
        
        {/* Impact location marker */}
        <Marker position={[impactLocation.lat, impactLocation.lng]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-red-600">Impact Location</h3>
              <p>Lat: {impactLocation.lat.toFixed(4)}°</p>
              <p>Lng: {impactLocation.lng.toFixed(4)}°</p>
            </div>
          </Popup>
        </Marker>

        {/* Impact zones if simulation results available */}
        {simulationResult && (
          <>
            {/* Crater zone */}
            <Circle
              center={[impactLocation.lat, impactLocation.lng]}
              radius={getCircleRadius(simulationResult.crater_diameter_km / 2)}
              pathOptions={{
                color: getCircleColor('crater'),
                fillColor: getCircleColor('crater'),
                fillOpacity: getCircleOpacity('crater'),
                weight: 2
              }}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-red-600">Crater Zone</h3>
                  <p>Diameter: {simulationResult.crater_diameter_km.toFixed(1)} km</p>
                  <p className="text-sm text-gray-600">Instant destruction</p>
                </div>
              </Popup>
            </Circle>

            {/* Fireball radius */}
            <Circle
              center={[impactLocation.lat, impactLocation.lng]}
              radius={getCircleRadius(simulationResult.fireball_radius_km)}
              pathOptions={{
                color: getCircleColor('fireball'),
                fillColor: getCircleColor('fireball'),
                fillOpacity: getCircleOpacity('fireball'),
                weight: 2,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-orange-600">Fireball Radius</h3>
                  <p>Radius: {simulationResult.fireball_radius_km.toFixed(1)} km</p>
                  <p className="text-sm text-gray-600">Instant vaporization</p>
                </div>
              </Popup>
            </Circle>

            {/* Blast radius (3x crater diameter) */}
            <Circle
              center={[impactLocation.lat, impactLocation.lng]}
              radius={getCircleRadius(simulationResult.crater_diameter_km * 3)}
              pathOptions={{
                color: getCircleColor('blast'),
                fillColor: getCircleColor('blast'),
                fillOpacity: getCircleOpacity('blast'),
                weight: 1,
                dashArray: '10, 10'
              }}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-yellow-600">Blast Radius</h3>
                  <p>Radius: {(simulationResult.crater_diameter_km * 3).toFixed(1)} km</p>
                  <p className="text-sm text-gray-600">Severe damage zone</p>
                </div>
              </Popup>
            </Circle>
          </>
        )}

        {/* Loading overlay */}
        {isSimulating && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-800 font-medium">Analyzing impact zone...</span>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
};
