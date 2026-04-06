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
  temperature: number;
  windspeed: number;
  precipitation: number;
  weather_code: number;
  recorded_at: string;
  synced_at: string;
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
