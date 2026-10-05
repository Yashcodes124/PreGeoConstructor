import { env } from '../config/env';
import { ProviderUnavailableError } from './errors';
import { logger } from './logger';

export type FetchLike = typeof fetch;

let fetchImpl: FetchLike = globalThis.fetch.bind(globalThis);

export function setFetchImplementation(next: FetchLike): void {
  fetchImpl = next;
}

export function resetFetchImplementation(): void {
  fetchImpl = globalThis.fetch.bind(globalThis);
}

export function joinProviderUrl(base: string, path: string): URL {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return new URL(path.replace(/^\//, ''), normalizedBase);
}

export interface ProviderRequest {
  provider: string;
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  accept?: string;
}

export async function providerFetch(request: ProviderRequest): Promise<Response> {
  const controller = new AbortController();
  const timeoutMs = request.timeoutMs ?? env.PROVIDER_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(request.url, {
      method: request.method ?? 'GET',
      headers: {
        Accept: request.accept ?? 'application/json',
        'User-Agent': env.HTTP_USER_AGENT,
        ...request.headers,
      },
      body: request.body,
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.warn('Provider request failed', {
        provider: request.provider,
        status: response.status,
      });
      throw new ProviderUnavailableError(
        request.provider,
        `${request.provider} returned HTTP ${response.status}`,
      );
    }

    return response;
  } catch (error) {
    if (error instanceof ProviderUnavailableError) {
      throw error;
    }
    const aborted = error instanceof Error && error.name === 'AbortError';
    logger.warn('Provider request unavailable', {
      provider: request.provider,
      reason: aborted ? 'timeout' : 'network',
    });
    throw new ProviderUnavailableError(
      request.provider,
      aborted ? `${request.provider} timed out` : `${request.provider} could not be reached`,
    );
  } finally {
    clearTimeout(timer);
  }
}

let nominatimQueue: Promise<void> = Promise.resolve();
let lastNominatimAt = 0;

/** Nominatim usage policy: at most one request per second. */
export function withNominatimSlot<T>(task: () => Promise<T>): Promise<T> {
  const run = nominatimQueue.then(async () => {
    const waitMs = Math.max(0, 1100 - (Date.now() - lastNominatimAt));
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    lastNominatimAt = Date.now();
    return task();
  });
  nominatimQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
