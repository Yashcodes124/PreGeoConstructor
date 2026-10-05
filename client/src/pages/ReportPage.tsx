import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnalysisResponse, getAnalysis, FactorResult, CostBreakdownItem } from '../services/api';
import { Printer, ArrowLeft, Compass, ShieldCheck, Calendar, Building2 } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    if (id) {
      getAnalysis(id).then(setAnalysis);
    }
  }, [id]);

  if (!analysis) {
    return <div className="p-8 text-center text-slate-400">Loading printable report...</div>;
  }

  const { site } = analysis;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <Link to={`/analysis/${analysis.id}`} className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analysis Dashboard</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Document Container */}
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 card-print">
        {/* Document Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-lg">
              <Compass className="w-5 h-5" />
              <span>BuildWise AI Pre-Planning Report</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {site.projectName || 'Site Suitability Assessment'}
            </h1>
            <p className="text-xs text-slate-400 font-mono">Report Ref ID: {analysis.id}</p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 space-y-1">
            <div className="flex items-center justify-end gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Generated: {new Date(analysis.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold">100% Deterministic Engine</div>
          </div>
        </div>

        {/* Site & Building Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Coordinates</span>
            <span className="text-slate-200 font-bold">{site.latitude.toFixed(4)}°, {site.longitude.toFixed(4)}°</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Building Type</span>
            <span className="text-slate-200 font-bold capitalize">{site.buildingType}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Total Area</span>
            <span className="text-slate-200 font-bold">{(site.builtUpAreaSqFt * site.floors).toLocaleString()} sq ft</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Quality Grade</span>
            <span className="text-slate-200 font-bold capitalize">{site.qualityGrade}</span>
          </div>
        </div>

        {/* Suitability Score Summary */}
        <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Overall Site Suitability</h3>
            <p className="text-xs text-slate-400 mt-0.5">Multi-criteria decision analysis (MCDA) index result</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-white font-mono">{analysis.overallSuitabilityScore ?? '—'} / 100</span>
            <span className="text-xs font-semibold text-emerald-400 block">{analysis.suitabilityCategory}</span>
          </div>
        </div>

        {/* Factor Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>Weighted Factor Breakdown</span>
          </h3>

          <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-950 text-slate-400">
              <tr className="border-b border-slate-800">
                <th className="py-2.5 px-3">Factor</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Raw Observation</th>
                <th className="py-2.5 px-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {analysis.factors.map((f: FactorResult, i: number) => (
                <tr key={i} className="text-slate-300">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{f.name}</td>
                  <td className="py-2.5 px-3 font-mono">{(f.weight * 100).toFixed(0)}%</td>
                  <td className="py-2.5 px-3">{f.rawValue}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-brand-300">{f.score === null ? 'Unavailable' : `${f.score} / 10`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preliminary Cost Estimate Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Preliminary Cost Estimate Breakdown
          </h3>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between font-mono text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-300">Total Estimated Cost Range:</span>
              <span className="font-extrabold text-white">
                ₹{(analysis.cost.rangeLow / 100000).toFixed(2)} - ₹{(analysis.cost.rangeHigh / 100000).toFixed(2)} Lakhs
              </span>
            </div>

            <div className="space-y-2">
              {analysis.cost.breakdown.map((item: CostBreakdownItem, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-slate-400">
                  <span>{item.category} ({item.percentage}%)</span>
                  <span className="font-mono text-slate-200">₹{(item.amount / 100000).toFixed(2)} Lakhs</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orientation & Recommendations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recommended Orientation & Passive Solar
          </h3>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <p>
              <strong>Optimal Facing Angle:</strong> {analysis.orientation.recommendedCardinal} ({analysis.orientation.recommendedAngle}° Angle).
            </p>
            <p>{analysis.orientation.explanation}</p>
          </div>
        </div>

        {/* Engineering Disclaimer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Policy & Pre-Planning Disclaimer</span>
          </div>
          <p>
            This document represents preliminary pre-planning geospatial guidance generated deterministically by BuildWise AI. 
            It is not a substitute for certified geotechnical soil physical testing, structural engineering designs, environmental clearance, or municipal zoning approval.
          </p>
        </div>
      </div>
    </div>
  );
};
