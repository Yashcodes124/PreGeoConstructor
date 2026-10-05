import React from 'react';
import { Compass, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-200 tracking-tight">BuildWise AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Intelligent geo-based pre-planning and site suitability analysis platform for modern civil engineering, architectural planning, and real estate assessment.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Platform Modules</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/analyze" className="hover:text-brand-400 transition-colors">Site Selection & Map</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-brand-400 transition-colors">Two-Site Comparison</Link>
              </li>
              <li>
                <a href="#methodology" className="hover:text-brand-400 transition-colors">Weighted Scoring Engine</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Providers */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Open Geospatial Data</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1">
                <span>© OpenStreetMap contributors</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </li>
              <li className="flex items-center gap-1">
                <span>SRTM Digital Elevation Model</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Open-Meteo Weather & Solar</span>
              </li>
              <li className="flex items-center gap-1">
                <span>SunCalc Astronomical Engine</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Disclaimer */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Engineering Policy</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              BuildWise AI utilizes deterministic multi-criteria decision analysis (MCDA). No black-box generative AI models or unverified estimates. All outputs are preliminary planning indicators.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} BuildWise AI. Developed for Civil & Geospatial Pre-Planning.</p>
          <div className="flex gap-4">
            <span className="text-slate-500">Terms of Pre-Planning Use</span>
            <span className="text-slate-500">Data Attribution</span>
            <span className="text-slate-500">Privacy & Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
