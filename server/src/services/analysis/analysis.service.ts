import { randomUUID } from 'node:crypto';
import { computeAccessibility } from '../../algorithms/accessibility';
import { computeConfidence } from '../../algorithms/confidence';
import { estimateCost } from '../../algorithms/cost';
import { computeEnvironment } from '../../algorithms/environment';
import { computeFacilities, type FacilityHit, type FacilityType } from '../../algorithms/facilities';
import { computeOrientation } from '../../algorithms/orientation';
import { computeTerrain, scoreSlope } from '../../algorithms/slope';
import { aggregateSuitability, documentedWeights, factorStatus } from '../../algorithms/suitability';
import { buildSynthesis } from '../../algorithms/synthesis';
import { computeWaterIndicator } from '../../algorithms/waterIndicator';
import {
  FACILITY_SEARCH_RADIUS_M,
  ROAD_SEARCH_RADIUS_M,
  SUITABILITY_WEIGHTS,
  WATER_SEARCH_RADIUS_M,
} from '../../config/constants';
import type { AnalysisRequestInput } from '../../schemas/requests';
import type { AnalysisResponse, FactorResult, OsmFeature } from '../../types/domain';
import { haversineMeters } from '../../utils/geo';
import { getElevation, elevationSamplePlan } from '../elevation/elevation.service';
import { reverseGeocode } from '../geocoding/geocoding.service';
import { getOsmContext } from '../osm/osm.service';
import { getAirQuality, getClimate, getWind } from '../weather/weather.service';
import { findRecentAnalysis, saveAnalysis } from './persistence';

const MAJOR = new Set(['motorway', 'trunk', 'primary']);
const DRIVABLE = new Set([
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'unclassified',
  'residential',
  'service',
  'living_street',
]);

function nearest(features: OsmFeature[], latitude: number, longitude: number, predicate: (feature: OsmFeature) => boolean): { feature: OsmFeature; distance: number } | null {
  let best: { feature: OsmFeature; distance: number } | null = null;
  for (const feature of features) {
    if (!predicate(feature)) continue;
    const distance = haversineMeters(latitude, longitude, feature.latitude, feature.longitude);
    if (!best || distance < best.distance) best = { feature, distance };
  }
  return best;
}

function facilityTypeOf(tags: Record<string, string>): FacilityType | null {
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return 'Hospital';
  if (tags.amenity === 'fire_station') return 'Fire Station';
  if (tags.shop === 'hardware' || tags.shop === 'doityourself') return 'Construction Depot';
  if (tags.power === 'substation') return 'Power Substation';
  if (tags.man_made === 'water_works' || tags.man_made === 'water_tower') return 'Water Supply Main';
  if (tags.amenity === 'bus_station' || tags.railway === 'station' || tags.highway === 'bus_stop') return 'Public Transit';
  return null;
}

function featureName(tags: Record<string, string>, fallback: string): string {
  return tags.name || tags.operator || `Unnamed mapped ${fallback}`;
}

function makeFactor(
  factor: FactorResult['factor'],
  name: string,
  score: number | null,
  rawValue: string,
  explanation: string,
): FactorResult {
  return {
    factor,
    name,
    score,
    weight: SUITABILITY_WEIGHTS[factor],
    rawValue,
    explanation,
    status: factorStatus(score),
    available: score !== null,
  };
}

