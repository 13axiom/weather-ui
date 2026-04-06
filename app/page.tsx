'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCities, getWeather, triggerSync } from '@/lib/api';
import WeatherCard from '@/components/WeatherCard';
import TemperatureChart from '@/components/TemperatureChart';
import CitySelector from '@/components/CitySelector';
import type { WeatherResponse, SyncResult } from '@/types/weather';

export default function Home() {
  const [cities, setCities] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('Moscow');
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);

  // Load city list on mount
  useEffect(() => {
    getCities()
      .then((c) => {
        const names = c.map((x) => x.name);
        setCities(names);
        if (names.length > 0 && !names.includes(selected)) {
          setSelected(names[0]);
        }
      })
      .catch(() => setError('Could not connect to backend. Is the Go server running?'));
  }, []);

  // Load weather when city changes
  const loadWeather = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeather(city, 24);
      setWeather(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) loadWeather(selected);
  }, [selected, loadWeather]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResults(null);
    try {
      const results = await triggerSync();
      setSyncResults(results);
      await loadWeather(selected);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">🌤 Weather Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Powered by Open-Meteo — no API key needed</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white
                       rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium
                       shadow-sm shadow-blue-200 transition-all"
          >
            {syncing ? (
              <>
                <span className="animate-spin">⟳</span> Syncing...
              </>
            ) : (
              <>⟳ Sync Now</>
            )}
          </button>
        </div>

        {/* Sync results toast */}
        {syncResults && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            Sync complete: {syncResults.map((r) =>
              `${r.city} (+${r.new_records})`
            ).join(', ')}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* City Selector */}
        <div className="mb-6">
          <CitySelector cities={cities} selected={selected} onChange={setSelected} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16 text-slate-400">
            <div className="animate-pulse text-4xl">🌤</div>
          </div>
        )}

        {/* Content */}
        {weather && !loading && (
          <div className="grid gap-6">
            {weather.current ? (
              <WeatherCard snapshot={weather.current} cityName={selected} />
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center text-slate-400 border border-slate-100">
                No data yet — click Sync Now to fetch weather data.
              </div>
            )}

            {weather.history && weather.history.length > 1 && (
              <TemperatureChart history={weather.history} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
