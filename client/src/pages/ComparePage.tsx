import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CompareResponse, compareAnalyses } from '../services/api';
import { GitCompare, MapPin, Award, DollarSign, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const siteAIdParam = searchParams.get('siteA');
  const siteBIdParam = searchParams.get('siteB');

  const [siteAId, setSiteAId] = useState(siteAIdParam || '');
  const [siteBId, setSiteBId] = useState(siteBIdParam || '');
  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runComparison = async (idA: string, idB: string) => {
    if (!idA || !idB) {
      setError('Enter two saved analysis IDs. Sample sites are not generated.');
      setComparison(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setComparison(await compareAnalyses(idA, idB));
    } catch (err) {
      setComparison(null);
      setError(err instanceof Error ? err.message : 'Comparison could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteAIdParam && siteBIdParam) {
      setSiteAId(siteAIdParam);
      setSiteBId(siteBIdParam);
      void runComparison(siteAIdParam, siteBIdParam);
    }
  }, [siteAIdParam, siteBIdParam]);

  return (
    <AppLayout>
      <div className="space-y-6 py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <Link to="/analyze" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Site Selection</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-sky-400" />
              <span>Two-Site Side-by-Side Comparison</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Compare factor scores, terrain slopes, water indicators, and preliminary costs between candidate locations.
            </p>
          </div>
        </div>

        <form
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void runComparison(siteAId.trim(), siteBId.trim());
          }}
        >
          <input value={siteAId} onChange={(event) => setSiteAId(event.target.value)} placeholder="Analysis ID A" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100" />
          <input value={siteBId} onChange={(event) => setSiteBId(event.target.value)} placeholder="Analysis ID B" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100" />
          <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg px-4 py-2">Compare saved analyses</button>
        </form>
        {error && <p className="text-xs text-rose-300">{error}</p>}

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading side-by-side comparison matrix...</p>
          </div>
        ) : comparison ? (
          <div className="space-y-6">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site A Card */}
              <Card
                title={`Site A: ${comparison.siteA.site.projectName || 'First Location'}`}
                icon={<MapPin className="w-4 h-4 text-brand-400" />}
                className={comparison.winnerSiteId === comparison.siteA.id ? 'border-emerald-500/40' : ''}
              >
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{comparison.siteA.site.displayName}</span>
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 block">Suitability Score</span>
                      <span className="text-2xl font-extrabold text-white font-mono">{comparison.siteA.overallSuitabilityScore ?? '—'} / 100</span>
                    </div>
                    <Badge variant={comparison.siteA.suitabilityCategory === 'Highly Suitable' ? 'success' : 'warning'}>
                      {comparison.siteA.suitabilityCategory}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Est. Cost: ₹{(comparison.siteA.cost.estimatedTotalCost / 100000).toFixed(2)} Lakhs
                  </div>
                </div>
              </Card>

              {/* Site B Card */}
              <Card
                title={`Site B: ${comparison.siteB.site.projectName || 'Second Location'}`}
                icon={<MapPin className="w-4 h-4 text-sky-400" />}
                className={comparison.winnerSiteId === comparison.siteB.id ? 'border-emerald-500/40' : ''}
              >
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{comparison.siteB.site.displayName}</span>
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 block">Suitability Score</span>
                      <span className="text-2xl font-extrabold text-white font-mono">{comparison.siteB.overallSuitabilityScore ?? '—'} / 100</span>
                    </div>
                    <Badge variant={comparison.siteB.suitabilityCategory === 'Highly Suitable' ? 'success' : 'warning'}>
                      {comparison.siteB.suitabilityCategory}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Est. Cost: ₹{(comparison.siteB.cost.estimatedTotalCost / 100000).toFixed(2)} Lakhs
                  </div>
                </div>
              </Card>
            </div>

            {/* Winner Recommendation Banner */}
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4 flex items-center gap-3 text-emerald-200 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong>Pre-Planning Evaluation Summary:</strong>{' '}
                {comparison.summary
                  || 'This is a score comparison of stored analyses only. It is not a universal site recommendation.'}
              </div>
            </div>

            {/* Factor Comparison Table */}
            <Card title="Factor-by-Factor Score Comparison" icon={<Award className="w-4 h-4 text-amber-400" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Factor Name</th>
                      <th className="py-2.5 px-3">Site A Score</th>
                      <th className="py-2.5 px-3">Site B Score</th>
                      <th className="py-2.5 px-3">Score Delta</th>
                      <th className="py-2.5 px-3">Favorable Site</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {comparison.factorComparison.map((f, idx) => (
                      <tr key={idx} className="text-slate-300">
                        <td className="py-3 px-3 font-semibold text-slate-200">{f.factor}</td>
                        <td className="py-3 px-3 font-mono">{f.scoreA ?? '—'} / 10</td>
                        <td className="py-3 px-3 font-mono">{f.scoreB ?? '—'} / 10</td>
                        <td className="py-3 px-3 font-mono">
                          {f.difference === null ? '—' : f.difference > 0 ? `+${f.difference}` : f.difference}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={
                              f.better === 'A' ? 'success' : f.better === 'B' ? 'info' : 'default'
                            }
                          >
                            {f.better === 'A' ? 'Site A higher' : f.better === 'B' ? 'Site B higher' : f.better === 'Unavailable' ? 'Unavailable' : 'Equal score'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Cost Delta Card */}
            <Card title="Preliminary Cost Delta Analysis" icon={<DollarSign className="w-4 h-4 text-emerald-400" />}>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300">Total Estimate Delta (Site A vs Site B)</span>
                  <span className="font-extrabold text-white font-mono text-sm">
                    ₹{(Math.abs(comparison.costComparison.difference) / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Note: Cost variations stem from differences in terrain slope multipliers and built-up footprint configurations.
                </p>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};
