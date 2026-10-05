import {
  BUILDING_TYPE_MULTIPLIER,
  COST_BREAKDOWN,
  COST_DISCLAIMER,
  QUALITY_RATE_INR_PER_SQFT,
  STANDARD_RATE_INR_PER_SQFT,
} from '../config/constants';
import type { BuildingType, QualityGrade } from '../types/domain';
import { roundTo } from '../utils/geo';

export interface CostComputation {
  plotAreaSqFt: number;
  builtUpAreaSqFt: number;
  baseRatePerSqFt: number;
  terrainMultiplier: number;
  qualityMultiplier: number;
  estimatedTotalCost: number;
  rangeLow: number;
  rangeHigh: number;
  breakdown: Array<{ category: string; amount: number; percentage: number; description: string }>;
  disclaimer: string;
  terrainAdjustmentApplied: boolean;
}

export function terrainMultiplierFor(slopePercentage: number | null): { multiplier: number; applied: boolean } {
  if (slopePercentage === null) return { multiplier: 1, applied: false };
  if (slopePercentage >= 15) return { multiplier: 1.22, applied: true };
  if (slopePercentage >= 8) return { multiplier: 1.15, applied: true };
  if (slopePercentage >= 4) return { multiplier: 1.08, applied: true };
  return { multiplier: 1.02, applied: true };
}

export function estimateCost(input: {
  plotAreaSqFt: number;
  builtUpAreaSqFt: number;
  floors: number;
  buildingType: BuildingType;
  qualityGrade: QualityGrade;
  slopePercentage: number | null;
  partialData: boolean;
}): CostComputation {
  const gradeRate = QUALITY_RATE_INR_PER_SQFT[input.qualityGrade];
  const typeMultiplier = BUILDING_TYPE_MULTIPLIER[input.buildingType];
  const qualityMultiplier = roundTo(gradeRate / STANDARD_RATE_INR_PER_SQFT, 3);
  const terrain = terrainMultiplierFor(input.slopePercentage);
  const baseRatePerSqFt = Math.round(STANDARD_RATE_INR_PER_SQFT * typeMultiplier);
  const floorArea = input.builtUpAreaSqFt * input.floors;
  const estimatedTotalCost = Math.round(floorArea * baseRatePerSqFt * qualityMultiplier * terrain.multiplier);

  const lowFactor = terrain.applied && !input.partialData ? 0.92 : 0.85;
  const highFactor = terrain.applied && !input.partialData ? 1.12 : 1.22;
  const rangeLow = Math.round(estimatedTotalCost * lowFactor);
  const rangeHigh = Math.round(estimatedTotalCost * highFactor);

  let remaining = estimatedTotalCost;
  const breakdown = COST_BREAKDOWN.map((item, index) => {
    const amount = index === COST_BREAKDOWN.length - 1
      ? remaining
      : Math.round(estimatedTotalCost * (item.percentage / 100));
    remaining -= amount;
    return {
      category: item.category,
      amount,
      percentage: item.percentage,
      description: item.description,
    };
  });

  const terrainNote = terrain.applied
    ? `Terrain multiplier ${terrain.multiplier} was applied from the sampled slope.`
    : 'Terrain multiplier was not applied because slope data was unavailable.';

  return {
    plotAreaSqFt: input.plotAreaSqFt,
    builtUpAreaSqFt: input.builtUpAreaSqFt,
    baseRatePerSqFt,
    terrainMultiplier: terrain.multiplier,
    qualityMultiplier,
    estimatedTotalCost,
    rangeLow,
    rangeHigh,
    breakdown,
    terrainAdjustmentApplied: terrain.applied,
    disclaimer: `${COST_DISCLAIMER} Formula: built-up area × floors × building-type-adjusted standard rate × quality multiplier × terrain multiplier. ${terrainNote} Quality is applied once.`,
  };
}
