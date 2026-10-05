import SunCalc from 'suncalc';
import { angularDifference, compassLabel, roundTo } from '../utils/geo';

export interface SolarPath {
  sunriseAzimuth: number;
  sunsetAzimuth: number;
  peakElevation: number;
}

export interface OrientationCandidate {
  angle: number;
  label: string;
  solarScore: number;
  windScore: number | null;
  overallScore: number;
}

export interface OrientationComputation {
  recommendedAngle: number;
  recommendedCardinal: string;
  solarScore: number;
  windScore: number | null;
  candidateScores: OrientationCandidate[];
  explanation: string;
  solarPath: SolarPath;
  prevailingWind: {
    direction: string;
    avgSpeedKmH: number | null;
    summary: string;
  };
}

/**
 * SunCalc azimuth is measured from south toward west.
 * Compass bearing is degrees clockwise from north.
 */
export function suncalcAzimuthToCompass(azimuthRadians: number): number {
  const degreesFromSouthTowardWest = (azimuthRadians * 180) / Math.PI;
  return (180 + degreesFromSouthTowardWest + 360) % 360;
}

function approximateUtcDate(year: number, month: number, day: number, localHour: number, longitude: number): Date {
  const offsetHours = longitude / 15;
  const utcMillis = Date.UTC(year, month - 1, day, 0, 0, 0) + (localHour - offsetHours) * 3_600_000;
  return new Date(utcMillis);
}

export function solarPathFor(latitude: number, longitude: number, on: Date = new Date()): SolarPath {
  const times = SunCalc.getTimes(on, latitude, longitude);
  const sunrise = SunCalc.getPosition(times.sunrise, latitude, longitude);
  const sunset = SunCalc.getPosition(times.sunset, latitude, longitude);
  const noon = SunCalc.getPosition(times.solarNoon, latitude, longitude);
  return {
    sunriseAzimuth: roundTo(suncalcAzimuthToCompass(sunrise.azimuth), 0),
    sunsetAzimuth: roundTo(suncalcAzimuthToCompass(sunset.azimuth), 0),
    peakElevation: roundTo((noon.altitude * 180) / Math.PI, 0),
  };
}

function sampleDatetimes(longitude: number, year: number): Array<{ date: Date; hour: number }> {
  const days = [
    { month: 6, day: 21 },
    { month: 12, day: 21 },
    { month: 3, day: 21 },
  ];
  const hours = [8, 10, 12, 14, 16];
  const samples: Array<{ date: Date; hour: number }> = [];
  for (const day of days) {
    for (const hour of hours) {
      samples.push({ date: approximateUtcDate(year, day.month, day.day, hour, longitude), hour });
    }
  }
  return samples;
}

export function scoreFacadeSolar(latitude: number, longitude: number, facadeDegrees: number, year = 2026): number {
  let penalty = 0;
  let reward = 0;
  let counted = 0;

  for (const sample of sampleDatetimes(longitude, year)) {
    const position = SunCalc.getPosition(sample.date, latitude, longitude);
    const altitude = (position.altitude * 180) / Math.PI;
    if (altitude < 5) continue;
    counted += 1;
    const sunBearing = suncalcAzimuthToCompass(position.azimuth);
    const alignment = angularDifference(facadeDegrees, sunBearing);
    if (sample.hour >= 12 && sample.hour <= 16 && alignment < 55) {
      const afternoonWeight = sample.hour >= 14 ? 1.35 : 1;
      penalty += ((55 - alignment) / 55) * (altitude / 80) * afternoonWeight;
    }
    if (sample.hour >= 8 && sample.hour <= 10 && alignment < 60) {
      reward += ((60 - alignment) / 60) * 0.28;
    }
  }

  if (counted === 0) return 5;
  const raw = 8.1 - penalty * 0.85 + reward * 0.45;
  return roundTo(Math.min(9.6, Math.max(1.5, raw)), 1);
}

export function scoreFacadeWind(facadeDegrees: number, windFromDegrees: number | null): number | null {
  if (windFromDegrees === null) return null;
  const alignment = angularDifference(facadeDegrees, windFromDegrees);
  if (alignment <= 25) return 9.1;
  if (alignment <= 50) return 7.8;
  if (alignment <= 90) return 6.1;
  return 4.4;
}

export function computeOrientation(input: {
  latitude: number;
  longitude: number;
  windFromDegrees: number | null;
  windSpeedKmH: number | null;
  windSampleDays: number | null;
}): OrientationComputation {
  const solarPath = solarPathFor(input.latitude, input.longitude, new Date(Date.UTC(2026, 5, 21, 6, 30)));
  const chartAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const searchAngles = Array.from({ length: 24 }, (_, index) => index * 15);

  const evaluated = searchAngles.map((angle) => {
    const solarScore = scoreFacadeSolar(input.latitude, input.longitude, angle);
    const windScore = scoreFacadeWind(angle, input.windFromDegrees);
    const overallScore = windScore === null ? solarScore : roundTo(solarScore * 0.65 + windScore * 0.35, 1);
    return { angle, label: compassLabel(angle), solarScore, windScore, overallScore };
  });

  const recommended = [...evaluated].sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    if (b.solarScore !== a.solarScore) return b.solarScore - a.solarScore;
    return a.angle - b.angle;
  })[0] ?? evaluated[0];

  if (!recommended) {
    throw new Error('Orientation evaluation produced no candidates');
  }

  const candidateScores = chartAngles.map((angle) => evaluated.find((item) => item.angle === angle) ?? recommended);
  if (!chartAngles.includes(recommended.angle)) {
    candidateScores.push(recommended);
  }

  const windSummary = input.windFromDegrees === null
    ? 'Prevailing wind was unavailable, so orientation uses solar geometry only.'
    : `Recent dominant wind comes from ${compassLabel(input.windFromDegrees)}${input.windSpeedKmH === null ? '' : ` (mean of daily maximum 10 m wind speed ${input.windSpeedKmH} km/h over ${input.windSampleDays ?? 'recent'} days)`}. Ventilation scoring prefers a facade facing that incoming direction. This is not an energy-savings guarantee.`;

  return {
    recommendedAngle: recommended.angle,
    recommendedCardinal: recommended.label,
    solarScore: recommended.solarScore,
    windScore: recommended.windScore,
    candidateScores,
    explanation: `Recommended planning orientation is ${recommended.label}. The score compares afternoon solar exposure on representative solstice and equinox hours with, when available, alignment to recent prevailing wind. Local time is approximated from longitude. This is passive-design guidance, not a thermal simulation or code compliance check.`,
    solarPath,
    prevailingWind: {
      direction: input.windFromDegrees === null ? 'Unavailable' : compassLabel(input.windFromDegrees),
      avgSpeedKmH: input.windSpeedKmH,
      summary: windSummary,
    },
  };
}
