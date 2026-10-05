import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-950/40 border border-amber-800/40 text-amber-200/90 rounded-lg p-2.5 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Preliminary Pre-Planning Guidance Only:</strong> Not a structural certification, soil test, or engineering blueprint. Physical testing is required before construction.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-slate-300 text-xs leading-relaxed flex gap-3.5">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-semibold text-amber-300 text-sm">Important Engineering & Planning Disclaimer</h4>
        <p>
          BuildWise AI provides preliminary geospatial pre-planning insights using deterministic weighted scoring and open geospatial data. 
          Results (including water indicators, slope, and cost estimates) are proxies for initial site evaluation. 
          This analysis does <strong>not</strong> substitute for certified geotechnical soil investigation, professional structural engineering, environmental impact assessments, or municipal zoning clearance.
        </p>
      </div>
    </div>
  );
};
