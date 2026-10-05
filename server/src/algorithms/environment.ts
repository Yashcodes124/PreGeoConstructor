import { roundTo } from '../utils/geo';

export type AqiCategory = 'Good' | 'Moderate' | 'Unhealthy' | 'Poor' | 'Unavailable';

export function aqiCategory(aqi: number | null): AqiCategory {
  if (aqi === null) return 'Unavailable';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy';
  return 'Poor';
}

export function scoreAirQuality(aqi: number): number {
  if (aqi <= 50) return 9;
  if (aqi <= 100) return 7.4;
  if (aqi <= 150) return 5.4;
  if (aqi <= 200) return 3.8;
  return 2.4;
}

export function scoreRainfall(annualRainfallMm: number): { score: number; note: string } {
  if (annualRainfallMm < 400) {
    return { score: 7, note: 'Low annual precipitation may affect water availability; it is not a drought certification.' };
  }
  if (annualRainfallMm <= 1500) {
    return { score: 8.6, note: 'Annual precipitation is in a moderate planning range.' };
  }
  if (annualRainfallMm <= 2500) {
    return { score: 6.6, note: 'Higher annual precipitation means drainage design should be reviewed. This is not a flood prediction.' };
  }
  return { score: 5.2, note: 'Very high annual precipitation increases drainage concern. This is not a flood prediction.' };
}

export interface EnvironmentComputation {
  airQualityIndex: number | null;
  aqiCategory: AqiCategory;
  annualRainfallMm: number | null;
  tempMinC: number | null;
  tempMaxC: number | null;
  greenCoverProxyPercent: number | null;
  environmentalScore: number | null;
  rawValue: string;
  explanation: string;
}

export function computeEnvironment(input: {
  airQualityIndex: number | null;
  annualRainfallMm: number | null;
  tempMinC: number | null;
  tempMaxC: number | null;
  climateYear: number | null;
}): EnvironmentComputation {
  const category = aqiCategory(input.airQualityIndex);
  const parts: number[] = [];
  const notes: string[] = [];

  if (input.airQualityIndex !== null) {
    parts.push(scoreAirQuality(input.airQualityIndex));
    notes.push(`Current US AQI is ${Math.round(input.airQualityIndex)} (${category}).`);
  } else {
    notes.push('Air-quality data was unavailable and was not imputed.');
  }

  if (input.annualRainfallMm !== null) {
    const rainfall = scoreRainfall(input.annualRainfallMm);
    parts.push(rainfall.score);
    notes.push(`${input.climateYear ?? 'Recent'} precipitation sum was ${Math.round(input.annualRainfallMm)} mm. ${rainfall.note}`);
  } else {
    notes.push('Annual precipitation was unavailable and was not imputed.');
  }

  notes.push('Mapped canopy area was not calculated, so green-cover percentage is unavailable rather than estimated from feature counts.');

  return {
    airQualityIndex: input.airQualityIndex === null ? null : Math.round(input.airQualityIndex),
    aqiCategory: category,
    annualRainfallMm: input.annualRainfallMm === null ? null : Math.round(input.annualRainfallMm),
    tempMinC: input.tempMinC === null ? null : roundTo(input.tempMinC, 1),
    tempMaxC: input.tempMaxC === null ? null : roundTo(input.tempMaxC, 1),
    greenCoverProxyPercent: null,
    environmentalScore: parts.length === 0 ? null : roundTo(parts.reduce((sum, value) => sum + value, 0) / parts.length, 1),
    rawValue: parts.length === 0 ? 'Unavailable' : notes[0] ?? 'Partial environmental data',
    explanation: notes.join(' '),
  };
}
