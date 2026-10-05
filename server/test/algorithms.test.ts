import { describe, expect, it } from 'vitest';
import { computeAccessibility } from '../src/algorithms/accessibility';
import { estimateCost } from '../src/algorithms/cost';
import { computeEnvironment } from '../src/algorithms/environment';
import { computeFacilities } from '../src/algorithms/facilities';
import { scoreFacadeSolar, solarPathFor, suncalcAzimuthToCompass } from '../src/algorithms/orientation';
import { computeTerrain, scoreSlope } from '../src/algorithms/slope';
import { aggregateSuitability } from '../src/algorithms/suitability';
import { computeConfidence } from '../src/algorithms/confidence';
import { computeWaterIndicator } from '../src/algorithms/waterIndicator';

describe('slope', () => {
  it('calculates steepest rise over run and does not invent elevation', () => {
    const missing = computeTerrain(null, [], 'missing');
    expect(missing.elevationMeters).toBeNull();
    expect(missing.slopePercentage).toBeNull();
    expect(scoreSlope(null, null).score).toBeNull();

    const terrain = computeTerrain(
      { latitude: 12.97, longitude: 77.59, elevationMeters: 900 },
      [
        { latitude: 12.9708, longitude: 77.59, elevationMeters: 909 },
        { latitude: 12.9692, longitude: 77.59, elevationMeters: 900 },
      ],
      'fixture',
    );
    expect(terrain.elevationMeters).toBe(900);
    expect(terrain.slopePercentage).not.toBeNull();
    expect(terrain.slopePercentage!).toBeGreaterThan(5);
    expect(terrain.soilInfo.available).toBe(false);
  });
});

describe('water indicator', () => {
  it('does not treat proximity as an exact flood prediction', () => {
    const failed = computeWaterIndicator({
      querySucceeded: false,
      distanceMeters: null,
      searchRadiusMeters: 2000,
      elevationBufferMeters: null,
    });
    expect(failed.indicatorScore).toBeNull();
    expect(failed.riskLevel).toBe('Unavailable');

    const near = computeWaterIndicator({
      querySucceeded: true,
      distanceMeters: 80,
      searchRadiusMeters: 2000,
      elevationBufferMeters: 0.4,
    });
    expect(near.riskLevel).toBe('High Risk');
    expect(near.disclaimer.toLowerCase()).not.toContain('exact flood');
    expect(near.disclaimer.toLowerCase()).toContain('not a hydrodynamic flood model');
  });
});

describe('accessibility and facilities', () => {
  it('reports absence without a fabricated distance', () => {
    const access = computeAccessibility({
      querySucceeded: true,
      nearestRoadMeters: null,
      nearestRoadClass: null,
      nearestHighwayMeters: null,
      searchRadiusMeters: 1500,
    });
    expect(access.nearestRoadDistanceMeters).toBeNull();
    expect(access.rawValue).toContain('No mapped road');

    const facilities = computeFacilities({
      querySucceeded: false,
      hits: [],
      searchRadiusMeters: 6000,
    });
    expect(facilities.score).toBeNull();
    expect(facilities.facilities.every((item) => item.distanceMeters === null)).toBe(true);
  });
});

describe('environment', () => {
  it('does not invent rainfall or green cover', () => {
    const result = computeEnvironment({
      airQualityIndex: 42,
      annualRainfallMm: null,
      tempMinC: null,
      tempMaxC: null,
      climateYear: null,
    });
    expect(result.annualRainfallMm).toBeNull();
    expect(result.greenCoverProxyPercent).toBeNull();
    expect(result.aqiCategory).toBe('Good');
    expect(result.environmentalScore).not.toBeNull();
  });
});

