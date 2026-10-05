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
import { FactorResult } from '../../types/api';

interface SuitabilityRadarChartProps {
  factors: FactorResult[];
}

export const SuitabilityRadarChart: React.FC<SuitabilityRadarChartProps> = ({ factors }) => {
  const chartData = factors
    .filter((factor) => factor.score !== null)
    .map((factor) => ({
      factorName: factor.name,
      score: factor.score,
      fullMark: 10,
      weightLabel: `${(factor.weight * 100).toFixed(0)}%`,
    }));

  return (
    <div className="w-full h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="factorName"
            stroke="#94a3b8"
            tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#475569" tick={{ fontSize: 10 }} />
          <Radar
            name="Factor Score (0-10)"
            dataKey="score"
            stroke="#0284c7"
            fill="#0284c7"
            fillOpacity={0.4}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.5rem',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(val: any) => [`${val} / 10`, 'Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
