import { roundTo } from '../utils/geo';

const MAJOR_HIGHWAY = new Set(['motorway', 'trunk', 'primary']);
const COLLECTOR = new Set(['secondary', 'tertiary']);

export interface AccessibilityComputation {
  nearestRoadDistanceMeters: number | null;
  roadType: string;
  accessibilityScore: number | null;
  nearestHighwayDistanceMeters: number | null;
  rawValue: string;
  explanation: string;
}

export function readableRoadClass(highway: string | null): string {
  if (!highway) return 'Mapped road';
  return `Mapped ${highway.replaceAll('_', ' ')} road`;
}

export function computeAccessibility(input: {
  querySucceeded: boolean;
  nearestRoadMeters: number | null;
  nearestRoadClass: string | null;
  nearestHighwayMeters: number | null;
  searchRadiusMeters: number;
  reason?: string;
}): AccessibilityComputation {
  if (!input.querySucceeded) {
    return {
      nearestRoadDistanceMeters: null,
      roadType: 'Unavailable',
      accessibilityScore: null,
      nearestHighwayDistanceMeters: null,
      rawValue: 'Unavailable',
      explanation: input.reason ?? 'Road-network data was unavailable. No accessibility score was imputed.',
    };
  }

  const highwayDistance = input.nearestHighwayMeters === null ? null : Math.round(input.nearestHighwayMeters);

  if (input.nearestRoadMeters === null) {
    return {
      nearestRoadDistanceMeters: null,
      roadType: `No mapped road within ${input.searchRadiusMeters} m`,
      accessibilityScore: 4,
      nearestHighwayDistanceMeters: highwayDistance,
      rawValue: `No mapped road within ${input.searchRadiusMeters} m`,
      explanation: `No drivable OpenStreetMap road was found within ${input.searchRadiusMeters} m. Incomplete mapping can hide a real access road, so this is a conservative planning flag rather than a surveyed distance.`,
    };
  }

  const distance = Math.round(input.nearestRoadMeters);
  let score = 5;
  if (distance < 30) score = 9;
  else if (distance < 80) score = 8.2;
  else if (distance < 200) score = 7.2;
  else if (distance < 500) score = 6.2;

  const roadClass = input.nearestRoadClass;
  if (roadClass && MAJOR_HIGHWAY.has(roadClass)) score += 0.3;
  else if (roadClass && !COLLECTOR.has(roadClass) && roadClass !== 'unclassified' && roadClass !== 'residential') {
    score -= 0.3;
  }
  score = roundTo(Math.min(9.6, Math.max(1, score)), 1);
  const roadType = readableRoadClass(roadClass);

  return {
    nearestRoadDistanceMeters: distance,
    roadType,
    accessibilityScore: score,
    nearestHighwayDistanceMeters: highwayDistance,
    rawValue: `${distance} m to ${roadType}`,
    explanation: `Nearest mapped drivable road is ${distance} m away (${roadType}). ${highwayDistance === null ? `No motorway, trunk, or primary road was mapped within ${input.searchRadiusMeters} m.` : `Nearest major road is ${highwayDistance} m away.`} This describes mapped access, not legal right-of-way.`,
  };
}
