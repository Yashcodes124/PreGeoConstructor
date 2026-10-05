export type BuildingType = 'residential' | 'commercial' | 'industrial' | 'institutional';
export type QualityGrade = 'economy' | 'standard' | 'premium' | 'luxury';
export type FactorKey = 'slope' | 'water' | 'accessibility' | 'environment' | 'facilities';
export type FactorStatus = 'optimal' | 'moderate' | 'warning' | 'unavailable';
export type SuitabilityCategory =
  | 'Highly Suitable'
  | 'Moderately Suitable'
  | 'Challenging Site'
  | 'High Constraint'
  | 'Insufficient Data';

export interface LocationResult {
  displayName: string;
  latitude: number;
  longitude: number;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  source: string;
  attribution: string;
}

export interface ElevationSample {
  latitude: number;
  longitude: number;
  elevationMeters: number;
}

export interface ElevationDataset {
  available: true;
  source: string;
  attribution: string;
  samples: ElevationSample[];
  center: ElevationSample;
}

export interface UnavailableDataset {
  available: false;
  source: string;
  reason: string;
}

export type ElevationResult = ElevationDataset | UnavailableDataset;

export interface OsmFeature {
  id: number;
  latitude: number;
  longitude: number;
  tags: Record<string, string>;
  kind: 'water' | 'road' | 'facility' | 'green';
}

export interface OsmDataset {
  available: true;
  source: string;
  attribution: string;
  features: OsmFeature[];
  searchedAt: string;
}

export type OsmResult = OsmDataset | UnavailableDataset;

export interface ClimateDataset {
  available: true;
  source: string;
  attribution: string;
  year: number;
  annualRainfallMm: number;
  tempMinC: number;
  tempMaxC: number;
}

export type ClimateResult = ClimateDataset | UnavailableDataset;

export interface AirQualityDataset {
  available: true;
  source: string;
  attribution: string;
  usAqi: number;
}

export type AirQualityResult = AirQualityDataset | UnavailableDataset;

export interface WindDataset {
  available: true;
  source: string;
  attribution: string;
  directionDegrees: number;
  meanDailyMaxSpeedKmH: number;
  sampleDays: number;
}

export type WindResult = WindDataset | UnavailableDataset;

export interface FactorResult {
  factor: FactorKey;
  name: string;
  score: number | null;
  weight: number;
  rawValue: string;
  explanation: string;
  status: FactorStatus;
  available: boolean;
}

export interface AnalysisResponse {
  id: string;
  createdAt: string;
  site: {
    latitude: number;
    longitude: number;
    displayName: string;
    buildingType: BuildingType;
    plotAreaSqFt: number;
    builtUpAreaSqFt: number;
    floors: number;
    qualityGrade: QualityGrade;
    budget?: number;
    projectName?: string;
  };
  overallSuitabilityScore: number | null;
  suitabilityCategory: SuitabilityCategory;
  scorePartial: boolean;
  factors: FactorResult[];
  terrain: {
    elevationMeters: number | null;
    slopePercentage: number | null;
    minElevation: number | null;
    maxElevation: number | null;
    terrainType: string;
    soilInfo: { available: false; disclaimer: string };
    method: string;
  };
  waterRisk: {
    distanceToWaterMeters: number | null;
    elevationBufferMeters: number | null;
    riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Unavailable';
    indicatorScore: number | null;
    disclaimer: string;
  };
  accessibility: {
    nearestRoadDistanceMeters: number | null;
    roadType: string;
    accessibilityScore: number | null;
    nearestHighwayDistanceMeters: number | null;
  };
  facilities: Array<{
    facilityType: 'Hospital' | 'Fire Station' | 'Construction Depot' | 'Power Substation' | 'Water Supply Main' | 'Public Transit';
    distanceMeters: number | null;
    name: string;
    available: boolean;
  }>;
  environment: {
    airQualityIndex: number | null;
    aqiCategory: 'Good' | 'Moderate' | 'Unhealthy' | 'Poor' | 'Unavailable';
    annualRainfallMm: number | null;
    tempMinC: number | null;
    tempMaxC: number | null;
    greenCoverProxyPercent: number | null;
    environmentalScore: number | null;
  };
  orientation: {
    recommendedAngle: number;
    recommendedCardinal: string;
    solarScore: number | null;
    windScore: number | null;
    candidateScores: Array<{
      angle: number;
      label: string;
      solarScore: number;
      windScore: number | null;
      overallScore: number;
    }>;
    explanation: string;
    solarPath: {
      sunriseAzimuth: number;
      sunsetAzimuth: number;
      peakElevation: number;
    };
    prevailingWind: {
      direction: string;
      avgSpeedKmH: number | null;
      summary: string;
    };
  };
  cost: {
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
  };
  dataConfidence: {
    overallConfidence: 'High' | 'Medium' | 'Low';
    confidenceScorePercent: number;
    providersCount: number;
    missingDataPoints: string[];
  };
  sources: Array<{
    provider: string;
    dataType: string;
    attribution: string;
    lastUpdated: string;
  }>;
  risksAndLimitations: string[];
  aiSynthesis: {
    summary: string;
    architecturalRecommendations: string[];
    sustainabilityNotes: string[];
    engineNotice: string;
  };
}