describe('suitability', () => {
  it('uses documented weights and renormalizes only available factors', () => {
    const complete = aggregateSuitability([
      { factor: 'slope', score: 8, weight: 0.25 },
      { factor: 'water', score: 8, weight: 0.2 },
      { factor: 'accessibility', score: 8, weight: 0.2 },
      { factor: 'environment', score: 8, weight: 0.15 },
      { factor: 'facilities', score: 8, weight: 0.2 },
    ]);
    expect(complete.overallScore).toBe(80);
    expect(complete.partial).toBe(false);

    const thin = aggregateSuitability([
      { factor: 'slope', score: 10, weight: 0.25 },
      { factor: 'water', score: null, weight: 0.2 },
      { factor: 'accessibility', score: null, weight: 0.2 },
      { factor: 'environment', score: null, weight: 0.15 },
      { factor: 'facilities', score: null, weight: 0.2 },
    ]);
    expect(thin.overallScore).toBeNull();
    expect(thin.category).toBe('Insufficient Data');
    expect(thin.explanation).toContain('not imputed');

    const partial = aggregateSuitability([
      { factor: 'slope', score: 8, weight: 0.25 },
      { factor: 'water', score: 8, weight: 0.2 },
      { factor: 'accessibility', score: 8, weight: 0.2 },
      { factor: 'environment', score: null, weight: 0.15 },
      { factor: 'facilities', score: null, weight: 0.2 },
    ]);
    expect(partial.overallScore).toBe(80);
    expect(partial.partial).toBe(true);
    expect(partial.explanation).toContain('renormalized');
  });
});

describe('orientation', () => {
  it('places Bengaluru equinox sunrise toward the east and penalizes west facades', () => {
    const path = solarPathFor(12.9716, 77.5946, new Date(Date.UTC(2026, 2, 21, 1, 0)));
    expect(path.sunriseAzimuth).toBeGreaterThan(60);
    expect(path.sunriseAzimuth).toBeLessThan(120);
    expect(path.peakElevation).toBeGreaterThan(40);

    const north = scoreFacadeSolar(12.9716, 77.5946, 0);
    const west = scoreFacadeSolar(12.9716, 77.5946, 270);
    expect(north).toBeGreaterThan(west);

    const compass = suncalcAzimuthToCompass(0);
    expect(compass).toBe(180);
  });
});

describe('confidence', () => {
  it('does not mark confidence high when mapped roads or facilities are missing', () => {
    const result = computeConfidence({
      elevation: true,
      osmWater: true,
      osmRoads: false,
      osmFacilities: false,
      climate: true,
      airQuality: true,
      wind: true,
      geocoding: true,
      extraMissing: [],
    });
    expect(result.overallConfidence).not.toBe('High');
    expect(result.confidenceScorePercent).toBeLessThan(100);
    expect(result.missingDataPoints.join(' ')).toContain('Mapped roads');
  });
});

describe('cost', () => {
  it('applies quality once and widens the range when slope is missing', () => {
    const withSlope = estimateCost({
      plotAreaSqFt: 2400,
      builtUpAreaSqFt: 1800,
      floors: 2,
      buildingType: 'residential',
      qualityGrade: 'luxury',
      slopePercentage: 2,
      partialData: false,
    });
    const expected = Math.round(1800 * 2 * 2200 * withSlope.qualityMultiplier * 1.02);
    expect(withSlope.estimatedTotalCost).toBe(expected);
    expect(withSlope.qualityMultiplier).toBeCloseTo(4800 / 2200, 3);
    expect(withSlope.breakdown.reduce((sum, item) => sum + item.amount, 0)).toBe(withSlope.estimatedTotalCost);
    expect(withSlope.disclaimer).toContain('Preliminary Cost Estimate');

    const missingSlope = estimateCost({
      plotAreaSqFt: 2400,
      builtUpAreaSqFt: 1800,
      floors: 2,
      buildingType: 'residential',
      qualityGrade: 'standard',
      slopePercentage: null,
      partialData: true,
    });
    expect(missingSlope.terrainMultiplier).toBe(1);
    expect(missingSlope.terrainAdjustmentApplied).toBe(false);
    expect(missingSlope.rangeHigh / missingSlope.estimatedTotalCost).toBeGreaterThan(1.15);
  });
});
