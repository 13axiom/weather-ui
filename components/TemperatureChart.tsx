'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { WeatherSnapshot } from '@/types/weather';

interface Props {
  history: WeatherSnapshot[];
}

export default function TemperatureChart({ history }: Props) {
  // Reverse so oldest → newest (left → right on chart)
  const data = [...history].reverse().map((s) => ({
    time: new Date(s.recorded_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    temp: parseFloat(s.temperature.toFixed(1)),
    wind: parseFloat(s.windspeed.toFixed(1)),
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center text-slate-400">
        No history data yet — sync more data points first.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-semibold text-slate-700 mb-5">Temperature History</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis
            yAxisId="temp"
            tick={{ fontSize: 11, fill: '#3b82f6' }}
            unit="°"
            width={36}
          />
          <YAxis
            yAxisId="wind"
            orientation="right"
            tick={{ fontSize: 11, fill: '#f59e0b' }}
            unit=" km/h"
            width={52}
          />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === 'temp' ? [`${value}°C`, 'Temperature'] : [`${value} km/h`, 'Wind']
            }
          />
          <Legend
            formatter={(value) => (value === 'temp' ? 'Temperature' : 'Wind speed')}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temp"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="wind"
            type="monotone"
            dataKey="wind"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
