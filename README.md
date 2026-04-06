# weather-ui

Next.js 14 frontend for the Weather Dashboard project. Displays weather data fetched from the [weather-api](https://github.com/13axiom/weather-api) Go backend.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Testing:** Jest + Testing Library

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.local.example .env.local

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** The Go backend must be running on port 8080 first.
> See [weather-api](https://github.com/13axiom/weather-api) for instructions.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL |

## Project Structure

```
app/            — Next.js App Router pages
components/     — React components
  WeatherCard        — Current weather card
  TemperatureChart   — Recharts line chart
  CitySelector       — City filter buttons
lib/
  api.ts         — Backend API client
types/
  weather.ts     — TypeScript types
__tests__/       — Jest unit tests
```

## Running Tests

```bash
npm test
```

## Building for Production

```bash
npm run build
npm start
```
