import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DisclaimerBanner } from '../components/ui/DisclaimerBanner';
import { SuitabilitySection } from '../features/suitability/SuitabilitySection';
import { TerrainEnvironmentSection } from '../features/environment/TerrainEnvironmentSection';
import { OrientationSection } from '../features/orientation/OrientationSection';
import { CostEstimatorSection } from '../features/cost/CostEstimatorSection';
import { AISynthesisSection } from '../features/ai/AISynthesisSection';
import { ReportSection } from '../features/report/ReportSection';
import { AnalysisResponse, getAnalysis } from '../services/api';
import {
  MapPin,
  Calendar,
  Mountain,
  Compass,
  DollarSign,
  Sparkles,
  FileText,
  Printer,
  GitCompare,
  ArrowLeft,
  Loader2,
  Award,
} from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suitability' | 'terrain' | 'orientation' | 'cost' | 'ai' | 'report'>('suitability');

  useEffect(() => {
    if (id) {
      setLoading(true);
      getAnalysis(id)
        .then(res => {
          setAnalysis(res);
          setLoading(false);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Analysis could not be loaded');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading analysis workspace details...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !analysis) {
    return (
      <AppLayout>
        <div className="py-24 text-center space-y-3">
          <p className="text-sm text-rose-300">{error || 'Analysis not found'}</p>
          <Link to="/analyze" className="text-xs text-brand-300 hover:text-white">Return to site selection</Link>
        </div>
      </AppLayout>
    );
  }

  const { site, overallSuitabilityScore, suitabilityCategory } = analysis;

  return (
    <AppLayout>
      <div className="space-y-6 py-2">
        {/* Top Back Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link to="/analyze" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Site Selection</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to={`/compare?siteA=${analysis.id}`}>
              <Button variant="outline" size="sm" icon={<GitCompare className="w-4 h-4 text-sky-400" />}>
                Compare with Site B
              </Button>
            </Link>
            <Link to={`/report/${analysis.id}`}>
              <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />}>
                Printable PDF Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Project Header Banner */}
        <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={suitabilityCategory === 'Highly Suitable' ? 'success' : 'warning'}>
                  {suitabilityCategory}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">ID: {analysis.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {site.projectName || 'Site Suitability Report'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  {site.displayName}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quick Score Counter */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center shrink-0 min-w-[160px]">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Suitability Score</span>
              <div className="text-3xl font-extrabold text-white font-mono mt-0.5">{overallSuitabilityScore ?? '—'} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
              <span className="text-[10px] text-emerald-400 font-medium block mt-1">Multi-Criteria Index</span>
            </div>
          </div>
        </Card>

        {/* Disclaimer Banner */}
        <DisclaimerBanner compact />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800/80 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('suitability')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'suitability'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Suitability & Decision Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('terrain')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'terrain'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Mountain className="w-4 h-4" />
            <span>Terrain & Flood Indicator</span>
          </button>

          <button
            onClick={() => setActiveTab('orientation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'orientation'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Passive Solar & Orientation</span>
          </button>

          <button
            onClick={() => setActiveTab('cost')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'cost'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Preliminary Cost Estimate</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'ai'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Spatial Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'report'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Data Sources & PDF Export</span>
          </button>
        </div>

        {/* Tab Content Rendering */}
        <div className="pt-2">
          {activeTab === 'suitability' && (
            <SuitabilitySection
              score={analysis.overallSuitabilityScore}
              category={analysis.suitabilityCategory}
              factors={analysis.factors}
            />
          )}

          {activeTab === 'terrain' && (
            <TerrainEnvironmentSection
              terrain={analysis.terrain}
              waterRisk={analysis.waterRisk}
              accessibility={analysis.accessibility}
              facilities={analysis.facilities}
              environment={analysis.environment}
            />
          )}

          {activeTab === 'orientation' && (
            <OrientationSection orientation={analysis.orientation} />
          )}

          {activeTab === 'cost' && (
            <CostEstimatorSection cost={analysis.cost} budget={site.budget} />
          )}

          {activeTab === 'ai' && (
            <AISynthesisSection synthesis={analysis.aiSynthesis} score={analysis.overallSuitabilityScore} />
          )}

          {activeTab === 'report' && (
            <ReportSection
              analysisId={analysis.id}
              sources={analysis.sources}
              dataConfidence={analysis.dataConfidence}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};
