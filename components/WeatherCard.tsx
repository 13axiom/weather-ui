'use client';

import type { WeatherSnapshot } from '@/types/weather';

const WEATHER_LABELS: Record<number, { label: string; emoji: string }> = {
  0:  { label: 'Clear sky',          emoji: '☀️'  },
  1:  { label: 'Mainly clear',       emoji: '🌤️' },
  2:  { label: 'Partly cloudy',      emoji: '⛅'  },
  3:  { label: 'Overcast',           emoji: '☁️'  },
  45: { label: 'Foggy',              emoji: '🌫️' },
  48: { label: 'Icy fog',            emoji: '🌫️' },
  51: { label: 'Light drizzle',      emoji: '🌦️' },
  53: { label: 'Moderate drizzle',   emoji: '🌦️' },
  55: { label: 'Dense drizzle',      emoji: '🌧️' },
  61: { label: 'Slight rain',        emoji: '🌧️' },
  63: { label: 'Moderate rain',      emoji: '🌧️' },
  65: { label: 'Heavy rain',         emoji: '🌧️' },
  71: { label: 'Slight snow',        emoji: '🌨️' },
  73: { label: 'Moderate snow',      emoji: '❄️'  },
  75: { label: 'Heavy snow',         emoji: '❄️'  },
  80: { label: 'Slight showers',     emoji: '🌦️' },
  81: { label: 'Moderate showers',   emoji: '🌧️' },
  82: { label: 'Violent showers',    emoji: '⛈️' },
  95: { label: 'Thunderstorm',       emoji: '⛈️' },
  99: { label: 'Hail storm',         emoji: '⛈️' },
};

interface Props {
  snapshot: WeatherSnapshot;
  cityName: string;
  fullHeight?: boolean;
}

export default function WeatherCard({ snapshot, cityName, fullHeight = false }: Props) {
  const { label, emoji } = WEATHER_LABELS[snapshot.weather_code] ?? {
    label: 'Unknown',
    emoji: '🌡️',
  };

  const temp     = (snapshot.temperature_2m ?? snapshot.temperature ?? 0).toFixed(1);
  const wind     = (snapshot.windspeed_10m  ?? snapshot.windspeed   ?? 0).toFixed(1);
  const precip   = (snapshot.precipitation  ?? 0).toFixed(1);
  const feels    = snapshot.apparent_temperature?.toFixed(1) ?? '—';
  const humidity = snapshot.relative_humidity_2m ?? '—';
  const updated  = new Date(snapshot.recorded_at).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  // 6 stats → 2 rows × 3 cols
  const stats = [
    { icon: '🌡️', label: 'Feels like',   value: `${feels}°C`,    color: 'var(--color-primary)'   },
    { icon: '💧',  label: 'Humidity',     value: `${humidity}%`,  color: 'var(--color-secondary)' },
    { icon: '💨',  label: 'Wind',         value: `${wind} km/h`,  color: 'var(--color-secondary)' },
    { icon: '🌧️', label: 'Precipitation',value: `${precip} mm`,  color: 'var(--color-accent)'    },
    { icon: '🏷️', label: 'Condition',    value: label,            color: 'var(--color-primary)'   },
    { icon: '🕐',  label: 'Updated',      value: updated,         color: 'var(--text-muted)'      },
  ];

  return (
    <div
      className="glass fade-in-up"
      style={{
        borderRadius: 'var(--radius-widget)',
        padding:      '24px',
        ...(fullHeight ? { height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } : {}),
      }}
    >
      {/* Top row — city label + emoji */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', margin: 0 }}>
            {cityName}
          </p>
        </div>
        <span role="img" aria-label={label} style={{ fontSize: '3rem', lineHeight: 1 }}>
          {emoji}
        </span>
      </div>

      {/* Temperature hero */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
        <span
          className="theme-heading"
          style={{ fontSize: 'clamp(2.8rem, 10vw, 4.5rem)', lineHeight: 1 }}
        >
          {temp}
        </span>
        <div>
          <span style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>°C</span>
          <p style={{ marginTop: '4px' }} className="badge badge-primary">{label}</p>
        </div>
      </div>

      {/* Stat grid — 3 columns × 2 rows, inline styles */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:                 '8px',
        marginTop:           fullHeight ? 'auto' : '0',
      }}>
        {stats.map(({ icon, label: statLabel, value, color }) => (
          <StatTile key={statLabel} icon={icon} label={statLabel} value={value} color={color} />
        ))}
      </div>
    </div>
  );
}

function StatTile({
  icon, label, value, color,
}: { icon: string; label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background:      'var(--surface)',
        border:          '1px solid var(--border-color)',
        borderRadius:    '12px',
        padding:         '10px 12px',
        display:         'flex',
        alignItems:      'center',
        gap:             '8px',
        cursor:          'default',
        transition:      'transform 0.2s ease',
        transformOrigin: 'center center',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </p>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
