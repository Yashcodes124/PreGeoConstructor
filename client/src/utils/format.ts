export function formatMeasure(value: number | null | undefined, suffix = '', unavailable = 'Unavailable'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return unavailable;
  return `${value}${suffix}`;
}

export function formatMeters(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Unavailable';
  if (value >= 1000) return `${(value / 1000).toFixed(1)} km`;
  return `${Math.round(value)} m`;
}