export async function runAnalysis(input: AnalysisRequestInput): Promise<AnalysisResponse> {
  const cached = await findRecentAnalysis(input);
  if (cached) return cached;

  const [geocode, elevation, osm, climate, air, wind] = await Promise.all([
    reverseGeocode(input.latitude, input.longitude),
    getElevation(elevationSamplePlan(input.latitude, input.longitude)),
    getOsmContext(input.latitude, input.longitude),
    getClimate(input.latitude, input.longitude),
    getAirQuality(input.latitude, input.longitude),
    getWind(input.latitude, input.longitude),
  ]);

  const features = osm.features;
  const waterHit = osm.waterOk
    ? nearest(features, input.latitude, input.longitude, (feature) => feature.kind === 'water')
    : null;

  let elevationBuffer: number | null = null;
  if (elevation.available && waterHit) {
    const waterElevation = await getElevation([{
      latitude: waterHit.feature.latitude,
      longitude: waterHit.feature.longitude,
    }]);
    if (waterElevation.available) {
      elevationBuffer = elevation.center.elevationMeters - waterElevation.center.elevationMeters;
    }
  }

  const terrain = computeTerrain(
    elevation.available ? elevation.center : null,
    elevation.available ? elevation.samples.slice(1) : [],
    elevation.available ? elevation.attribution : elevation.reason,
  );
  const slopeScore = scoreSlope(terrain.slopePercentage, terrain.elevationMeters);
  const water = computeWaterIndicator({
    querySucceeded: osm.waterOk,
    distanceMeters: waterHit?.distance ?? null,
    searchRadiusMeters: WATER_SEARCH_RADIUS_M,
    elevationBufferMeters: elevationBuffer,
    reason: osm.waterOk ? undefined : osm.reason,
  });

  const roadHit = osm.roadsOk
    ? nearest(features, input.latitude, input.longitude, (feature) => feature.kind === 'road' && DRIVABLE.has(feature.tags.highway ?? ''))
    : null;
  const highwayHit = osm.roadsOk
    ? nearest(features, input.latitude, input.longitude, (feature) => MAJOR.has(feature.tags.highway ?? ''))
    : null;
  const accessibility = computeAccessibility({
    querySucceeded: osm.roadsOk,
    nearestRoadMeters: roadHit?.distance ?? null,
    nearestRoadClass: roadHit?.feature.tags.highway ?? null,
    nearestHighwayMeters: highwayHit?.distance ?? null,
    searchRadiusMeters: ROAD_SEARCH_RADIUS_M,
    reason: osm.roadsOk ? undefined : osm.reason,
  });

  const facilityHits: FacilityHit[] = [];
  if (osm.facilitiesOk) {
    for (const feature of features) {
      const facilityType = facilityTypeOf(feature.tags);
      if (!facilityType) continue;
      facilityHits.push({
        facilityType,
        distanceMeters: haversineMeters(input.latitude, input.longitude, feature.latitude, feature.longitude),
        name: featureName(feature.tags, facilityType.toLowerCase()),
      });
    }
  }
  const facilities = computeFacilities({
    querySucceeded: osm.facilitiesOk,
    hits: facilityHits,
    searchRadiusMeters: FACILITY_SEARCH_RADIUS_M,
    reason: osm.facilitiesOk ? undefined : osm.reason,
  });

  const environment = computeEnvironment({
    airQualityIndex: air.available ? air.usAqi : null,
    annualRainfallMm: climate.available ? climate.annualRainfallMm : null,
    tempMinC: climate.available ? climate.tempMinC : null,
    tempMaxC: climate.available ? climate.tempMaxC : null,
    climateYear: climate.available ? climate.year : null,
  });

  const factors: FactorResult[] = [
    makeFactor('slope', 'Terrain & Slope', slopeScore.score, slopeScore.rawValue, slopeScore.explanation),
    makeFactor('water', 'Water / Flood-Risk Indicator', water.indicatorScore, water.rawValue, water.explanation),
    makeFactor('accessibility', 'Road Network Accessibility', accessibility.accessibilityScore, accessibility.rawValue, accessibility.explanation),
    makeFactor('facilities', 'Essential Facilities Proximity', facilities.score, facilities.rawValue, facilities.explanation),
    makeFactor('environment', 'Environmental Quality', environment.environmentalScore, environment.rawValue, environment.explanation),
  ];

  const suitability = aggregateSuitability(factors.map((factor) => ({
    factor: factor.factor,
    score: factor.score,
    weight: documentedWeights()[factor.factor],
  })));

  const orientation = computeOrientation({
    latitude: input.latitude,
    longitude: input.longitude,
    windFromDegrees: wind.available ? wind.directionDegrees : null,
    windSpeedKmH: wind.available ? wind.meanDailyMaxSpeedKmH : null,
    windSampleDays: wind.available ? wind.sampleDays : null,
  });

  const cost = estimateCost({
    plotAreaSqFt: input.plotAreaSqFt,
    builtUpAreaSqFt: input.builtUpAreaSqFt,
    floors: input.floors,
    buildingType: input.buildingType,
    qualityGrade: input.qualityGrade,
    slopePercentage: terrain.slopePercentage,
    partialData: suitability.partial,
  });

  const confidence = computeConfidence({
    elevation: elevation.available && terrain.slopePercentage !== null,
    osmWater: osm.waterOk,
    osmRoads: osm.roadsOk,
    osmFacilities: osm.facilitiesOk,
    climate: climate.available,
    airQuality: air.available,
    wind: wind.available,
    geocoding: geocode !== null,
    extraMissing: [
      'Mapped canopy percentage was not calculated.',
      ...(!osm.waterOk ? ['Mapped surface-water query did not succeed.'] : []),
      ...(!osm.roadsOk ? ['Mapped road query did not succeed.'] : []),
      ...(!osm.facilitiesOk ? ['Mapped facilities query did not succeed.'] : []),
    ],
  });

  const fetchedAt = new Date().toISOString();
  const sources: AnalysisResponse['sources'] = [
    {
      provider: 'SunCalc',
      dataType: 'Solar azimuth and elevation',
      attribution: 'SunCalc astronomical calculation. Local time is approximated from longitude.',
      lastUpdated: fetchedAt.slice(0, 10),
    },
  ];
  if (elevation.available) {
    sources.unshift({
      provider: elevation.source,
      dataType: 'Elevation samples and derived slope',
      attribution: elevation.attribution,
      lastUpdated: fetchedAt.slice(0, 10),
    });
  }
  if (osm.waterOk || osm.roadsOk || osm.facilitiesOk) {
    sources.push({
      provider: 'OpenStreetMap / Overpass',
      dataType: 'Mapped water, roads, and facilities',
      attribution: osm.attribution,
      lastUpdated: fetchedAt.slice(0, 10),
    });
  }
  if (climate.available) {
    sources.push({
      provider: climate.source,
      dataType: `Daily climate archive for ${climate.year}`,
      attribution: climate.attribution,
      lastUpdated: fetchedAt.slice(0, 10),
    });
  }
  if (air.available) {
    sources.push({
      provider: air.source,
      dataType: 'Current US AQI',
      attribution: air.attribution,
      lastUpdated: fetchedAt.slice(0, 10),
    });
  }
  if (wind.available) {
    sources.push({
      provider: wind.source,
      dataType: 'Recent dominant wind direction',
      attribution: wind.attribution,
      lastUpdated: fetchedAt.slice(0, 10),
    });
  }
  if (geocode) {
    sources.push({
      provider: geocode.source,
      dataType: 'Place name',
      attribution: geocode.attribution,
      lastUpdated: fetchedAt.slice(0, 10),
    });
  }

  const risks = [
    ...confidence.missingDataPoints,
    water.disclaimer,
    cost.disclaimer,
    suitability.explanation,
  ];
  if (input.builtUpAreaSqFt > input.plotAreaSqFt * 0.75) {
    risks.push('The built-up footprint is a large share of the plot. Coverage and setbacks must be checked locally; this service does not do that.');
  }

  const displayName = input.locationName
    || geocode?.displayName
    || `Site at ${input.latitude.toFixed(4)}°, ${input.longitude.toFixed(4)}°`;

  const analysis: AnalysisResponse = {
    id: randomUUID(),
    createdAt: fetchedAt,
    site: {
      latitude: input.latitude,
      longitude: input.longitude,
      displayName,
      buildingType: input.buildingType,
      plotAreaSqFt: input.plotAreaSqFt,
      builtUpAreaSqFt: input.builtUpAreaSqFt,
      floors: input.floors,
      qualityGrade: input.qualityGrade,
      ...(input.budget !== undefined ? { budget: input.budget } : {}),
      ...(input.projectName ? { projectName: input.projectName } : {}),
    },
    overallSuitabilityScore: suitability.overallScore,
    suitabilityCategory: suitability.category,
    scorePartial: suitability.partial,
    factors,
    terrain,
    waterRisk: {
      distanceToWaterMeters: water.distanceToWaterMeters,
      elevationBufferMeters: water.elevationBufferMeters,
      riskLevel: water.riskLevel,
      indicatorScore: water.indicatorScore,
      disclaimer: water.disclaimer,
    },
    accessibility: {
      nearestRoadDistanceMeters: accessibility.nearestRoadDistanceMeters,
      roadType: accessibility.roadType,
      accessibilityScore: accessibility.accessibilityScore,
      nearestHighwayDistanceMeters: accessibility.nearestHighwayDistanceMeters,
    },
    facilities: facilities.facilities,
    environment: {
      airQualityIndex: environment.airQualityIndex,
      aqiCategory: environment.aqiCategory,
      annualRainfallMm: environment.annualRainfallMm,
      tempMinC: environment.tempMinC,
      tempMaxC: environment.tempMaxC,
      greenCoverProxyPercent: environment.greenCoverProxyPercent,
      environmentalScore: environment.environmentalScore,
    },
    orientation,
    cost,
    dataConfidence: confidence,
    sources,
    risksAndLimitations: risks,
    aiSynthesis: {
      summary: '',
      architecturalRecommendations: [],
      sustainabilityNotes: [],
      engineNotice: '',
    },
  };
  analysis.aiSynthesis = buildSynthesis(analysis);

  await saveAnalysis(input, analysis);
  return analysis;
}
