import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CostBreakdownItem } from '../../types/api';

interface CostBreakdownChartProps {
  breakdown: CostBreakdownItem[];
}

const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#818cf8', '#a855f7'];

export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ breakdown }) => {
  const data = breakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <div className="w-full h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.5rem',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any, props: any) => [
              `₹${Number(value).toLocaleString('en-IN')} (${props.payload.percentage}%)`,
              name,
            ]}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
