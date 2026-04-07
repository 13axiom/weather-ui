'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';

// ── Types ──────────────────────────────────────────────────────────────────
interface Race {
  id: number;
  title: string;
  race_date: string;
  end_date: string | null;
  location: string;
  region: string;
  country: string;
  distances: string;
  url: string;
  source: string;
  synced_at: string;
}

type Region = '' | 'spb' | 'cyprus';

const REGIONS: { value: Region; label: string }[] = [
  { value: '',       label: 'All Regions'    },
  { value: 'spb',    label: 'St. Petersburg' },
  { value: 'cyprus', label: 'Cyprus'         },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Ensure URL has a scheme — old DB records may have bare domains.
function safeUrl(url: string) {
  if (!url) return '';
  const lo = url.toLowerCase();
  if (lo.startsWith('http://') || lo.startsWith('https://')) return url;
  return 'https://' + url;
}

function regionColor(region: string) {
  return region === 'spb' ? '#7c3aed' : '#0891b2';
}
function regionLabel(region: string) {
  return region === 'spb' ? 'St. Petersburg' : 'Cyprus';
}
function isPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

// ── Pill button (shared style) ─────────────────────────────────────────────
function Pill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: '999px',
        border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
        background: active
          ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
          : 'var(--surface)',
        color: active ? '#fff' : 'var(--text-muted)',
        fontWeight: active ? 700 : 500,
        fontSize: '0.82rem',
        cursor: 'pointer',
        boxShadow: active ? '0 0 10px var(--color-primary-glow)' : 'none',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function RunningCalendarPage() {
  const [races, setRaces]       = useState<Race[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [region, setRegion]     = useState<Region>('');
  const [showPast, setShowPast] = useState(false);
  const [syncing, setSyncing]   = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_RACES_API_URL || 'http://localhost:8081';
  const apiKey = process.env.NEXT_PUBLIC_INTERNAL_KEY  || '';

  const fetchRaces = useCallback(async (r: Region) => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch all from DB (upcoming=false), filter past on the client
      const params = new URLSearchParams({ limit: '200', upcoming: 'false' });
      if (r) params.set('region', r);

      const res = await fetch(`${apiUrl}/api/v1/races?${params}`, {
        headers: apiKey ? { 'X-Internal-Key': apiKey } : {},
      });
      if (!res.ok) throw new Error(`API error: HTTP ${res.status}`);
      const data: Race[] = await res.json();
      setRaces(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load races');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, apiKey]);

  useEffect(() => {
    fetchRaces(region);
  }, [region, fetchRaces]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch(`${apiUrl}/api/v1/races/sync`, {
        method: 'POST',
        headers: apiKey ? { 'X-Internal-Key': apiKey } : {},
      });
      await fetchRaces(region);
    } catch {
      // ignore — stale data still shows
    } finally {
      setSyncing(false);
    }
  };

  const visible     = showPast ? races : races.filter(r => !isPast(r.race_date));
  const spbRaces    = visible.filter(r => r.region === 'spb');
  const cyprusRaces = visible.filter(r => r.region === 'cyprus');

  return (
    <>
      <Navbar />
      <div style={{ padding: '28px 100px', minHeight: '100vh' }}>

        {/* ── Page header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '2px',
              lineHeight: 1.2,
            }}>
              Running Calendar
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              St. Petersburg &amp; Cyprus · AIMS World Running
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: '7px 18px',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              background: syncing ? 'var(--border-color)' : 'var(--surface)',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: syncing ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {syncing ? '⟳ Syncing…' : '⟳ Sync Now'}
          </button>
        </div>

        {/* ── Filters row ── */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {REGIONS.map(r => (
            <Pill key={r.value} active={region === r.value} onClick={() => setRegion(r.value)}>
              {r.label}
            </Pill>
          ))}
          <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px', alignSelf: 'stretch' }} />
          {/* Single toggle for past events */}
          <button
            onClick={() => setShowPast(p => !p)}
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              border: showPast ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
              background: showPast ? 'var(--color-primary-glow)' : 'transparent',
              color: showPast ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {showPast ? '✓ ' : ''}Show past events
          </button>
        </div>

        {/* ── States ── */}
        {loading && <RacesSkeleton />}

        {!loading && error && (
          <div style={{
            padding: '28px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            background: 'rgba(239,68,68,0.08)',
            color: '#fca5a5',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⚠️</div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Could not load races</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>{error}</div>
            <div style={{ fontSize: '0.78rem', marginTop: '8px', opacity: 0.6 }}>
              Make sure races-api is running on port 8081
            </div>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div style={{
            padding: '40px 28px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface)',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🗓️</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>No races found</div>
            <div style={{ fontSize: '0.82rem' }}>
              Click "Sync Now" to pull latest data from AIMS
            </div>
          </div>
        )}

        {/* ── Race grid ── */}
        {!loading && !error && visible.length > 0 && (
          region === '' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              <ScrollableColumn
                title="St. Petersburg"
                count={spbRaces.length}
                races={spbRaces}
              />
              <ScrollableColumn
                title="Cyprus"
                count={cyprusRaces.length}
                races={cyprusRaces}
              />
            </div>
          ) : (
            <div style={{ maxWidth: '620px' }}>
              <ScrollableColumn
                title={REGIONS.find(r => r.value === region)?.label ?? ''}
                count={visible.length}
                races={visible}
              />
            </div>
          )
        )}

        {/* ── Footer note ── */}
        {!loading && !error && visible.length > 0 && (
          <div style={{
            marginTop: '24px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>📡</span>
            <span>
              Data from{' '}
              <a href="https://aims-worldrunning.org" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--color-primary)' }}>
                AIMS World Running
              </a>
              {' '}· {visible.length} events shown · synced every 24 h
            </span>
          </div>
        )}
      </div>
    </>
  );
}

// ── Scrollable column ──────────────────────────────────────────────────────
// Shows 5 cards at once (~72px each), scrolls for more.
const CARD_HEIGHT = 88;   // px — compact card height
const VISIBLE     = 5;    // cards visible without scrolling
const COL_MAX_H   = CARD_HEIGHT * VISIBLE + 4 * 6; // cards + gaps

function ScrollableColumn({
  title, count, races,
}: { title: string; count: number; races: Race[] }) {
  return (
    <div>
      {/* Column header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
        <span style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          background: 'var(--border-color)',
          borderRadius: '999px',
          padding: '1px 8px',
          fontWeight: 600,
        }}>
          {count}
        </span>
      </div>

      {count === 0 ? (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
          borderRadius: '10px',
          border: '1px dashed var(--border-color)',
        }}>
          No events
        </div>
      ) : (
        <div style={{
          maxHeight: `${COL_MAX_H}px`,
          overflowY: count > VISIBLE ? 'auto' : 'visible',
          paddingRight: count > VISIBLE ? '4px' : '0',
          // Custom scrollbar
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-color) transparent',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {races.map(race => <CompactRaceCard key={race.id} race={race} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Compact race card (fits ~72-88px tall) ─────────────────────────────────
function CompactRaceCard({ race }: { race: Race }) {
  const [hovered, setHovered] = useState(false);
  const past = isPast(race.race_date);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${hovered ? 'var(--color-primary)' : 'var(--border-color)'}`,
        background: hovered ? 'var(--color-primary-glow)' : 'var(--surface)',
        opacity: past ? 0.6 : 1,
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minHeight: `${CARD_HEIGHT}px`,
        boxSizing: 'border-box',
      }}
    >
      {/* Top row: date + region badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {past ? '✓ ' : ''}{formatDate(race.race_date)}
        </span>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          background: regionColor(race.region),
          color: '#fff',
          padding: '1px 8px',
          borderRadius: '999px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {regionLabel(race.region)}
        </span>
      </div>

      {/* Title */}
      <div style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.3,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {race.title}
      </div>

      {/* Bottom row: location + distances + link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
        {race.location && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📍 {race.location}
          </span>
        )}
        {race.distances && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            🏃 {race.distances}
          </span>
        )}
        {race.url && (
          <a
            href={safeUrl(race.url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textDecoration: 'none',
              padding: '2px 10px',
              border: '1px solid var(--color-primary)',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            →
          </a>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function RacesSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {[0, 1].map(col => (
        <div key={col}>
          <div style={{ height: 12, width: '40%', borderRadius: 6, background: 'var(--border-color)', marginBottom: 14 }} />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              height: `${CARD_HEIGHT}px`,
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--surface)',
              marginBottom: 6,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ height: 10, width: '45%', borderRadius: 4, background: 'var(--border-color)' }} />
              <div style={{ height: 13, width: '85%', borderRadius: 4, background: 'var(--border-color)' }} />
              <div style={{ height: 10, width: '60%', borderRadius: 4, background: 'var(--border-color)', marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
