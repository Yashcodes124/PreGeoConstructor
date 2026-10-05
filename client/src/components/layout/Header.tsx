import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Layers, MapPin, GitCompare, Activity } from 'lucide-react';
import { checkHealth } from '../../services/api';

export const Header: React.FC = () => {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState<{ status: string; backendConnected: boolean }>({
    status: 'checking',
    backendConnected: false,
  });

  useEffect(() => {
    checkHealth().then(setBackendStatus);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">BuildWise</span>
              <span className="bg-brand-500/20 border border-brand-500/30 text-brand-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                GIS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Site Pre-Planning & Analysis</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/analyze"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              isActive('/analyze')
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4 text-brand-400" />
            <span>Site Selection</span>
          </Link>

          <Link
            to="/compare"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              isActive('/compare')
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <GitCompare className="w-4 h-4 text-sky-400" />
            <span>Compare Sites</span>
          </Link>

          <Link
            to="/#capabilities"
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Methodology</span>
          </Link>
        </nav>

        {/* Status Indicator & CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800" title={backendStatus.backendConnected ? 'Backend API Connected' : 'Frontend Standalone Mode (Deterministic GIS Engine active)'}>
            <Activity className={`w-3.5 h-3.5 ${backendStatus.backendConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-400">
              {backendStatus.backendConnected ? 'API Live' : 'Deterministic GIS Active'}
            </span>
          </div>

          <Link
            to="/analyze"
            className="bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-md shadow-brand-900/30 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Analyze Site</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
