export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface WeatherSnapshot {
  id: number;
  city_id: number;

  // Core fields returned by the backend
  temperature: number;
  windspeed: number;
  precipitation: number;
  weather_code: number;
  recorded_at: string;
  synced_at: string;

  // Optional extended fields (Open-Meteo extras — may be added in future backend versions)
  temperature_2m?: number;
  windspeed_10m?: number;
  apparent_temperature?: number;
  relative_humidity_2m?: number;
}

export interface WeatherResponse {
  city: City;
  current: WeatherSnapshot | null;
  history: WeatherSnapshot[];
}

export interface SyncResult {
  city: string;
  new_records: number;
  skipped: number;
  error?: string;
}
