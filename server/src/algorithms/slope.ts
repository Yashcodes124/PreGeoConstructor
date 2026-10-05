import { SOIL_DISCLAIMER } from '../config/constants';
import type { ElevationSample } from '../types/domain';
import { haversineMeters, roundTo } from '../utils/geo';

export interface TerrainComputation {
  elevationMeters: number | null;
  slopePercentage: number | null;
  minElevation: number | null;
  maxElevation: number | null;
  terrainType: string;
  method: string;
  soilInfo: { available: false; disclaimer: string };
}

export function terrainTypeFromSlope(slopePercentage: number | null): string {
  if (slopePercentage === null) return 'Unavailable';
  if (slopePercentage < 3) return 'Flat / Gentle';
  if (slopePercentage < 8) return 'Moderate Slope';
  if (slopePercentage < 15) return 'Steep Slope';
  return 'Rugged Terrain';
}

/**
 * Slope is the steepest rise/run among center-to-neighbor DEM samples.
 * It is a planning approximation at the provider's resolution, not a survey.
 */
export function computeTerrain(
  center: ElevationSample | null,
  neighbors: ElevationSample[],
  method: string,
): TerrainComputation {
  if (!center) {
    return {
      elevationMeters: null,
      slopePercentage: null,
      minElevation: null,
      maxElevation: null,
      terrainType: 'Unavailable',
      method,
      soilInfo: { available: false, disclaimer: SOIL_DISCLAIMER },
    };
  }

  const elevations = [center, ...neighbors].map((sample) => sample.elevationMeters);
  let steepest: number | null = null;
  for (const neighbor of neighbors) {
    const run = haversineMeters(center.latitude, center.longitude, neighbor.latitude, neighbor.longitude);
    if (run < 10) continue;
    const slope = (Math.abs(neighbor.elevationMeters - center.elevationMeters) / run) * 100;
    steepest = steepest === null ? slope : Math.max(steepest, slope);
  }

  const slopePercentage = steepest === null ? null : roundTo(steepest, 1);
  return {
    elevationMeters: roundTo(center.elevationMeters, 1),
    slopePercentage,
    minElevation: roundTo(Math.min(...elevations), 1),
    maxElevation: roundTo(Math.max(...elevations), 1),
    terrainType: terrainTypeFromSlope(slopePercentage),
    method,
    soilInfo: { available: false, disclaimer: SOIL_DISCLAIMER },
  };
}

export function scoreSlope(slopePercentage: number | null, elevationMeters: number | null): {
  score: number | null;
  rawValue: string;
  explanation: string;
} {
  if (slopePercentage === null) {
    return {
      score: null,
      rawValue: elevationMeters === null ? 'Unavailable' : `${elevationMeters} m elevation; slope unavailable`,
      explanation:
        'Slope was not scored because a usable elevation sample set was unavailable. No slope value was imputed.',
    };
  }

  let score = 9.2;
  let explanation = 'Sampled slope is gentle. This reduces likely earthwork but is not a foundation recommendation.';
  if (slopePercentage >= 15) {
    score = 3.2;
    explanation = 'Sampled slope is steep. Expect substantial earthwork and a site-specific engineering review. This is not a stability certification.';
  } else if (slopePercentage >= 8) {
    score = 5.4;
    explanation = 'Sampled slope is moderately steep. Grading and foundation design need engineering review.';
  } else if (slopePercentage >= 5) {
    score = 7.0;
    explanation = 'Sampled slope is moderate. Some earthwork is likely. This is not construction approval.';
  } else if (slopePercentage >= 3) {
    score = 8.4;
    explanation = 'Sampled slope is gentle to moderate and usually workable, subject to site investigation.';
  }

  const elevationText = elevationMeters === null ? '' : `, center elevation ${elevationMeters} m`;
  return {
    score,
    rawValue: `${slopePercentage}% slope${elevationText}`,
    explanation,
  };
}
