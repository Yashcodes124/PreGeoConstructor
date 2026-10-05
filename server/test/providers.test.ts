import { afterEach, describe, expect, it } from 'vitest';
import { classifyFeature, toFeatures } from '../src/services/osm/overpass.provider';
import { resetFetchImplementation, setFetchImplementation } from '../src/utils/http';
import { getAirQuality } from '../src/services/weather/weather.service';

afterEach(() => {
  resetFetchImplementation();
});

describe('overpass normalization', () => {
  it('keeps only features with coordinates and a known kind', () => {
    expect(classifyFeature({ highway: 'residential' })).toBe('road');
    expect(classifyFeature({ natural: 'water' })).toBe('water');
    expect(classifyFeature({ amenity: 'hospital' })).toBe('facility');
    const features = toFeatures([
      { type: 'node', id: 1, lat: 12.9, lon: 77.6, tags: { amenity: 'hospital', name: 'Test Hospital' } },
      { type: 'way', id: 2, tags: { highway: 'primary' } },
    ]);
    expect(features).toHaveLength(1);
    expect(features[0]?.tags.name).toBe('Test Hospital');
  });
});

describe('provider failures', () => {
  it('returns unavailable air quality instead of a fabricated AQI', async () => {
    setFetchImplementation(async () => {
      throw new Error('network down');
    });
    const result = await getAirQuality(12.97, 77.59);
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.reason.toLowerCase()).toContain('unavailable');
    }
  });

  it('treats an aborted provider call as unavailable', async () => {
    setFetchImplementation(async () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    });
    const result = await getAirQuality(1.2, 1.2);
    expect(result.available).toBe(false);
  });
});
