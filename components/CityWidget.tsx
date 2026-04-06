'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherSnapshot } from '@/types/weather';
import TemperatureChart from './TemperatureChart';

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
  cityName: string;
  latest: WeatherSnapshot | null;
  history: WeatherSnapshot[];
}

export default function CityWidget({ cityName, latest, history }: Props) {
  const [expanded, setExpanded] = useState(false);

  const weather = WEATHER_LABELS[latest?.weather_code ?? -1] ?? {
    label: 'Unknown',
    emoji: '🌡️',
  };

  // Fallback to plain `temperature` / `windspeed` if _2m / _10m variants absent
  const temp     = (latest?.temperature_2m     ?? latest?.temperature ?? null)?.toFixed(1) ?? '—';
  const wind     = (latest?.windspeed_10m      ?? latest?.windspeed   ?? null)?.toFixed(1) ?? '—';
  const humidity = latest?.relative_humidity_2m ?? '—';
  const feels    = (latest?.apparent_temperature ?? null)?.toFixed(1) ?? '—';

  return (
    <div className="neon-widget h-full">
      <div
        className="neon-widget-inner glass"
        onClick={() => setExpanded(v => !v)}
        style={{
          padding:    '11px',          /* 3 mm ≈ 11 px on all sides */
          display:    'flex',
          flexDirection: 'column',
          gap:        '10px',
          cursor:     'pointer',
          userSelect: 'none',
        }}
      >
        {/* Header: city name + temp on left, big emoji on right */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize:      '0.75rem',
              fontWeight:    500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color:         'var(--text-muted)',
              margin:        0,
              lineHeight:    1.2,
            }}>
              {cityName}
            </p>
            {/* Temperature */}
            <p style={{
              fontSize:   '2.5rem',
              lineHeight: 1,
              fontWeight: 700,
              color:      'var(--heading-color)',
              margin:     '4px 0 0 0',
              letterSpacing: '-0.03em',
            }}>
              {temp}°C
            </p>
          </div>

          {/* Weather emoji: ~3× bigger than original 36px → 6rem */}
          <span
            role="img"
            aria-label={weather.label}
            style={{ fontSize: '3rem', lineHeight: 1, flexShrink: 0 }}
          >
            {weather.emoji}
          </span>
        </div>

        {/* Condition badge */}
        <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
          {weather.label}
        </span>

        {/* Stats */}
        <div style={{ marginTop: '2px' }}>
          <div className="stat-row">
            <span className="stat-label">Feels like</span>
            <span className="stat-value">{feels}°C</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Humidity</span>
            <span className="stat-value">{humidity}%</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Wind</span>
            <span className="stat-value">{wind} km/h</span>
          </div>
        </div>

        {/* Expand hint */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '4px',
          marginTop:      'auto',
          paddingTop:     '4px',
          color:          'var(--text-muted)',
          fontSize:       '0.72rem',
        }}>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'inline-block' }}
          >
            ▼
          </motion.span>
          <span>{expanded ? 'Hide chart' : 'Show history'}</span>
        </div>

        {/* Expanded chart */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="chart"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="chart-wrap" style={{ paddingTop: '12px' }}>
                <TemperatureChart data={history} compact />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
