import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import { env } from '../../config/env';
import type { AnalysisResponse } from '../../types/domain';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { getStoredAnalysis } from '../analysis/persistence';
import { getPrisma } from '../db';

function storageDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../..', env.REPORT_STORAGE_DIR);
}

function formatNullable(value: number | null, suffix = ''): string {
  return value === null ? 'Unavailable' : `${value}${suffix}`;
}

function writeSection(doc: PDFKit.PDFDocument, title: string, lines: string[]): void {
  doc.moveDown(0.6);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text(title);
  doc.moveDown(0.25);
  doc.font('Helvetica').fontSize(9).fillColor('#1f2937');
  for (const line of lines) {
    doc.text(line, { width: 500 });
  }
}

export async function generatePdfReport(analysisId: string): Promise<{ reportId: string; downloadUrl: string; generatedAt: string }> {
  const analysis = await getStoredAnalysis(analysisId);
  const directory = storageDir();
  await fs.promises.mkdir(directory, { recursive: true });

  const report = await getPrisma().report.create({
    data: { analysisId, storagePath: null },
  });
  const filePath = path.join(directory, `${report.id}.pdf`);

  try {
    await renderPdf(analysis, filePath);
  } catch (error) {
    logger.error('PDF render failed', { name: error instanceof Error ? error.name : 'unknown' });
    throw new AppError(500, 'Report could not be generated', 'report_failed');
  }

  const saved = await getPrisma().report.update({
    where: { id: report.id },
    data: { storagePath: filePath },
  });

  return {
    reportId: saved.id,
    downloadUrl: `/api/reports/${saved.id}`,
    generatedAt: saved.generatedAt.toISOString(),
  };
}

export async function readReportFile(reportId: string): Promise<{ filePath: string; downloadName: string }> {
  const report = await getPrisma().report.findUnique({ where: { id: reportId } });
  if (!report?.storagePath) {
    throw new AppError(404, 'Report not found', 'not_found');
  }
  try {
    await fs.promises.access(report.storagePath);
  } catch {
    throw new AppError(404, 'Report file is no longer available', 'not_found');
  }
  return {
    filePath: report.storagePath,
    downloadName: `buildwise-preplanning-${report.id}.pdf`,
  };
}

