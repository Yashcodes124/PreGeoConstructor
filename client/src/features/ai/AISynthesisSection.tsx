import React from 'react';
import { AISynthesis } from '../../types/api';
import { Card } from '../../components/ui/Card';
import { Sparkles, Compass, Lightbulb, ShieldCheck, Cpu } from 'lucide-react';

interface AISynthesisSectionProps {
  synthesis: AISynthesis;
  score?: number | null;
}

export const AISynthesisSection: React.FC<AISynthesisSectionProps> = ({ synthesis }) => {
  return (
    <div className="space-y-6">
      <Card
        title="Spatial Pre-Planning Synthesis & Executive Insights"
        subtitle="Rule-based architectural and civil engineering guidance"
        icon={<Sparkles className="w-4 h-4 text-brand-400" />}
        className="border-brand-500/30"
      >
        <div className="space-y-6">
          {/* Executive Summary Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 text-sm leading-relaxed">
            <p>{synthesis.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Architectural Recommendations */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-400" />
                <span>Architectural & Structural Guidance</span>
              </h4>
              <ul className="space-y-2">
                {synthesis.architecturalRecommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-1.5"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sustainability Notes */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                <span>Microclimate & Passive Design Opportunities</span>
              </h4>
              <ul className="space-y-2">
                {synthesis.sustainabilityNotes.map((note, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Engine Notice Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand-400" />
              <span>{synthesis.engineNotice}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Deterministic & Auditable</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
