import { SUITABILITY_WEIGHTS, type SuitabilityFactor } from '../config/constants';
import type { FactorStatus, SuitabilityCategory } from '../types/domain';
import { roundTo } from '../utils/geo';

export function factorStatus(score: number | null): FactorStatus {
  if (score === null) return 'unavailable';
  if (score >= 8) return 'optimal';
  if (score >= 6) return 'moderate';
  return 'warning';
}

export function suitabilityCategory(score: number | null): SuitabilityCategory {
  if (score === null) return 'Insufficient Data';
  if (score >= 82) return 'Highly Suitable';
  if (score >= 68) return 'Moderately Suitable';
  if (score >= 50) return 'Challenging Site';
  return 'High Constraint';
}

export interface WeightedFactor {
  factor: SuitabilityFactor;
  score: number | null;
  weight: number;
}

export interface SuitabilityAggregate {
  overallScore: number | null;
  category: SuitabilityCategory;
  partial: boolean;
  usedWeight: number;
  explanation: string;
}

/**
 * Available factor scores stay on a 0–10 scale. Their documented weights are
 * renormalized to sum to 1. Missing factors are excluded, never imputed.
 * The result is multiplied by 10 to produce 0–100.
 */
export function aggregateSuitability(factors: WeightedFactor[]): SuitabilityAggregate {
  const available = factors.filter((factor): factor is WeightedFactor & { score: number } => factor.score !== null);
  if (available.length === 0) {
    return {
      overallScore: null,
      category: 'Insufficient Data',
      partial: true,
      usedWeight: 0,
      explanation: 'No suitability factors could be scored from available provider data. An overall score was not invented.',
    };
  }

  const usedWeight = available.reduce((sum, factor) => sum + factor.weight, 0);
  const weightedTen = available.reduce((sum, factor) => sum + factor.score * (factor.weight / usedWeight), 0);
  const partial = available.length < factors.length;
  const missing = factors.filter((factor) => factor.score === null).map((factor) => factor.factor);
  const enoughEvidence = usedWeight >= 0.6 && available.length >= 3;
  if (!enoughEvidence) {
    return {
      overallScore: null,
      category: 'Insufficient Data',
      partial: true,
      usedWeight: roundTo(usedWeight, 2),
      explanation: `Not enough scored factors to publish an overall index (${Math.round(usedWeight * 100)}% of documented weight). Available factor scores are shown individually. Missing and not imputed: ${missing.join(', ') || 'none'}.`,
    };
  }
  const overallScore = Math.round(clampScore(weightedTen * 10));

  return {
    overallScore,
    category: suitabilityCategory(overallScore),
    partial,
    usedWeight: roundTo(usedWeight, 2),
    explanation: partial
      ? `Partial index. Weights were renormalized over available factors (${Math.round(usedWeight * 100)}% of the documented weight). Missing and not imputed: ${missing.join(', ')}.`
      : 'Complete five-factor index using the documented weights.',
  };
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function documentedWeights(): Record<SuitabilityFactor, number> {
  return { ...SUITABILITY_WEIGHTS };
}
