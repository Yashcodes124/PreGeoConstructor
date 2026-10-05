import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CandidateAngleScore } from '../../types/api';

interface OrientationCompassChartProps {
  candidates: CandidateAngleScore[];
  recommendedAngle: number;
}

export const OrientationCompassChart: React.FC<OrientationCompassChartProps> = ({
  candidates,
}) => {
  return (
    <div className="w-full h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={candidates}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="label"
            stroke="#94a3b8"
            tick={{ fill: '#cbd5e1', fontSize: 10 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#475569" tick={{ fontSize: 9 }} />
          <Radar
            name="Solar Suitability"
            dataKey="solarScore"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.25}
          />
          <Radar
            name="Wind Cross-Ventilation"
            dataKey="windScore"
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity={0.25}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.5rem',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
