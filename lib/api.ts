/**
 * API client for weather-api (Go backend).
 *
 * Security model:
 *   - Weather endpoints: public (no key needed).
 *   - Air Quality endpoints: protected by X-Internal-Key header.
 *     The internal key (NEXT_PUBLIC_INTERNAL_KEY) is shared between our
 *     frontend and our backend only — it is NOT the OWM key.
 *     The OWM key lives exclusively in the backend .env and never reaches
 *     the browser.
 */

import type { City, WeatherResponse, SyncResult } from '@/types/weather';
import type {
  AirQualitySnapshot,
  AirQualityResponse,
  AirQualitySyncResult,
} from '@/types/air_quality';

const BASE_URL     = process.env.NEXT_PUBLIC_API_URL      ?? 'http://localhost:8080';
const INTERNAL_KEY = process.env.NEXT_PUBLIC_INTERNAL_KEY ?? '';

// ── Generic fetch helpers ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Same as apiFetch but adds the X-Internal-Key header for protected routes. */
async function protectedFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Key': INTERNAL_KEY,
      ...(options?.headers ?? {}),
    },
  });
}

// ── Weather API (public) ─────────────────────────────────────────────────────

/** Returns all tracked cities. */
export function getCities(): Promise<City[]> {
  return apiFetch<City[]>('/api/v1/cities');
}

/** Returns current weather and recent history for a city. */
export function getWeather(city: string, limit = 24): Promise<WeatherResponse> {
  return apiFetch<WeatherResponse>(
    `/api/v1/weather/${encodeURIComponent(city)}?limit=${limit}`
  );
}

/** Manually triggers a weather data sync for all cities. */
export function triggerSync(): Promise<SyncResult[]> {
  return apiFetch<SyncResult[]>('/api/v1/sync', { method: 'POST' });
}

// ── Air Quality API (protected by internal key) ──────────────────────────────

/** Returns the latest AQ snapshot for every tracked city. */
export function getAllCitiesAQ(): Promise<AirQualitySnapshot[]> {
  return protectedFetch<AirQualitySnapshot[]>('/api/v1/air');
}

/** Returns current AQ snapshot + history for one city. */
export function getCityAQ(city: string, limit = 24): Promise<AirQualityResponse> {
  return protectedFetch<AirQualityResponse>(
    `/api/v1/air/${encodeURIComponent(city)}?limit=${limit}`
  );
}

/** Manually triggers an air quality sync for all cities. */
export function triggerAQSync(): Promise<AirQualitySyncResult[]> {
  return protectedFetch<AirQualitySyncResult[]>('/api/v1/air/sync', { method: 'POST' });
}
