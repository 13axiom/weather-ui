'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCities, getWeather, triggerSync } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import WeatherCard from '@/components/WeatherCard';
import TemperatureChart from '@/components/TemperatureChart';
import { CitySelectorSearch, CitySelectorPills } from '@/components/CitySelector';
import LastSyncBadge from '@/components/LastSyncBadge';
import type { WeatherResponse, SyncResult } from '@/types/weather';

export default function CityPage() {
  const [cities, setCities]           = useState<string[]>([]);
  const [selected, setSelected]       = useState<string>('Moscow');
  const [query, setQuery]             = useState('');
  const [weather, setWeather]         = useState<WeatherResponse | null>(null);
  const [loading, setLoading]         = useState(false);
  const [syncing, setSyncing]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);

  useEffect(() => {
    getCities()
      .then((c) => {
        const names = c.map((x) => x.name);
        setCities(names);
        if (names.length > 0 && !names.includes(selected)) setSelected(names[0]);
      })
      .catch(() => setError('Could not connect to backend. Is the Go server running?'));
  }, []);

  const loadWeather = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      setWeather(await getWeather(city, 24));
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
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main style={{
          flex:     1,
          maxWidth: '1280px',
          margin:   '0 auto',
          width:    '100%',
          padding:  '32px 100px',
        }}>
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'City View' }]} />

          {/* ── Header: title left, search + sync right ── */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   '24px',
            gap:            '24px',
          }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                City View
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Detailed weather and history for one city
              </p>
            </div>

            {/* Search above Sync — stacked column, top right */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
              <CitySelectorSearch query={query} onQueryChange={setQuery} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LastSyncBadge syncedAt={weather?.current?.synced_at} />
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="btn-neon"
              >
                <span style={{ display: 'inline-block' }} className={syncing ? 'animate-spin' : ''}>⟳</span>
                {syncing ? ' Syncing…' : ' Sync Now'}
              </button>
            </div>
          </div>

          {/* ── Notifications ── */}
          {syncResults && (
            <div style={{
              marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
              fontSize: '0.875rem', background: 'var(--color-success)22',
              border: '1px solid var(--color-success)', color: 'var(--color-success)',
            }}>
              ✓ Sync complete: {syncResults.map(r => `${r.city} (+${r.new_records})`).join(', ')}
            </div>
          )}
          {error && (
            <div style={{
              marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
              fontSize: '0.875rem', background: 'var(--color-accent-glow)',
              border: '1px solid var(--color-accent)', color: 'var(--color-accent)',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* ── City pills — above the grid, full width ── */}
          <div className="fade-in-up" style={{ marginBottom: '14px' }}>
            <CitySelectorPills
              cities={cities}
              selected={selected}
              onChange={setSelected}
              query={query}
            />
          </div>

          {/* ── Main grid: WeatherCard (1/3) + Chart (2/3), tops aligned ── */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 2fr',
            gap:                 '20px',
            alignItems:          'stretch',
          }}>

            {/* Left column — fills full grid row height */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

              {/* Weather card — stretches to fill column */}
              <div className="fade-in-up fade-in-up-1" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                  <div className="glass" style={{
                    borderRadius: 'var(--radius-widget)',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    opacity: 0.5,
                  }}>
                    🌤
                  </div>
                ) : weather?.current ? (
                  <WeatherCard snapshot={weather.current} cityName={selected} fullHeight />
                ) : (
                  <div className="glass" style={{
                    borderRadius: 'var(--radius-widget)',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                  }}>
                    No data yet — click <strong>Sync Now</strong> to fetch weather.
                  </div>
                )}
              </div>
            </div>

            {/* Right column — chart, stretches to match left column height */}
            <div className="fade-in-up fade-in-up-2" style={{ display: 'flex', flexDirection: 'column' }}>
              {weather?.history && weather.history.length > 1 ? (
                <div className="glass" style={{ borderRadius: 'var(--radius-widget)', flex: 1 }}>
                  <TemperatureChart data={weather.history} />
                </div>
              ) : (
                <div className="glass" style={{
                  borderRadius:   'var(--radius-widget)',
                  padding:        '48px 32px',
                  textAlign:      'center',
                  fontSize:       '0.875rem',
                  color:          'var(--text-muted)',
                  minHeight:      '200px',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                }}>
                  {loading ? 'Loading history…' : 'No history yet — sync to fetch data.'}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
