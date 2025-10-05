import React from 'react';
import { SimulationResult } from '../types'; // Make sure this path is correct
import { Zap, Target, Waves, Activity, Info, Rocket, ShieldCheck } from 'lucide-react';

// Define the props interface
interface ResultsDisplayProps {
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
}

// Helper function for class names
const cx = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' ');

// --- Sub-components for cleaner structure ---

// A reusable card for displaying a key metric
const MetricCard = ({ icon, title, value, unit, severityLabel, severityColor, footerText }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  severityLabel: string;
  severityColor: string;
  footerText: string;
}) => (
  <div className="bg-space-800/50 backdrop-blur-sm border border-space-700 p-4 rounded-lg flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-asteroid-400 flex items-center">
          {icon}
          {title}
        </h3>
        <span className={cx("text-xs font-bold px-2 py-1 rounded-full",
          severityColor === 'text-green-400' && 'bg-green-900/50 text-green-300',
          severityColor === 'text-yellow-400' && 'bg-yellow-900/50 text-yellow-300',
          severityColor === 'text-orange-400' && 'bg-orange-900/50 text-orange-300',
          severityColor === 'text-red-400' && 'bg-red-900/50 text-red-300'
        )}>
          {severityLabel}
        </span>
      </div>
      <div className="text-4xl font-bold font-mono mb-1 text-white">
        {value}
      </div>
      <div className="text-sm text-space-300">{unit}</div>
    </div>
    <div className="mt-3 text-xs text-space-400">
      {footerText}
    </div>
  </div>
);

// A smaller block for secondary info
const InfoBlock = ({ icon, title, value, valueColor, description }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  valueColor?: string;
  description: string;
}) => (
  <div className="bg-space-800/50 p-4 rounded-lg border border-space-700">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-bold flex items-center text-space-200">
        {icon}
        {title}
      </h4>
      <span className={cx("text-sm font-bold font-mono", valueColor || 'text-white')}>
        {value}
      </span>
    </div>
    <p className="text-sm text-space-300">{description}</p>
  </div>
);