function renderPdf(analysis: AnalysisResponse, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const stream = fs.createWriteStream(filePath);
    stream.on('finish', () => resolve());
    stream.on('error', reject);
    doc.on('error', reject);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text('BuildWise AI Pre-Planning Report');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(9).fillColor('#92400e').text(
      'Preliminary planning guidance only. Not structural certification, legal approval, an exact flood prediction, a soil-bearing-capacity result, or a professional cost quotation.',
      { width: 500 },
    );

    writeSection(doc, 'Site', [
      `Project: ${analysis.site.projectName ?? 'Not named'}`,
      `Location: ${analysis.site.displayName}`,
      `Coordinates: ${analysis.site.latitude.toFixed(5)}, ${analysis.site.longitude.toFixed(5)}`,
      `Building: ${analysis.site.buildingType}, ${analysis.site.floors} floor(s), ${analysis.site.qualityGrade} grade`,
      `Plot: ${analysis.site.plotAreaSqFt} sq ft; built-up per floor: ${analysis.site.builtUpAreaSqFt} sq ft`,
      `Report reference: ${analysis.id}`,
      `Generated: ${analysis.createdAt}`,
    ]);

    writeSection(doc, 'Suitability', [
      `Index: ${formatNullable(analysis.overallSuitabilityScore, ' / 100')}`,
      `Category: ${analysis.suitabilityCategory}`,
      analysis.scorePartial
        ? 'This index is partial. Missing factors were excluded and remaining documented weights were renormalized. Do not treat it as a complete five-factor score.'
        : 'All five documented factors were scored.',
      ...analysis.factors.map((factor) => `${factor.name} (${Math.round(factor.weight * 100)}%): ${formatNullable(factor.score, ' / 10')} — ${factor.rawValue}. ${factor.explanation}`),
    ]);

    writeSection(doc, 'Terrain', [
      `Elevation: ${formatNullable(analysis.terrain.elevationMeters, ' m')}`,
      `Sampled slope: ${formatNullable(analysis.terrain.slopePercentage, '%')} (${analysis.terrain.terrainType})`,
      `Sample range: ${formatNullable(analysis.terrain.minElevation, ' m')} to ${formatNullable(analysis.terrain.maxElevation, ' m')}`,
      analysis.terrain.method,
      analysis.terrain.soilInfo.disclaimer,
    ]);

    writeSection(doc, 'Water / Flood-Risk Indicator', [
      `Nearest mapped surface water: ${formatNullable(analysis.waterRisk.distanceToWaterMeters, ' m')}`,
      `Relative elevation versus that feature: ${formatNullable(analysis.waterRisk.elevationBufferMeters, ' m')}`,
      `Indicator: ${analysis.waterRisk.riskLevel}`,
      analysis.waterRisk.disclaimer,
    ]);

    writeSection(doc, 'Access, facilities, and environment', [
      `Road: ${analysis.accessibility.roadType}; distance ${formatNullable(analysis.accessibility.nearestRoadDistanceMeters, ' m')}`,
      `Nearest major road: ${formatNullable(analysis.accessibility.nearestHighwayDistanceMeters, ' m')}`,
      ...analysis.facilities.map((facility) => `${facility.facilityType}: ${facility.available ? `${facility.name}, ${facility.distanceMeters} m` : facility.name}`),
      `US AQI: ${formatNullable(analysis.environment.airQualityIndex)} (${analysis.environment.aqiCategory})`,
      `Annual rainfall: ${formatNullable(analysis.environment.annualRainfallMm, ' mm')}`,
      `Temperature range: ${formatNullable(analysis.environment.tempMinC, '°C')} to ${formatNullable(analysis.environment.tempMaxC, '°C')}`,
      `Green cover: ${formatNullable(analysis.environment.greenCoverProxyPercent, '%')}`,
    ]);

    writeSection(doc, 'Orientation', [
      `Recommended facade facing: ${analysis.orientation.recommendedCardinal}`,
      `Solar score: ${formatNullable(analysis.orientation.solarScore, ' / 10')}; wind score: ${formatNullable(analysis.orientation.windScore, ' / 10')}`,
      analysis.orientation.explanation,
      `Sunrise azimuth: ${analysis.orientation.solarPath.sunriseAzimuth}°; sunset azimuth: ${analysis.orientation.solarPath.sunsetAzimuth}°; solar-noon elevation: ${analysis.orientation.solarPath.peakElevation}°.`,
      analysis.orientation.prevailingWind.summary,
    ]);

    writeSection(doc, 'Preliminary Cost Estimate', [
      `Estimate: INR ${analysis.cost.estimatedTotalCost.toLocaleString('en-IN')}`,
      `Range: INR ${analysis.cost.rangeLow.toLocaleString('en-IN')} to INR ${analysis.cost.rangeHigh.toLocaleString('en-IN')}`,
      `Rate: INR ${analysis.cost.baseRatePerSqFt} / sq ft; quality multiplier ${analysis.cost.qualityMultiplier}; terrain multiplier ${analysis.cost.terrainMultiplier}`,
      ...analysis.cost.breakdown.map((item) => `${item.category} (${item.percentage}%): INR ${item.amount.toLocaleString('en-IN')}`),
      analysis.cost.disclaimer,
    ]);

    writeSection(doc, 'Data confidence, limitations, and sources', [
      `Confidence: ${analysis.dataConfidence.overallConfidence} (${analysis.dataConfidence.confidenceScorePercent}%). Providers with data: ${analysis.dataConfidence.providersCount}.`,
      ...analysis.risksAndLimitations.map((risk) => `• ${risk}`),
      ...analysis.sources.map((source) => `${source.provider} — ${source.dataType}. ${source.attribution}`),
    ]);

    doc.moveDown(1);
    doc.fontSize(8).fillColor('#6b7280').text('BuildWise AI. Deterministic geospatial analysis. No language-model inference was used to produce this report.');
    doc.end();
  });
}
