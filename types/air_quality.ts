/**
 * Air Quality types — mirror of the Go models/air_quality.go structs.
 *
 * AQI scale (OpenWeatherMap):
 *   1 = Good       (#22c55e green)
 *   2 = Fair       (#84cc16 lime)
 *   3 = Moderate   (#eab308 yellow)
 *   4 = Poor       (#f97316 orange)
 *   5 = Very Poor  (#ef4444 red)
 */

export interface AirQualitySnapshot {
  id:          number;
  city_id:     number;
  city_name?:  string;

  /** AQI index 1–5 (OWM scale). Lower is better. */
  aqi:         number;
  aqi_label?:  string;   // "Good" | "Fair" | "Moderate" | "Poor" | "Very Poor"
  aqi_color?:  string;   // hex colour matching the AQI level

  /** Pollutant concentrations in µg/m³ */
  co:   number;   // Carbon monoxide
  no2:  number;   // Nitrogen dioxide
  o3:   number;   // Ozone
  pm2_5: number;  // Fine particles (most health-relevant for runners)
  pm10: number;   // Coarse particles
  so2:  number;   // Sulphur dioxide

  recorded_at: string;  // ISO 8601
  synced_at:   string;  // ISO 8601
}

export interface AirQualityResponse {
  city:    import('./weather').City;
  current: AirQualitySnapshot | null;
  history: AirQualitySnapshot[];
}

export interface AirQualitySyncResult {
  city:        string;
  new_records: number;
  skipped:     number;
  error?:      string;
}