// --- Main Component ---

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  simulationResult,
  isSimulating
}) => {
  // 1. Loading State
  if (isSimulating) {
    return (
      <div className="bg-space-900/80 backdrop-blur-md text-white p-6 rounded-lg shadow-lg border border-space-700">
        <h2 className="text-2xl font-bold mb-6 font-space flex items-center text-asteroid-400">
          <Activity className="mr-2 animate-spin" />
          Calculating Impact...
        </h2>
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-space-700 rounded w-3/4"></div>
          <div className="h-4 bg-space-700 rounded w-1/2 mt-2"></div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="h-24 bg-space-700 rounded"></div>
            <div className="h-24 bg-space-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Initial State
  if (!simulationResult) {
    return (
      <div className="bg-space-900/80 backdrop-blur-md text-white p-6 rounded-lg shadow-lg border border-space-700 text-center">
        <h2 className="text-2xl font-bold mb-4 font-space flex items-center justify-center">
          <Target className="mr-2" />
          Impact Analysis
        </h2>
        <div className="flex flex-col items-center text-space-300">
          <Rocket size={48} className="my-4 text-asteroid-400" />
          <p className="text-lg">Ready for simulation.</p>
          <p>Adjust parameters and run the analysis to predict the outcome.</p>
        </div>
      </div>
    );
  }

  // 3. Results Display
  const getSeverity = (value: number, thresholds: number[]): [string, string] => {
    if (value < thresholds[0]) return ['Low', 'text-green-400'];
    if (value < thresholds[1]) return ['Moderate', 'text-yellow-400'];
    if (value < thresholds[2]) return ['High', 'text-orange-400'];
    return ['Extreme', 'text-red-400'];
  };

  const [energyLabel, energySeverity] = getSeverity(simulationResult.impact_energy_mt, [10, 100, 1000]);
  const [craterLabel, craterSeverity] = getSeverity(simulationResult.crater_diameter_km, [1, 10, 50]);
  const [, seismicSeverity] = getSeverity(simulationResult.seismic_magnitude, [6, 7.5, 9]);

  // Educational tips that show based on results
  const educationalTips = [
    simulationResult.impact_energy_mt > 1000 && "An impact of this energy is comparable to the Chicxulub event that led to dinosaur extinction.",
    simulationResult.crater_diameter_km > 50 && "Craters this large affect global climate and can be seen from space.",
    simulationResult.tsunami_risk && "Ocean impacts can create mega-tsunamis that travel thousands of kilometers across basins.",
    simulationResult.miss_distance_km > 0 && "Even a small velocity change (ΔV), if applied early enough, can create a large miss distance.",
  ].filter(Boolean);


  return (
    <div className="bg-space-900/80 backdrop-blur-md text-white p-6 rounded-lg shadow-lg border border-space-700 max-h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 font-space flex items-center">
        <Target className="mr-2 text-asteroid-300" />
        Impact Analysis Results
      </h2>

      {/* Deflection Success Message */}
      {simulationResult.miss_distance_km > 0 && (
        <div className="bg-green-900/50 border border-green-500 p-4 rounded-lg mb-6 flex items-center">
          <ShieldCheck className="mr-4 text-green-300" size={32} />
          <div>
            <h3 className="font-bold text-lg text-green-300">Deflection Successful</h3>
            <p className="text-green-200">
              Asteroid missed Earth by <strong>{simulationResult.miss_distance_km.toFixed(1)} km</strong>. Threat neutralized.
            </p>
          </div>
        </div>
      )}

      {/* Main Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <MetricCard
          icon={<Zap className="mr-2" size={20} />}
          title="Impact Energy"
          value={simulationResult.impact_energy_mt.toFixed(1)}
          unit="Megatons of TNT"
          severityLabel={energyLabel}
          severityColor={energySeverity}
          footerText={`Equivalent to ~${Math.round(simulationResult.impact_energy_mt / 0.015)} Hiroshima bombs.`}
        />
        <MetricCard
          icon={<Target className="mr-2" size={20} />}
          title="Crater Diameter"
          value={simulationResult.crater_diameter_km.toFixed(1)}
          unit="Kilometers"
          severityLabel={craterLabel}
          severityColor={craterSeverity}
          footerText={
            simulationResult.crater_diameter_km > 100 ? 'Planet-altering event' :
            simulationResult.crater_diameter_km > 10 ? 'City-level destruction' : 'Localized damage'
          }
        />
      </div>

      {/* Secondary Effects */}
      <div className="space-y-4 mb-6">
        <h3 className="font-bold text-lg text-asteroid-400 border-b border-space-700 pb-2">Secondary Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBlock
            icon={<Waves className="mr-2" size={16} />}
            title="Tsunami Risk"
            value={simulationResult.tsunami_risk ? 'HIGH' : 'LOW'}
            valueColor={simulationResult.tsunami_risk ? 'text-red-400' : 'text-green-400'}
            description={simulationResult.tsunami_risk ? "Ocean impact will generate a tsunami." : "Land impact, no direct tsunami risk."}
          />
          <InfoBlock
            icon={<Activity className="mr-2" size={16} />}
            title="Seismic Magnitude"
            value={`${simulationResult.seismic_magnitude.toFixed(1)}`}
            valueColor={seismicSeverity}
            description="Richter scale equivalent."
          />
        </div>
        <InfoBlock
          icon={<Zap className="mr-2" size={16} />}
          title="Fireball Radius"
          value={`${simulationResult.fireball_radius_km.toFixed(1)} km`}
          valueColor="text-red-400"
          description="Zone of intense heat and vaporization."
        />
      </div>

      {/* Educational Info */}
      {educationalTips.length > 0 && (
        <div className="mt-6 p-4 bg-space-800/50 rounded-lg border border-space-700">
          <h4 className="font-bold text-asteroid-400 mb-2 flex items-center">
            <Info className="mr-2" size={16} />
            Did You Know?
          </h4>
          <div className="text-sm text-space-300 space-y-2">
            {educationalTips.map((tip, index) => <p key={index}>• {tip}</p>)}
          </div>
        </div>
      )}
    </div>
  );
};