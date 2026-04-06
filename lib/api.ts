import type { City, WeatherResponse, SyncResult } from '@/types/weather';

// Base URL comes from .env.local — NEVER hardcode it here
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

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

/** Manually triggers a data sync for all cities. */
export function triggerSync(): Promise<SyncResult[]> {
  return apiFetch<SyncResult[]>('/api/v1/sync', { method: 'POST' });
}
