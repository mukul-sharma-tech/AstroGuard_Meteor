import axios from 'axios';
import { Asteroid, SimulationParams, SimulationResult } from '../types';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const asteroidApi = {
  async getAsteroids(): Promise<Asteroid[]> {
    const response = await api.get('/api/asteroids');
    if (response.data.success) {
      // Coerce numeric fields coming back as strings
      return (response.data.asteroids as any[]).map((a) => ({
        id: a.id,
        name: a.name,
        diameter: typeof a.diameter === 'number' ? a.diameter : parseFloat(a.diameter) || 0,
        velocity: typeof a.velocity === 'number' ? a.velocity : parseFloat(a.velocity) || 0,
        impact_probability:
          typeof a.impact_probability === 'number'
            ? a.impact_probability
            : parseFloat(a.impact_probability) || 0,
        palermo_scale:
          typeof a.palermo_scale === 'number' ? a.palermo_scale : parseFloat(a.palermo_scale) || 0,
      }));
    }
    throw new Error(response.data.error || 'Failed to fetch asteroids');
  },

  async simulateImpact(params: SimulationParams): Promise<SimulationResult> {
    const response = await api.post('/api/simulate', params);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Simulation failed');
  },

  async getElevation(lat: number, lng: number): Promise<number> {
    const response = await api.get('/api/elevation', {
      params: { lat, lng }
    });
    if (response.data.success) {
      return response.data.elevation;
    }
    throw new Error(response.data.error || 'Failed to get elevation');
  }
};
