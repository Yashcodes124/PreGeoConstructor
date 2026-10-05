const EARTH_RADIUS_M = 6_371_000;

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function offsetCoordinate(
  latitude: number,
  longitude: number,
  northMeters: number,
  eastMeters: number,
): { latitude: number; longitude: number } {
  const latRad = (latitude * Math.PI) / 180;
  const dLat = northMeters / 111_320;
  const metersPerDegreeLon = 111_320 * Math.cos(latRad);
  const dLon = metersPerDegreeLon === 0 ? 0 : eastMeters / metersPerDegreeLon;
  return {
    latitude: latitude + dLat,
    longitude: longitude + dLon,
  };
}

export function roundTo(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function compassLabel(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const names = [
    'North',
    'North-East',
    'East',
    'South-East',
    'South',
    'South-West',
    'West',
    'North-West',
  ] as const;
  const index = Math.round(normalized / 45) % 8;
  return `${names[index]} (${Math.round(normalized)}°)`;
}

export function circularMeanDegrees(values: number[]): number | null {
  if (values.length === 0) return null;
  let x = 0;
  let y = 0;
  for (const value of values) {
    const radians = (value * Math.PI) / 180;
    x += Math.cos(radians);
    y += Math.sin(radians);
  }
  if (x === 0 && y === 0) return null;
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function angularDifference(a: number, b: number): number {
  const diff = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(diff, 360 - diff);
}
