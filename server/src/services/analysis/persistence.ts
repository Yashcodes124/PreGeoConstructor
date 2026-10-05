import { Prisma } from '../../../../generated/prisma/client';
import type { AnalysisRequestInput } from '../../schemas/requests';
import type { AnalysisResponse } from '../../types/domain';
import { AppError } from '../../utils/errors';
import { getPrisma } from '../db';

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function isAnalysisResponse(value: unknown): value is AnalysisResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<AnalysisResponse>;
  return typeof record.id === 'string' && typeof record.createdAt === 'string' && !!record.site && Array.isArray(record.factors);
}

export async function findRecentAnalysis(input: AnalysisRequestInput): Promise<AnalysisResponse | null> {
  const epsilon = 0.0002;
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const row = await getPrisma().analysis.findFirst({
    where: {
      createdAt: { gte: since },
      site: {
        latitude: { gte: input.latitude - epsilon, lte: input.latitude + epsilon },
        longitude: { gte: input.longitude - epsilon, lte: input.longitude + epsilon },
        buildingType: input.buildingType,
        floors: input.floors,
        qualityGrade: input.qualityGrade,
        plotAreaSqFt: input.plotAreaSqFt,
        builtUpAreaSqFt: input.builtUpAreaSqFt,
        budget: input.budget ?? null,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!row || !isAnalysisResponse(row.normalizedData)) return null;
  return row.normalizedData;
}

export async function saveAnalysis(input: AnalysisRequestInput, analysis: AnalysisResponse): Promise<void> {
  await getPrisma().site.create({
    data: {
      label: analysis.site.displayName,
      latitude: input.latitude,
      longitude: input.longitude,
      plotAreaSqFt: input.plotAreaSqFt,
      builtUpAreaSqFt: input.builtUpAreaSqFt,
      buildingType: input.buildingType,
      floors: input.floors,
      qualityGrade: input.qualityGrade,
      budget: input.budget ?? null,
      analyses: {
        create: {
          id: analysis.id,
          overallScore: analysis.overallSuitabilityScore,
          dataConfidence: analysis.dataConfidence.confidenceScorePercent,
          normalizedData: toJson(analysis),
          createdAt: new Date(analysis.createdAt),
          factors: {
            create: analysis.factors.map((factor) => ({
              factor: factor.factor,
              rawValue: factor.rawValue,
              score: factor.score,
              weight: factor.weight,
              explanation: factor.explanation,
            })),
          },
          orientation: {
            create: {
              recommendedAngle: analysis.orientation.recommendedAngle,
              solarScore: analysis.orientation.solarScore,
              windScore: analysis.orientation.windScore,
              candidateScores: toJson(analysis.orientation.candidateScores),
            },
          },
          costEstimate: {
            create: {
              area: analysis.site.builtUpAreaSqFt * analysis.site.floors,
              baseRate: analysis.cost.baseRatePerSqFt,
              terrainMultiplier: analysis.cost.terrainMultiplier,
              qualityMultiplier: analysis.cost.qualityMultiplier,
              estimatedCost: analysis.cost.estimatedTotalCost,
              rangeLow: analysis.cost.rangeLow,
              rangeHigh: analysis.cost.rangeHigh,
            },
          },
        },
      },
    },
  });
}

export async function getStoredAnalysis(id: string): Promise<AnalysisResponse> {
  const row = await getPrisma().analysis.findUnique({ where: { id } });
  if (!row || !isAnalysisResponse(row.normalizedData)) {
    throw new AppError(404, 'Analysis not found', 'not_found');
  }
  return row.normalizedData;
}
