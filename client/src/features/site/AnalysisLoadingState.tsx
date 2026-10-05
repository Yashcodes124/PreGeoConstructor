import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Compass, Mountain, ShieldAlert, Navigation, DollarSign, Cpu } from 'lucide-react';

interface AnalysisLoadingStateProps {
  onComplete?: () => void;
}

export const AnalysisLoadingState: React.FC<AnalysisLoadingStateProps> = () => {
  const steps = [
    { label: 'Fetching Digital Elevation Model (DEM) & Slope Profile...', icon: Mountain },
    { label: 'Analyzing Surface Runoff & Water Risk Buffers...', icon: ShieldAlert },
    { label: 'Evaluating Road Infrastructure & Transit Proximity...', icon: Navigation },
    { label: 'Calculating Passive Solar Azimuth & Wind Vectors...', icon: Compass },
    { label: 'Computing Regional Cost Baseline & Multipliers...', icon: DollarSign },
    { label: 'Synthesizing Multi-Criteria Decision Suitability Index...', icon: Cpu },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto shadow-2xl space-y-6 text-center">
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-100">Executing Geospatial Analysis Engine</h3>
        <p className="text-xs text-slate-400 mt-1">
          Running deterministic spatial calculations and multi-criteria weighted scoring.
        </p>
      </div>

      {/* Steps checklist */}
      <div className="space-y-3 text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isDone
                  ? 'text-emerald-400'
                  : isCurrent
                  ? 'text-slate-100 font-medium'
                  : 'text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />
              ) : (
                <Icon className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <span className="min-w-0 truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-500 font-mono">
        Deterministic Geo Engine v1.0 • No AI API calls required
      </div>
    </div>
  );
};
