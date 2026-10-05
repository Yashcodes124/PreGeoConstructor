import React from 'react';
import { FactorResult } from '../../types/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SuitabilityRadarChart } from '../../components/charts/SuitabilityRadarChart';
import { Award, Layers, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface SuitabilitySectionProps {
  score: number | null;
  category: string;
  factors: FactorResult[];
}

export const SuitabilitySection: React.FC<SuitabilitySectionProps> = ({
  score,
  category,
  factors,
}) => {
  const getCategoryBadgeVariant = (cat: string) => {
    if (cat === 'Highly Suitable') return 'success';
    if (cat === 'Moderately Suitable') return 'info';
    if (cat === 'Challenging Site' || cat === 'Insufficient Data') return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Gauge Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between items-center text-center py-6">
          <div className="w-full text-left flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Site Suitability</span>
            <Badge variant={getCategoryBadgeVariant(category)}>{category}</Badge>
          </div>

          <div className="my-6 relative flex items-center justify-center">
            {/* Score Ring */}
            <div className="w-40 h-40 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={score !== null && score >= 80 ? 'text-emerald-500' : score !== null && score >= 65 ? 'text-sky-500' : 'text-amber-500'}
                  strokeDasharray="264"
                  strokeDashoffset={score === null ? 264 : 264 - (264 * score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">{score ?? '—'}</span>
                <span className="text-[11px] text-slate-400 font-mono">/ 100 Index</span>
              </div>
            </div>
          </div>

          <div className="w-full text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-left">
            <p className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
              <Award className="w-4 h-4 text-brand-400" />
              <span>Weighted Decision Matrix</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Derived from 5 core parameters: Terrain Slope (25%), Water Indicator (20%), Road Access (20%), Facilities (20%), and Microclimate (15%).
            </p>
          </div>
        </Card>

        {/* Radar Chart Card */}
        <Card title="Factor Score Breakdown (Radar Visualizer)" icon={<Layers className="w-4 h-4" />} className="lg:col-span-2">
          <SuitabilityRadarChart factors={factors} />
        </Card>
      </div>

      {/* Factor Detail Cards List */}
      <Card title="Multi-Criteria Parameter Analysis" subtitle="Detailed factor evaluation and raw geospatial values">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((f, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-slate-200">{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Weight: {(f.weight * 100).toFixed(0)}%</span>
                  <Badge variant={f.status === 'optimal' ? 'success' : f.status === 'moderate' ? 'info' : f.status === 'unavailable' ? 'outline' : 'warning'}>
                    {f.score === null ? 'Unavailable' : `${f.score} / 10`}
                  </Badge>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    f.score !== null && f.score >= 8 ? 'bg-emerald-500' : f.score !== null && f.score >= 6 ? 'bg-sky-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${((f.score ?? 0) / 10) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-start gap-2 pt-1 text-xs text-slate-300">
                {f.status === 'optimal' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : f.status === 'moderate' ? (
                  <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-mono text-slate-400 block text-[11px]">Raw Value: {f.rawValue}</span>
                  <p className="mt-0.5 text-slate-300 text-xs">{f.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
