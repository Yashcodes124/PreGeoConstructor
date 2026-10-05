import React from 'react';
import { OrientationResult } from '../../types/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { OrientationCompassChart } from '../../components/charts/OrientationCompassChart';
import { Compass, Sun, Wind, CheckCircle2 } from 'lucide-react';

interface OrientationSectionProps {
  orientation: OrientationResult;
}

export const OrientationSection: React.FC<OrientationSectionProps> = ({ orientation }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Orientation Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between py-6">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Facade Facing</span>
            <Badge variant="success">Optimal Alignment</Badge>
          </div>

          <div className="my-6 text-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-brand-500/10 border-2 border-brand-500/40 mx-auto flex items-center justify-center text-brand-400 shadow-xl shadow-brand-500/10">
              <Compass className="w-10 h-10 animate-pulse" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight block font-mono">
              {orientation.recommendedCardinal}
            </span>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Optimized for minimal thermal gain and maximum natural ventilation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-amber-400 block font-semibold flex items-center justify-center gap-1">
                <Sun className="w-3 h-3" /> Solar Index
              </span>
              <span className="text-sm font-bold text-white font-mono">{orientation.solarScore ?? '—'} / 10</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-sky-400 block font-semibold flex items-center justify-center gap-1">
                <Wind className="w-3 h-3" /> Wind Vector
              </span>
              <span className="text-sm font-bold text-white font-mono">{orientation.windScore ?? '—'} / 10</span>
            </div>
          </div>
        </Card>

        {/* Compass Candidate Radar Chart */}
        <Card title="Orientation Angle Evaluation (Solar vs Wind)" icon={<Compass className="w-4 h-4" />} className="lg:col-span-2">
          <OrientationCompassChart
            candidates={orientation.candidateScores}
            recommendedAngle={orientation.recommendedAngle}
          />
        </Card>
      </div>

      {/* Rationale & Solar Path Details */}
      <Card title="Passive Climate & Environmental Rationale">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Sun className="w-4 h-4" />
              <span>Solar Trajectory & Shading Profile</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {orientation.explanation}
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono space-y-1 border-t border-slate-900">
              <div>Sunrise Azimuth: {orientation.solarPath.sunriseAzimuth}° E</div>
              <div>Sunset Azimuth: {orientation.solarPath.sunsetAzimuth}° W</div>
              <div>Peak Elevation Angle: {orientation.solarPath.peakElevation}°</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
              <Wind className="w-4 h-4" />
              <span>Prevailing Breeze & Ventilation Alignment</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {orientation.prevailingWind.summary
                || `Prevailing wind direction: ${orientation.prevailingWind.direction}. Speed: ${orientation.prevailingWind.avgSpeedKmH ?? 'unavailable'}. This is planning guidance, not an energy-savings claim.`}
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5 border-t border-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>No percentage energy saving is claimed. Use this only as passive-design guidance.</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
