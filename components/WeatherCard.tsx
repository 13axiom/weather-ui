'use client';

import type { WeatherSnapshot } from '@/types/weather';

// Weather code descriptions from Open-Meteo docs
const WEATHER_LABELS: Record<number, { label: string; emoji: string }> = {
  0:  { label: 'Clear sky',      emoji: '☀️' },
  1:  { label: 'Mainly clear',   emoji: '🌤️' },
  2:  { label: 'Partly cloudy',  emoji: '⛅' },
  3:  { label: 'Overcast',       emoji: '☁️' },
  45: { label: 'Foggy',          emoji: '🌫️' },
  48: { label: 'Icy fog',        emoji: '🌫️' },
  51: { label: 'Light drizzle',  emoji: '🌦️' },
  61: { label: 'Rain',           emoji: '🌧️' },
  71: { label: 'Snow',           emoji: '❄️' },
  80: { label: 'Showers',        emoji: '🌦️' },
  95: { label: 'Thunderstorm',   emoji: '⛈️' },
};

interface Props {
  snapshot: WeatherSnapshot;
  cityName: string;
}

export default function WeatherCard({ snapshot, cityName }: Props) {
  const { label, emoji } = WEATHER_LABELS[snapshot.weather_code] ?? { label: 'Unknown', emoji: '🌡️' };
  const date = new Date(snapshot.recorded_at).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{cityName}</h2>
          <p className="text-slate-400 text-sm">{date}</p>
        </div>
        <span className="text-4xl" role="img" aria-label={label}>{emoji}</span>
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-6xl font-light text-blue-600">
          {snapshot.temperature.toFixed(1)}
        </span>
        <div>
          <span className="text-3xl text-blue-400">°C</span>
          <p className="text-slate-500 text-sm mt-1">{label}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Wind" value={`${snapshot.windspeed.toFixed(1)} km/h`} icon="💨" />
        <StatCard label="Precipitation" value={`${snapshot.precipitation.toFixed(1)} mm`} icon="💧" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="font-semibold text-slate-700 text-sm">{value}</p>
      </div>
    </div>
  );
}
