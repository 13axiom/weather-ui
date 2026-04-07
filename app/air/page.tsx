'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCities, getAllCitiesAQ, triggerAQSync } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import AQIWidget from '@/components/AQIWidget';
import LastSyncBadge from '@/components/LastSyncBadge';
import type { City } from '@/types/weather';
import type { AirQualitySnapshot, AirQualitySyncResult } from '@/types/air_quality';

interface CityAQData {
  city: City;
  snapshot: AirQualitySnapshot | null;
  loading: boolean;
}

export default function AirQualityPage() {
  const [cityData, setCityData]       = useState<CityAQData[]>([]);
  const [syncing, setSyncing]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<AirQualitySyncResult[] | null>(null);

  const loadAll = useCallback(async (cities: City[]) => {
    try {
      const snapshots = await getAllCitiesAQ();
      const byCity = Object.fromEntries(snapshots.map(s => [s.city_id, s]));
      setCityData(cities.map(city => ({
        city,
        snapshot: byCity[city.id] ?? null,
        loading:  false,
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load air quality data');
      setCityData(cities.map(city => ({ city, snapshot: null, loading: false })));
    }
  }, []);

  useEffect(() => {
    getCities()
      .then(cities => {
        setCityData(cities.map(city => ({ city, snapshot: null, loading: true })));
        loadAll(cities);
      })
      .catch(() => setError('Could not connect to backend. Is the Go server running?'));
  }, [loadAll]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResults(null);
    setError(null);
    try {
      const results = await triggerAQSync();
      setSyncResults(results);
      const cities = cityData.map(cd => cd.city);
      setCityData(cities.map(city => ({ city, snapshot: null, loading: true })));
      await loadAll(cities);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  // Latest synced_at across all cities
  const lastSync = cityData.find(cd => cd.snapshot?.synced_at)?.snapshot?.synced_at;

  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '32px 100px' }}>
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Air Quality' }]} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                Air Quality
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Powered by OpenWeatherMap · AQI 1 (Good) → 5 (Very Poor) · Includes runner advice
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LastSyncBadge syncedAt={lastSync} />
              <button onClick={handleSync} disabled={syncing} className="btn-neon">
                <span style={{ display: 'inline-block' }} className={syncing ? 'animate-spin' : ''}>⟳</span>
                {syncing ? ' Syncing…' : ' Sync All'}
              </button>
            </div>
          </div>

          {/* Notifications */}
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

          {/* AQI grid — same 3-column layout as dashboard */}
          {cityData.length === 0 && !error && (
            <div className="glass" style={{ borderRadius: 'var(--radius-widget)', padding: '48px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Loading cities…
            </div>
          )}

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px', padding: '12px', margin: '-12px',
          }}>
            {cityData.map(({ city, snapshot, loading }, i) => (
              <div key={city.id} className="fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <AQIWidget cityName={city.name} snapshot={snapshot} loading={loading} />
              </div>
            ))}
          </div>

        </main>
      </div>
    </>
  );
}
