export type BuildingType = 'residential' | 'commercial' | 'industrial' | 'institutional';
export type QualityGrade = 'economy' | 'standard' | 'premium' | 'luxury';

export interface LocationSearchResult {
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
}

export interface AnalysisRequest {
  latitude: number;
  longitude: number;
  buildingType: BuildingType;
  plotAreaSqFt: number;
  builtUpAreaSqFt: number;
  floors: number;
  qualityGrade: QualityGrade;
  budget?: number;
  projectName?: string;
  locationName?: string;
}

export interface FactorResult {
  factor: 'slope' | 'water' | 'accessibility' | 'environment' | 'facilities';
  name: string;
  score: number | null;
  weight: number;
  rawValue: string | number;
  explanation: string;
  status: 'optimal' | 'moderate' | 'warning' | 'unavailable';
  available?: boolean;
}

export interface TerrainAnalysis {
  elevationMeters: number | null;
  slopePercentage: number | null;
  minElevation: number | null;
  maxElevation: number | null;
  terrainType: string;
  soilInfo: {
    available: boolean;
    type?: string;
    disclaimer: string;
  };
}

export interface WaterRiskIndicator {
  distanceToWaterMeters: number | null;
  elevationBufferMeters: number | null;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Unavailable';
  indicatorScore: number | null;
  disclaimer: string;
}

export interface AccessibilityAnalysis {
  nearestRoadDistanceMeters: number | null;
  roadType: string;
  accessibilityScore: number | null;
  nearestHighwayDistanceMeters: number | null;
}

export interface FacilityDistance {
  facilityType: 'Hospital' | 'Fire Station' | 'Construction Depot' | 'Power Substation' | 'Water Supply Main' | 'Public Transit';
  distanceMeters: number | null;
  name: string;
  available?: boolean;
}

export interface EnvironmentalAnalysis {
  airQualityIndex: number | null;
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy' | 'Poor' | 'Unavailable';
  annualRainfallMm: number | null;
  tempMinC: number | null;
  tempMaxC: number | null;
  greenCoverProxyPercent: number | null;
  environmentalScore: number | null;
}

export interface CandidateAngleScore {
  angle: number;
  label: string;
  solarScore: number;
  windScore: number | null;
  overallScore: number;
}

export interface OrientationResult {
  recommendedAngle: number;
  recommendedCardinal: string;
  solarScore: number | null;
  windScore: number | null;
  candidateScores: CandidateAngleScore[];
  explanation: string;
  solarPath: {
    sunriseAzimuth: number;
    sunsetAzimuth: number;
    peakElevation: number;
  };
  prevailingWind: {
    direction: string;
    avgSpeedKmH: number | null;
    summary?: string;
  };
}

export interface CostBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  description: string;
}

export interface CostEstimate {
  plotAreaSqFt: number;
  builtUpAreaSqFt: number;
  baseRatePerSqFt: number;
  terrainMultiplier: number;
  qualityMultiplier: number;
  estimatedTotalCost: number;
  rangeLow: number;
  rangeHigh: number;
  breakdown: CostBreakdownItem[];
  disclaimer: string;
}

export interface DataConfidence {
  overallConfidence: 'High' | 'Medium' | 'Low';
  confidenceScorePercent: number;
  providersCount: number;
  missingDataPoints: string[];
}

export interface DataSourceAttribution {
  provider: string;
  dataType: string;
  attribution: string;
  lastUpdated: string;
}

export interface AISynthesis {
  summary: string;
  architecturalRecommendations: string[];
  sustainabilityNotes: string[];
  engineNotice: string;
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
  suitabilityCategory: 'Highly Suitable' | 'Moderately Suitable' | 'Challenging Site' | 'High Constraint' | 'Insufficient Data';
  scorePartial?: boolean;
  factors: FactorResult[];
  terrain: TerrainAnalysis;
  waterRisk: WaterRiskIndicator;
  accessibility: AccessibilityAnalysis;
  facilities: FacilityDistance[];
  environment: EnvironmentalAnalysis;
  orientation: OrientationResult;
  cost: CostEstimate;
  dataConfidence: DataConfidence;
  sources: DataSourceAttribution[];
  risksAndLimitations: string[];
  aiSynthesis: AISynthesis;
}

export interface CompareResponse {
  siteA: AnalysisResponse;
  siteB: AnalysisResponse;
  winnerSiteId?: string;
  summary?: string;
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
  };
}
