import React, { useState } from 'react';
import { DataSourceAttribution, DataConfidence } from '../../types/api';
import { generateReport } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Printer, ShieldCheck, Database, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReportSectionProps {
  analysisId: string;
  sources: DataSourceAttribution[];
  dataConfidence: DataConfidence;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  analysisId,
  sources,
  dataConfidence,
}) => {
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const downloadPdf = async () => {
    setPdfError(null);
    setPdfBusy(true);
    try {
      const report = await generateReport(analysisId);
      window.open(report.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'PDF report could not be generated');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Data Confidence Metric */}
        <Card title="Data Quality & Confidence" icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-white font-mono">
                {dataConfidence.confidenceScorePercent}%
              </span>
              <Badge variant={dataConfidence.overallConfidence === 'High' ? 'success' : 'warning'}>
                {dataConfidence.overallConfidence} Quality
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated from {dataConfidence.providersCount} open geospatial services.
            </p>

            {dataConfidence.missingDataPoints.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                  Unavailable Proxies (Requires Field Survey):
                </span>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  {dataConfidence.missingDataPoints.map((dp, i) => (
                    <li key={i}>{dp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* PDF & Export Actions */}
        <Card title="Report Generation & Export" icon={<FileText className="w-4 h-4 text-brand-400" />} className="md:col-span-2">
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Generate a formatted executive site report complete with suitability metrics, radar charts, terrain profile, cost breakdown, and data attributions.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to={`/report/${analysisId}`}>
                <Button variant="primary" size="md" icon={<Printer className="w-4 h-4" />}>
                  View & Print Full Report
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => void downloadPdf()}
                disabled={pdfBusy}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/80 transition-colors flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{pdfBusy ? 'Preparing PDF...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/80 transition-colors flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Quick Print Page</span>
              </button>
            </div>
            {pdfError && <p className="text-xs text-rose-300">{pdfError}</p>}
          </div>
        </Card>
      </div>

      {/* Sources Attribution Table */}
      <Card title="Geospatial Data Sources & Attribution" icon={<Database className="w-4 h-4 text-sky-400" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Data Provider</th>
                <th className="py-2.5 px-3">Data Category</th>
                <th className="py-2.5 px-3">Attribution & License</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sources.map((src, idx) => (
                <tr key={idx} className="text-slate-300 hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{src.provider}</td>
                  <td className="py-2.5 px-3 text-slate-400">{src.dataType}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{src.attribution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
