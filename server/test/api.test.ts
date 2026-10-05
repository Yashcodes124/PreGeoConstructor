import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { checkDatabase } from '../src/services/db';

const app = createApp();

describe('health', () => {
  it('returns the documented ok payload without calling providers', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('reports database connectivity separately', async () => {
    const response = await request(app).get('/api/health/db');
    const connected = await checkDatabase();
    expect(response.status).toBe(connected ? 200 : 503);
    expect(response.body.database).toBe(connected ? 'ok' : 'unavailable');
  });
});

describe('validation', () => {
  it('rejects invalid coordinates and building requirements', async () => {
    const response = await request(app).post('/api/analysis').send({
      latitude: 120,
      longitude: 77,
      buildingType: 'castle',
      plotAreaSqFt: -10,
      builtUpAreaSqFt: 0,
      floors: 0,
      qualityGrade: 'ultra',
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details.length).toBeGreaterThan(0);
    expect(JSON.stringify(response.body)).not.toContain('stack');
  });

  it('rejects short geocoding queries', async () => {
    const response = await request(app).get('/api/sites/search').query({ q: 'be' });
    expect(response.status).toBe(400);
  });

  it('rejects comparing an analysis with itself', async () => {
    const response = await request(app).post('/api/compare').send({
      analysisIdA: 'same',
      analysisIdB: 'same',
    });
    expect(response.status).toBe(400);
  });
});

describe('missing records', () => {
  beforeAll(async () => {
    const connected = await checkDatabase();
    if (!connected) {
      throw new Error('Database is required for not-found tests');
    }
  });

  it('does not fabricate an unknown analysis', async () => {
    const response = await request(app).get('/api/analysis/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Analysis not found');
  });
});
