import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Compass,
  MapPin,
  Mountain,
  Droplets,
  Navigation,
  Sun,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GitCompare,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-16 py-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 text-center max-w-5xl mx-auto shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-brand-400" />
              <span>Geo-Spatial Pre-Planning & Site Suitability Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Intelligent Site Analysis for <span className="bg-gradient-to-r from-brand-400 to-sky-300 bg-clip-text text-transparent">Construction & Planning</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Evaluate terrain slopes, flood proxies, road accessibility, passive solar vectors, and preliminary cost estimates in seconds before breaking ground.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link to="/analyze">
                <Button variant="primary" size="lg" icon={<MapPin className="w-5 h-5" />}>
                  Start Site Selection & Analysis
                </Button>
              </Link>
              <Link to="/compare">
                <Button variant="outline" size="lg" icon={<GitCompare className="w-5 h-5" />}>
                  Compare Two Sites
                </Button>
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-800/80">
              <div>
                <span className="text-2xl font-extrabold text-white font-mono">5 Factors</span>
                <p className="text-xs text-slate-400 mt-0.5">Weighted Decision Index</p>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white font-mono">100%</span>
                <p className="text-xs text-slate-400 mt-0.5">Deterministic Calculation</p>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white font-mono">Open GIS</span>
                <p className="text-xs text-slate-400 mt-0.5">OSM, DEM, Open-Meteo</p>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white font-mono">Instant</span>
                <p className="text-xs text-slate-400 mt-0.5">PDF Report Export</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section id="capabilities" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Comprehensive Geo-Spatial Assessment
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Built on multi-criteria decision analysis (MCDA) combining terrain elevation, surface water proximity, and microclimate data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Terrain & Elevation Analysis" icon={<Mountain className="w-5 h-5 text-brand-400" />}>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculates slope percentages and topographic gradients using Digital Elevation Models (DEM) to estimate cut-and-fill excavation costs.
              </p>
            </Card>

            <Card title="Surface Water Proximity Indicator" icon={<Droplets className="w-5 h-5 text-sky-400" />}>
              <p className="text-xs text-slate-300 leading-relaxed">
                Measures distance and elevation differential to mapped surface water bodies to establish a surface water proximity indicator.
              </p>
            </Card>

            <Card title="Road & Transit Accessibility" icon={<Navigation className="w-5 h-5 text-emerald-400" />}>
              <p className="text-xs text-slate-300 leading-relaxed">
                Measures proximity to nearest mapped roads, major highways, and local transit stops for construction feasibility.
              </p>
            </Card>

            <Card title="Passive Solar & Orientation" icon={<Sun className="w-5 h-5 text-amber-400" />}>
              <p className="text-xs text-slate-300 leading-relaxed">
                Computes optimal building facade angles (e.g. 15° NE) balancing solar heat gain reduction with prevailing wind ventilation.
              </p>
            </Card>

            <Card title="Preliminary Cost Estimation" icon={<Calculator className="w-5 h-5 text-indigo-400" />}>
              <p className="text-xs text-slate-300 leading-relaxed">
                Itemizes structural foundation, superstructure, finishes, and MEP costs based on building area, quality grade, and slope multipliers.
              </p>
            </Card>

            <Card title="Executive PDF Export" icon={<ShieldCheck className="w-5 h-5 text-teal-400" />}>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates audit-ready executive reports complete with radar charts, parameter breakdowns, and data source attributions.
              </p>
            </Card>
          </div>
        </section>

        {/* Workflow Steps */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">How BuildWise Pre-Planning Works</h2>
            <p className="text-xs text-slate-400">Streamlined workflow from interactive location selection to printable insights.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm font-mono">1</span>
              <h3 className="font-semibold text-sm text-slate-200">Interactive Location Pin</h3>
              <p className="text-xs text-slate-400">Search address or click on the Leaflet map to capture latitude & longitude.</p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm font-mono">2</span>
              <h3 className="font-semibold text-sm text-slate-200">Building Requirements</h3>
              <p className="text-xs text-slate-400">Specify plot area, built-up footprint, floors, quality grade, and target budget.</p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm font-mono">3</span>
              <h3 className="font-semibold text-sm text-slate-200">Deterministic Engine</h3>
              <p className="text-xs text-slate-400">Aggregates elevation, road, and microclimate datasets into a 0-100 suitability score.</p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm font-mono">4</span>
              <h3 className="font-semibold text-sm text-slate-200">Dashboard & PDF Report</h3>
              <p className="text-xs text-slate-400">Review factor radar charts, cost breakdown, orientation compass, and export report.</p>
            </div>
          </div>
        </section>

        {/* Engineering Governance */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Engineering Policy & Transparency</span>
            </div>
            <h3 className="text-lg font-bold text-white">No Generative AI Model Dependencies</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              BuildWise AI uses auditable, mathematical geospatial algorithms for site suitability scoring. We strictly avoid unverified AI hallucinations or black-box predictions in pre-planning calculations.
            </p>
          </div>

          <Link to="/analyze">
            <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
              Launch Site Selection
            </Button>
          </Link>
        </section>
      </div>
    </AppLayout>
  );
};
