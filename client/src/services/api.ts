export * from '../types/api';
import type {
  AnalysisRequest,
  AnalysisResponse,
  CompareResponse,
  LocationSearchResult,
} from '../types/api';

const API_BASE_URL = '/api';

async function readError(response: Response): Promise<Error> {
  try {
    const body = await response.json() as { error?: string };
    return new Error(body.error || `Request failed (${response.status})`);
  } catch {
    return new Error(`Request failed (${response.status})`);
  }
}

export async function checkHealth(): Promise<{ status: string; backendConnected: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return { status: 'unavailable', backendConnected: false };
    const data = await response.json() as { status?: string };
    return { status: data.status || 'ok', backendConnected: true };
  } catch {
    return { status: 'unavailable', backendConnected: false };
  }
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 3) return [];
  const response = await fetch(`${API_BASE_URL}/sites/search?q=${encodeURIComponent(query.trim())}`);
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<LocationSearchResult[]>;
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationSearchResult> {
  const response = await fetch(`${API_BASE_URL}/sites/reverse?lat=${latitude}&lon=${longitude}`);
  if (!response.ok) {
    return {
      displayName: `Selected location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      latitude,
      longitude,
      source: 'Coordinates only — reverse geocoding unavailable',
    };
  }
  return response.json() as Promise<LocationSearchResult>;
}

export async function analyzeSite(request: AnalysisRequest): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<AnalysisResponse>;
}

export async function getAnalysis(id: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analysis/${encodeURIComponent(id)}`);
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<AnalysisResponse>;
}

export async function compareAnalyses(idA: string, idB: string): Promise<CompareResponse> {
  const response = await fetch(`${API_BASE_URL}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysisIdA: idA, analysisIdB: idB }),
  });
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<CompareResponse>;
}

export async function generateReport(analysisId: string): Promise<{ reportId: string; downloadUrl: string; generatedAt?: string }> {
  const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(analysisId)}`, { method: 'POST' });
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<{ reportId: string; downloadUrl: string; generatedAt?: string }>;
}
