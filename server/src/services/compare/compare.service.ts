import type { AnalysisResponse } from '../../types/domain';
import { roundTo } from '../../utils/geo';
import { getStoredAnalysis } from '../analysis/persistence';

export interface CompareResult {
  siteA: AnalysisResponse;
  siteB: AnalysisResponse;
  winnerSiteId?: string;
  summary: string;
  factorComparison: Array<{
    factor: string;
    scoreA: number | null;
    scoreB: number | null;
    difference: number | null;
    better: 'A' | 'B' | 'Equal' | 'Unavailable';
  }>;
  costComparison: {
    costA: number;
    costB: number;
    difference: number;
    note: string;
  };
}

export async function compareStoredAnalyses(analysisIdA: string, analysisIdB: string): Promise<CompareResult> {
  const [siteA, siteB] = await Promise.all([
    getStoredAnalysis(analysisIdA),
    getStoredAnalysis(analysisIdB),
  ]);

  const factorComparison = siteA.factors.map((factorA) => {
    const factorB = siteB.factors.find((factor) => factor.factor === factorA.factor);
    if (!factorB || factorA.score === null || factorB.score === null) {
      return {
        factor: factorA.name,
        scoreA: factorA.score,
        scoreB: factorB?.score ?? null,
        difference: null,
        better: 'Unavailable' as const,
      };
    }
    const difference = roundTo(factorA.score - factorB.score, 1);
    let better: 'A' | 'B' | 'Equal' = 'Equal';
    if (difference > 0.2) better = 'A';
    else if (difference < -0.2) better = 'B';
    return {
      factor: factorA.name,
      scoreA: factorA.score,
      scoreB: factorB.score,
      difference,
      better,
    };
  });

  const scoreA = siteA.overallSuitabilityScore;
  const scoreB = siteB.overallSuitabilityScore;
  let winnerSiteId: string | undefined;
  let summary = 'Both analyses are shown for comparison. A higher index is not a universal recommendation, a legal approval, or an engineering certification.';
  if (scoreA !== null && scoreB !== null) {
    const delta = scoreA - scoreB;
    if (Math.abs(delta) >= 3) {
      winnerSiteId = delta > 0 ? siteA.id : siteB.id;
      const leader = delta > 0 ? 'A' : 'B';
      summary = `Site ${leader} has a higher suitability index (${Math.max(scoreA, scoreB)} vs ${Math.min(scoreA, scoreB)}) on the factors that could be scored. This is a score comparison only, not a professional site recommendation.`;
    } else {
      summary = `The suitability indexes are close (${scoreA} vs ${scoreB}). Neither site is declared a winner. Read factor availability and data confidence before preferring one location.`;
    }
  } else {
    summary = 'One or both overall indexes are unavailable because provider data was incomplete. Missing values were not filled in for this comparison.';
  }

  return {
    siteA,
    siteB,
    ...(winnerSiteId ? { winnerSiteId } : {}),
    summary,
    factorComparison,
    costComparison: {
      costA: siteA.cost.estimatedTotalCost,
      costB: siteB.cost.estimatedTotalCost,
      difference: siteA.cost.estimatedTotalCost - siteB.cost.estimatedTotalCost,
      note: 'Cost difference is between two preliminary estimates. It is not a tender comparison.',
    },
  };
}
