'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line,
  BarChart,  Bar,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { WeatherSnapshot } from '@/types/weather';

interface Props {
  data?: WeatherSnapshot[];   // preferred (new API)
  history?: WeatherSnapshot[]; // legacy alias
  compact?: boolean;           // inside CityWidget accordion
}

const CHART_OPTIONS = [
  { type: 'line' as const, icon: '〰', label: 'Line' },
  { type: 'bar'  as const, icon: '▐', label: 'Bar'  },
];

function ChartToggle({
  chartType,
  onChange,
  compact = false,
}: {
  chartType: 'line' | 'bar';
  onChange: (t: 'line' | 'bar') => void;
  compact?: boolean;
}) {
  return (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      gap:           '4px',
      padding:       '4px',
      borderRadius:  '999px',
      background:    'var(--surface)',
      border:        '1px solid var(--border-color)',
      backdropFilter:'blur(8px)',
    }}>
      {CHART_OPTIONS.map(({ type, icon, label }) => {
        const active = chartType === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           '5px',
              padding:       compact ? '4px 10px' : '5px 14px',
              borderRadius:  '999px',
              fontSize:      compact ? '0.72rem' : '0.78rem',
              fontWeight:    600,
              border:        active ? '1px solid var(--color-primary)' : '1px solid transparent',
              background:    active
                ? 'linear-gradient(135deg, var(--color-primary-glow, rgba(99,102,241,0.25)), var(--color-primary-glow, rgba(99,102,241,0.1)))'
                : 'transparent',
              color:         active ? 'var(--color-primary)' : 'var(--text-muted)',
              cursor:        'pointer',
              transition:    'all 0.2s ease',
              boxShadow:     active ? '0 0 8px var(--color-primary-glow, rgba(99,102,241,0.4))' : 'none',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              whiteSpace:    'nowrap',
            }}
          >
            <span style={{ fontSize: compact ? '0.8rem' : '0.9rem', lineHeight: 1 }}>{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function TemperatureChart({ data, history, compact = false }: Props) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // On mobile (≤ 430 px) always use bar chart
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 430px)');
    if (mq.matches) setChartType('bar');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setChartType('bar');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const source = data ?? history ?? [];

  const chartData = [...source].reverse().map((s) => ({
    time: new Date(s.recorded_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    temp: parseFloat((s.temperature_2m ?? s.temperature ?? 0).toFixed(1)),
    wind: parseFloat((s.windspeed_10m ?? s.windspeed ?? 0).toFixed(1)),
  }));

  const height = compact ? 180 : 260;

  const tooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    color: 'var(--text)',
    fontSize: '0.8rem',
    backdropFilter: 'blur(8px)',
  };

  const commonProps = {
    data: chartData,
    margin: { top: 4, right: compact ? 4 : 12, bottom: 0, left: compact ? -16 : 0 },
  };

  const axisProps = {
    tick: { fontSize: compact ? 10 : 11, fill: 'var(--text-muted)' },
  };

  if (chartData.length === 0) {
    return (
      <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        No data yet — wait for the next sync.
      </div>
    );
  }

  const ChartWrapper = chartType === 'line' ? LineChart : BarChart;

  return (
    <div style={compact
      ? { padding: '12px 12px 12px 12px' }
      : { padding: '20px 20px 20px 20px' }  /* 3mm ≈ 11px, using 20px for breathing room */
    }>
      {/* Toggle — full header for non-compact */}
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <ChartToggle chartType={chartType} onChange={setChartType} />
          <h3 className="theme-heading" style={{ fontSize: '1rem', margin: 0 }}>Temperature History</h3>
        </div>
      )}

      {/* Compact toggle */}
      {compact && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
          <ChartToggle chartType={chartType} onChange={setChartType} compact />
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ChartWrapper {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis
            yAxisId="temp"
            {...axisProps}
            tick={{ ...axisProps.tick, fill: 'var(--color-primary)' }}
            unit="°"
            width={compact ? 28 : 36}
          />
          <YAxis
            yAxisId="wind"
            orientation="right"
            {...axisProps}
            tick={{ ...axisProps.tick, fill: 'var(--color-secondary)' }}
            unit=" km/h"
            width={compact ? 36 : 52}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, name: string) =>
              name === 'temp'
                ? [`${value}°C`, 'Temperature']
                : [`${value} km/h`, 'Wind']
            }
          />
          {!compact && (
            <Legend
              formatter={(value) => value === 'temp' ? 'Temperature' : 'Wind speed'}
              wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
            />
          )}

          {chartType === 'line' ? (
            <>
              <Line
                yAxisId="temp" type="monotone" dataKey="temp"
                stroke="var(--color-primary)" strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: 'var(--color-primary)' }}
              />
              <Line
                yAxisId="wind" type="monotone" dataKey="wind"
                stroke="var(--color-secondary)" strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: 'var(--color-secondary)' }}
              />
            </>
          ) : (
            <>
              <Bar
                yAxisId="temp" dataKey="temp"
                fill="var(--color-primary)" opacity={0.8}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                yAxisId="wind" dataKey="wind"
                fill="var(--color-secondary)" opacity={0.8}
                radius={[3, 3, 0, 0]}
              />
            </>
          )}
        </ChartWrapper>
      </ResponsiveContainer>
    </div>
  );
}
