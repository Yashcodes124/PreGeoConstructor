import { WATER_DISCLAIMER } from "../config/constants";
import { roundTo } from "../utils/geo";

export interface WaterComputationInput {
  querySucceeded: boolean;
  distanceMeters: number | null;
  searchRadiusMeters: number;
  elevationBufferMeters: number | null;
  reason?: string;
}

export interface WaterComputation {
  distanceToWaterMeters: number | null;
  elevationBufferMeters: number | null;
  riskLevel: "Low Risk" | "Moderate Risk" | "High Risk" | "Unavailable";
  indicatorScore: number | null;
  disclaimer: string;
  rawValue: string;
  explanation: string;
}

/**
 * Plain-language wording for the stored riskLevel value. The stored values
 * ('Low Risk' etc.) are part of the API contract and are unchanged. They only
 * describe how close the site is to mapped water; they are NOT flood risk.
 */
export function waterProximityLabel(
  level: WaterComputation["riskLevel"],
): string {
  switch (level) {
    case "High Risk":
      return "Very close to mapped water(High Risk)";
    case "Moderate Risk":
      return "Near mapped water(Moderate Risk)";
    case "Low Risk":
      return "Farther from mapped water(Low Risk)";
    default:
      return "Not assessed";
  }
}

/**
 * Planning indicator only. Distance to mapped surface water plus optional
 * relative elevation. Not a flood model and not a flood-risk rating.
 * If no water feature is mapped nearby, nothing is scored: absence of
 * OpenStreetMap data is not evidence that a site is safe.
 */
export function computeWaterIndicator(
  input: WaterComputationInput,
): WaterComputation {
  const buffer =
    input.elevationBufferMeters === null
      ? null
      : roundTo(input.elevationBufferMeters, 1);
  const disclaimer = WATER_DISCLAIMER;

  if (!input.querySucceeded) {
    return {
      distanceToWaterMeters: null,
      elevationBufferMeters: buffer,
      riskLevel: "Unavailable",
      indicatorScore: null,
      disclaimer,
      rawValue: "Unavailable",
      explanation:
        input.reason ??
        "Mapped surface-water data was unavailable. No surface-water proximity score was imputed.",
    };
  }

  if (input.distanceMeters === null) {
    return {
      distanceToWaterMeters: null,
      elevationBufferMeters: buffer,
      riskLevel: "Unavailable",
      indicatorScore: null,
      disclaimer,
      rawValue: `No mapped surface water within ${input.searchRadiusMeters} m`,
      explanation: `No OpenStreetMap surface-water feature was found within ${input.searchRadiusMeters} m. This is an absence of mapped features, not a flood clearance, so no score was assigned and this factor is left out of the overall suitability score. Unmapped drains and official flood maps were not consulted.`,
    };
  }

  const distance = Math.round(input.distanceMeters);
  let indicatorScore = 8.8;
  let riskLevel: WaterComputation["riskLevel"] = "Low Risk";

  if (distance < 150) {
    indicatorScore = 3.6;
    riskLevel = "High Risk";
  } else if (distance < 400) {
    indicatorScore = 5.6;
    riskLevel = "Moderate Risk";
  } else if (distance < 800) {
    indicatorScore = 7.2;
    riskLevel = "Moderate Risk";
  }

  if (buffer !== null && buffer < 2 && distance < 1000) {
    indicatorScore = Math.min(indicatorScore, 4.2);
    riskLevel = distance < 400 ? "High Risk" : "Moderate Risk";
  }

  const bufferText =
    buffer === null
      ? "Relative elevation versus that feature was not available."
      : `Site elevation is ${buffer} m relative to the nearest mapped water feature (positive means higher).`;

  return {
    distanceToWaterMeters: distance,
    elevationBufferMeters: buffer,
    riskLevel,
    indicatorScore: roundTo(indicatorScore, 1),
    disclaimer,
    rawValue: `${distance} m to nearest mapped surface water`,
    explanation: `Nearest mapped surface water is ${distance} m away. ${bufferText} This is a distance-based planning indicator, not a flood-risk rating or an official flood-zone determination.`,
  };
}
