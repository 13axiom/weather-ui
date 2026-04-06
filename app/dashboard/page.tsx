'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCities, getWeather, triggerSync } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import CityWidget from '@/components/CityWidget';
import LastSyncBadge from '@/components/LastSyncBadge';
import type { City, WeatherResponse, SyncResult } from '@/types/weather';

interface CityData {
  city: City;
  data: WeatherResponse | null;
  loading: boolean;
}

export default function DashboardPage() {
  const [cityData, setCityData]       = useState<CityData[]>([]);
  const [syncing, setSyncing]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);

  const loadAll = useCallback(async (cities: City[]) => {
    const updated = await Promise.all(
      cities.map(async (city) => {
        try {
          const data = await getWeather(city.name, 24);
          return { city, data, loading: false };
        } catch {
          return { city, data: null, loading: false };
        }
      })
    );
    setCityData(updated);
  }, []);

  useEffect(() => {
    getCities()
      .then((cities) => {
        setCityData(cities.map((city) => ({ city, data: null, loading: true })));
        loadAll(cities);
      })
      .catch(() => setError('Could not connect to backend. Is the Go server running?'));
  }, [loadAll]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResults(null);
    try {
      const results = await triggerSync();
      setSyncResults(results);
      const cities = cityData.map((cd) => cd.city);
      setCityData(cities.map((city) => ({ city, data: null, loading: true })));
      await loadAll(cities);
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
          flex:      1,
          maxWidth:  '1280px',
          margin:    '0 auto',
          width:     '100%',
          /* 5× the previous px-5 (20px) → 100px each side */
          padding:   '32px 100px',
        }}>
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'All Cities' }]} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                All Cities
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Click any card to expand history chart
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LastSyncBadge syncedAt={cityData.find(cd => cd.data?.current?.synced_at)?.data?.current?.synced_at} />
              <button
                onClick={handleSync}
                disabled={syncing}
                className="btn-neon"
              >
                <span style={{ display: 'inline-block' }} className={syncing ? 'animate-spin' : ''}>⟳</span>
                {syncing ? ' Syncing…' : ' Sync All'}
              </button>
            </div>
          </div>

          {/* Toasts */}
          {syncResults && (
            <div style={{
              marginBottom: '16px',
              padding:      '12px 16px',
              borderRadius: '12px',
              fontSize:     '0.875rem',
              background:   'var(--color-success)22',
              border:       '1px solid var(--color-success)',
              color:        'var(--color-success)',
            }}>
              ✓ Sync complete: {syncResults.map(r => `${r.city} (+${r.new_records})`).join(', ')}
            </div>
          )}
          {error && (
            <div style={{
              marginBottom: '16px',
              padding:      '12px 16px',
              borderRadius: '12px',
              fontSize:     '0.875rem',
              background:   'var(--color-accent-glow)',
              border:       '1px solid var(--color-accent)',
              color:        'var(--color-accent)',
            }}>
              ⚠ {error}
            </div>
          )}

          {!error && cityData.length === 0 && (
            <div className="glass" style={{
              borderRadius: 'var(--radius-widget)',
              padding:      '48px',
              textAlign:    'center',
              fontSize:     '0.875rem',
              color:        'var(--text-muted)',
            }}>
              Loading cities…
            </div>
          )}

          {/*
            Grid — 3 columns via inline styles so Tailwind breakpoints can't interfere.
            gap: 10px between cards as requested.
            padding: 12px so scale(1.02) hover effect never clips at edges.
            overflow: visible so the neon border glow is never cut off.
          */}
          <div style={{
            display:               'grid',
            gridTemplateColumns:   'repeat(3, 1fr)',
            gap:                   '10px',
            padding:               '12px',        /* breathing room for hover scale */
            margin:                '-12px',       /* cancel the padding from layout perspective */
            overflowX:             'visible',
          }}>
            {cityData.map(({ city, data, loading }, i) => (
              <div
                key={city.id}
                className="fade-in-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {loading ? (
                  <div className="neon-widget" style={{ height: '200px', opacity: 0.5 }}>
                    <div className="neon-widget-inner glass animate-pulse" style={{ height: '100%' }} />
                  </div>
                ) : (
                  <CityWidget
                    cityName={city.name}
                    latest={data?.current ?? null}
                    history={data?.history ?? []}
                  />
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
