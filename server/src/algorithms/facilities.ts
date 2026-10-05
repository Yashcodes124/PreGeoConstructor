import type { AnalysisResponse } from '../types/domain';
import { roundTo } from '../utils/geo';

export type FacilityType = AnalysisResponse['facilities'][number]['facilityType'];

export interface FacilityHit {
  facilityType: FacilityType;
  distanceMeters: number;
  name: string;
}

export interface FacilitiesComputation {
  facilities: AnalysisResponse['facilities'];
  score: number | null;
  rawValue: string;
  explanation: string;
}

const EXPECTED: FacilityType[] = [
  'Hospital',
  'Fire Station',
  'Construction Depot',
  'Power Substation',
  'Water Supply Main',
  'Public Transit',
];

export function computeFacilities(input: {
  querySucceeded: boolean;
  hits: FacilityHit[];
  searchRadiusMeters: number;
  reason?: string;
}): FacilitiesComputation {
  if (!input.querySucceeded) {
    return {
      facilities: EXPECTED.map((facilityType) => ({
        facilityType,
        distanceMeters: null,
        name: 'Unavailable',
        available: false,
      })),
      score: null,
      rawValue: 'Unavailable',
      explanation: input.reason ?? 'Facility data was unavailable. No facilities score was imputed.',
    };
  }

  const nearest = new Map<FacilityType, FacilityHit>();
  for (const hit of input.hits) {
    const current = nearest.get(hit.facilityType);
    if (!current || hit.distanceMeters < current.distanceMeters) {
      nearest.set(hit.facilityType, hit);
    }
  }

  const facilities = EXPECTED.map((facilityType) => {
    const hit = nearest.get(facilityType);
    if (!hit) {
      return {
        facilityType,
        distanceMeters: null,
        name: `No mapped feature within ${input.searchRadiusMeters} m`,
        available: false,
      };
    }
    return {
      facilityType,
      distanceMeters: Math.round(hit.distanceMeters),
      name: hit.name,
      available: true,
    };
  });

  const found = facilities.filter((item) => item.available && item.distanceMeters !== null);
  if (found.length === 0) {
    return {
      facilities,
      score: 4.4,
      rawValue: `No mapped essential facilities within ${input.searchRadiusMeters} m`,
      explanation: `No hospital, fire station, hardware shop, substation, water works, or transit feature was mapped within ${input.searchRadiusMeters} m. Mapping gaps are possible, so this is not proof that services are absent.`,
    };
  }

  const average = found.reduce((sum, item) => sum + (item.distanceMeters ?? 0), 0) / found.length;
  let score = 5.2;
  if (average < 1000) score = 8.8;
  else if (average < 2000) score = 7.8;
  else if (average < 4000) score = 6.4;

  return {
    facilities,
    score: roundTo(score, 1),
    rawValue: `${found.length} of ${EXPECTED.length} facility types mapped; mean ${Math.round(average)} m`,
    explanation: `Score uses only facilities actually returned by OpenStreetMap. Construction supply is proxied by mapped hardware or DIY shops, not a certified depot. Missing types were not assigned a guessed distance. Water supply uses mapped water works or towers, not an assumed municipal main.`,
  };
}
