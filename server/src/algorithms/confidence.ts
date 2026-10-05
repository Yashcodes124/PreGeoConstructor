import { INHERENT_LIMITATIONS } from '../config/constants';

export interface ConfidenceInput {
  elevation: boolean;
  osmWater: boolean;
  osmRoads: boolean;
  osmFacilities: boolean;
  climate: boolean;
  airQuality: boolean;
  wind: boolean;
  geocoding: boolean;
  extraMissing: string[];
}

export interface ConfidenceResult {
  overallConfidence: 'High' | 'Medium' | 'Low';
  confidenceScorePercent: number;
  providersCount: number;
  missingDataPoints: string[];
}

const CHECKS: Array<{ key: keyof Omit<ConfidenceInput, 'extraMissing'>; label: string; weight: number }> = [
  { key: 'elevation', label: 'Elevation samples for slope', weight: 25 },
  { key: 'osmWater', label: 'Mapped surface water', weight: 10 },
  { key: 'osmRoads', label: 'Mapped roads', weight: 10 },
  { key: 'osmFacilities', label: 'Mapped facilities', weight: 10 },
  { key: 'climate', label: 'Annual climate archive', weight: 15 },
  { key: 'airQuality', label: 'Current air quality', weight: 10 },
  { key: 'wind', label: 'Recent wind direction', weight: 10 },
  { key: 'geocoding', label: 'Reverse geocoded place name', weight: 5 },
];

export function computeConfidence(input: ConfidenceInput): ConfidenceResult {
  let score = 5; // solar geometry is local and always computed for valid coordinates
  let providersCount = 1;
  const missing: string[] = [...INHERENT_LIMITATIONS];

  for (const check of CHECKS) {
    if (input[check.key]) {
      score += check.weight;
      providersCount += 1;
    } else {
      missing.push(`${check.label} was unavailable and was not imputed.`);
    }
  }

  for (const item of input.extraMissing) {
    missing.push(item);
  }

  const confidenceScorePercent = Math.round(Math.min(100, score));
  let overallConfidence: ConfidenceResult['overallConfidence'] = 'Low';
  if (
    confidenceScorePercent >= 80
    && input.elevation
    && input.osmWater
    && input.osmRoads
    && input.osmFacilities
  ) {
    overallConfidence = 'High';
  }
  else if (confidenceScorePercent >= 55) overallConfidence = 'Medium';

  return {
    overallConfidence,
    confidenceScorePercent,
    providersCount,
    missingDataPoints: missing,
  };
}
