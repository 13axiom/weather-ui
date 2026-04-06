import { render, screen } from '@testing-library/react';
import WeatherCard from '@/components/WeatherCard';
import type { WeatherSnapshot } from '@/types/weather';

const mockSnapshot: WeatherSnapshot = {
  id: 1,
  city_id: 1,
  temperature: 20.5,
  windspeed: 12.3,
  precipitation: 0.0,
  weather_code: 1,
  recorded_at: '2024-01-15T12:00:00Z',
  synced_at: '2024-01-15T12:01:00Z',
};

describe('WeatherCard', () => {
  it('renders city name', () => {
    render(<WeatherCard snapshot={mockSnapshot} cityName="Moscow" />);
    expect(screen.getByText('Moscow')).toBeInTheDocument();
  });

  it('renders temperature', () => {
    render(<WeatherCard snapshot={mockSnapshot} cityName="Moscow" />);
    expect(screen.getByText('20.5')).toBeInTheDocument();
  });

  it('renders wind speed', () => {
    render(<WeatherCard snapshot={mockSnapshot} cityName="Moscow" />);
    expect(screen.getByText('12.3 km/h')).toBeInTheDocument();
  });

  it('renders weather label for code 1', () => {
    render(<WeatherCard snapshot={mockSnapshot} cityName="Moscow" />);
    expect(screen.getByText('Mainly clear')).toBeInTheDocument();
  });
});
