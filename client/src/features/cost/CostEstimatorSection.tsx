import React from 'react';
import { CostEstimate } from '../../types/api';
import { Card } from '../../components/ui/Card';
import { CostBreakdownChart } from '../../components/charts/CostBreakdownChart';
import { Calculator, AlertTriangle, Layers } from 'lucide-react';

interface CostEstimatorSectionProps {
  cost: CostEstimate;
  budget?: number;
}

export const CostEstimatorSection: React.FC<CostEstimatorSectionProps> = ({ cost, budget }) => {
  const formattedTotal = `₹${(cost.estimatedTotalCost / 100000).toFixed(2)} Lakhs`;
  const formattedLow = `₹${(cost.rangeLow / 100000).toFixed(2)} Lakhs`;
  const formattedHigh = `₹${(cost.rangeHigh / 100000).toFixed(2)} Lakhs`;

  const budgetDelta = budget ? cost.estimatedTotalCost - budget : 0;
  const isOverBudget = budgetDelta > 0;

  return (
    <div className="space-y-6">
      {/* Top Cost Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estimated Total Cost */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-900/90 border-brand-500/30">
          <span className="text-xs font-semibold text-brand-300 block uppercase tracking-wider mb-1">
            Preliminary Cost Estimate
          </span>
          <div className="text-2xl font-extrabold text-white font-mono">{formattedTotal}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Range: {formattedLow} - {formattedHigh}
          </p>
        </Card>

        {/* Base Rate & Multipliers */}
        <Card>
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">
            Unit Rate & Multipliers
          </span>
          <div className="text-lg font-bold text-slate-100 font-mono">
            ₹{cost.baseRatePerSqFt.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ sq ft</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono space-x-2">
            <span>Terrain: {cost.terrainMultiplier}x</span>
            <span>•</span>
            <span>Quality: {cost.qualityMultiplier}x</span>
          </div>
        </Card>

        {/* Budget Comparison */}
        <Card>
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">
            Target Budget Status
          </span>
          {budget ? (
            <div>
              <div className={`text-lg font-bold font-mono ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isOverBudget ? `+₹${(budgetDelta / 100000).toFixed(2)} Lakhs (+${((budgetDelta / budget) * 100).toFixed(1)}%)` : 'Within Budget'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Budget: ₹{(budget / 100000).toFixed(2)} Lakhs
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-1">No budget limit specified during setup</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown Chart */}
        <Card title="Itemized Construction Cost Distribution" icon={<Calculator className="w-4 h-4" />} className="lg:col-span-2">
          <CostBreakdownChart breakdown={cost.breakdown} />
        </Card>

        {/* Breakdown Table */}
        <Card title="Structural Component Breakdown" icon={<Layers className="w-4 h-4" />}>
          <div className="space-y-3 divide-y divide-slate-800/80">
            {cost.breakdown.map((item, idx) => (
              <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-slate-200 block">{item.category}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">{item.description}</span>
                </div>
                <div className="text-right shrink-0 ml-3 font-mono">
                  <span className="font-bold text-slate-100">₹{(item.amount / 100000).toFixed(2)} L</span>
                  <span className="text-[10px] text-slate-500 block">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Estimator Disclaimer */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Cost Estimation Notice:</strong> {cost.disclaimer} Base rates are illustrative, unsourced planning assumptions and are not derived from official schedules of rates or published market indices.
        </p>
      </div>
    </div>
  );
};
