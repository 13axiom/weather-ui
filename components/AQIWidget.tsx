'use client';

import type { AirQualitySnapshot } from '@/types/air_quality';

/** Colour for each OWM AQI level. Matches backend models.AQILevel. */
const AQI_META: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Good',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  2: { label: 'Fair',      color: '#84cc16', bg: 'rgba(132,204,22,0.12)' },
  3: { label: 'Moderate',  color: '#eab308', bg: 'rgba(234,179,8,0.12)'  },
  4: { label: 'Poor',      color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  5: { label: 'Very Poor', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
};

interface Props {
  cityName: string;
  snapshot: AirQualitySnapshot | null;
  loading?: boolean;
}

export default function AQIWidget({ cityName, snapshot, loading = false }: Props) {
  const meta = AQI_META[snapshot?.aqi ?? 1] ?? AQI_META[1];

  if (loading) {
    return (
      <div className="neon-widget h-full">
        <div className="neon-widget-inner glass animate-pulse" style={{ padding: '11px', minHeight: '140px' }} />
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="neon-widget h-full">
        <div className="neon-widget-inner glass" style={{ padding: '11px', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No AQ data yet — sync to fetch
          </p>
        </div>
      </div>
    );
  }

  const pollutants = [
    { label: 'PM2.5', value: snapshot.pm2_5.toFixed(1), unit: 'µg/m³', note: 'Fine particles' },
    { label: 'PM10',  value: snapshot.pm10.toFixed(1),  unit: 'µg/m³', note: 'Coarse particles' },
    { label: 'O₃',    value: snapshot.o3.toFixed(1),    unit: 'µg/m³', note: 'Ozone' },
    { label: 'NO₂',   value: snapshot.no2.toFixed(1),   unit: 'µg/m³', note: 'Nitrogen dioxide' },
    { label: 'SO₂',   value: snapshot.so2.toFixed(1),   unit: 'µg/m³', note: 'Sulphur dioxide' },
    { label: 'CO',    value: (snapshot.co / 1000).toFixed(2), unit: 'mg/m³', note: 'Carbon monoxide' },
  ];

  return (
    <div className="neon-widget h-full">
      <div
        className="neon-widget-inner glass"
        style={{ padding: '11px', display: 'flex', flexDirection: 'column', gap: '10px', userSelect: 'none' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)', margin: 0,
            }}>
              {cityName}
            </p>
            <p style={{
              fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0',
            }}>
              Air Quality Index
            </p>
          </div>

          {/* AQI score badge */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            padding:       '6px 14px',
            borderRadius:  '12px',
            background:    meta.bg,
            border:        `1px solid ${meta.color}`,
            boxShadow:     `0 0 10px ${meta.bg}`,
            flexShrink:    0,
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: meta.color, lineHeight: 1 }}>
              {snapshot.aqi}
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: meta.color, marginTop: '2px' }}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* AQI bar */}
        <AQIBar aqi={snapshot.aqi} color={meta.color} />

        {/* Pollutants — 3 × 2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {pollutants.map(({ label, value, unit }) => (
            <div key={label} style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border-color)',
              borderRadius: '8px',
              padding:      '6px 8px',
              textAlign:    'center',
            }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', margin: '2px 0 0 0' }}>{value}</p>
              <p style={{ fontSize: '0.58rem', color: 'var(--text-muted)', margin: 0 }}>{unit}</p>
            </div>
          ))}
        </div>

        {/* Running recommendation */}
        <RunningTip aqi={snapshot.aqi} />
      </div>
    </div>
  );
}

/** Horizontal gradient bar showing where the current AQI falls. */
function AQIBar({ aqi, color }: { aqi: number; color: string }) {
  const pct = ((aqi - 1) / 4) * 100; // 1→0%, 5→100%
  return (
    <div style={{ position: 'relative', height: '6px', borderRadius: '999px', background: 'var(--border-color)' }}>
      {/* Gradient track */}
      <div style={{
        position:     'absolute', inset: 0, borderRadius: '999px',
        background:   'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)',
        opacity:      0.3,
      }} />
      {/* Indicator dot */}
      <div style={{
        position:     'absolute',
        top:          '50%',
        left:         `${pct}%`,
        transform:    'translate(-50%, -50%)',
        width:        '12px', height: '12px',
        borderRadius: '50%',
        background:   color,
        boxShadow:    `0 0 6px ${color}`,
        border:       '2px solid var(--surface)',
      }} />
    </div>
  );
}

/** Short advice for runners based on AQI. */
function RunningTip({ aqi }: { aqi: number }) {
  const tips: Record<number, { icon: string; text: string; color: string }> = {
    1: { icon: '🏃', text: 'Great day for a run!',             color: '#22c55e' },
    2: { icon: '🏃', text: 'Good for outdoor running.',        color: '#84cc16' },
    3: { icon: '⚠️', text: 'Sensitive groups should limit exercise.', color: '#eab308' },
    4: { icon: '😷', text: 'Avoid prolonged outdoor exercise.', color: '#f97316' },
    5: { icon: '🚫', text: 'Stay indoors — air is unhealthy.',  color: '#ef4444' },
  };
  const tip = tips[aqi] ?? tips[3];
  return (
    <div style={{
      display:      'flex', alignItems: 'center', gap: '6px',
      padding:      '6px 10px', borderRadius: '8px',
      background:   'var(--surface)', border: `1px solid ${tip.color}33`,
      fontSize:     '0.72rem', color: tip.color, fontWeight: 500,
    }}>
      <span>{tip.icon}</span>
      <span>{tip.text}</span>
    </div>
  );
}
