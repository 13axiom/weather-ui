# weather-ui

Next.js 14 frontend for the Weather Dashboard project.

Displays weather data and air quality information fetched from the [weather-api](https://github.com/13axiom/weather-api) Go backend.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** CSS custom properties + glassmorphism (no Tailwind config required)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Theme:** next-themes (dark / light)
- **Testing:** Jest + Testing Library

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — animated globe, weather icons, entry buttons |
| `/city` | Detailed view for one city: current weather card + history chart |
| `/dashboard` | Grid of all tracked cities with expandable history charts |
| `/air` | Air Quality dashboard — AQI, pollutants, runner advice per city |

---

## Quick Start

```bash
# 1. Make sure the Go backend is running first
# See weather-api/README.md

# 2. Install dependencies
npm install

# 3. Copy and edit the env file
cp .env.local.example .env.local
# → Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_INTERNAL_KEY (see below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Go backend base URL |
| `NEXT_PUBLIC_INTERNAL_KEY` | _(empty)_ | Shared secret for air quality endpoints |

### About the Internal Key

The `NEXT_PUBLIC_INTERNAL_KEY` is a secret shared **only** between our frontend and our backend. It protects the `/api/v1/air/*` endpoints from being called by random third parties (which would consume our OpenWeatherMap quota).

**How to set it up:**

```bash
# 1. Generate a random key (run once):
openssl rand -hex 32
# → e.g. a3f8c2d1e5b7...

# 2. Add to weather-ui/.env.local:
NEXT_PUBLIC_INTERNAL_KEY=a3f8c2d1e5b7...

# 3. Add the SAME value to weather-api/.env:
INTERNAL_API_KEY=a3f8c2d1e5b7...
```

> **Security note:** `NEXT_PUBLIC_*` variables are embedded in the browser bundle.
> This is intentional — the internal key only needs to keep out bots, not protect
> sensitive data. The actual OpenWeatherMap key (`OWM_API_KEY`) lives exclusively
> in the backend `.env` and is never sent to the browser.

---

## How data flows

```
Browser                  Go Backend (weather-api)        External APIs
  │                            │
  │── GET /api/v1/cities ──────▶  No auth required       Open-Meteo (free)
  │── GET /api/v1/weather/{c} ─▶  No auth required       Open-Meteo (free)
  │
  │── GET /api/v1/air          ─▶  Checks X-Internal-Key  OpenWeatherMap
  │   (+ X-Internal-Key header)    if ok → returns data   (OWM_API_KEY kept
  │                                                        server-side only)
```

---

## Project Structure

```
app/
  page.tsx              — Landing page (animated globe)
  city/page.tsx         — City detail view
  dashboard/page.tsx    — All cities grid
  air/page.tsx          — Air quality dashboard
  globals.css           — Global styles, CSS custom properties, animations
  layout.tsx            — Root layout (ThemeProvider, Navbar, fonts)

components/
  Navbar.tsx            — Sticky top nav with theme toggle
  ThemeToggle.tsx       — Animated dark/light pill slider
  Breadcrumb.tsx        — Page breadcrumbs
  CitySelector.tsx      — City search input + pill buttons (split exports)
  WeatherCard.tsx       — Current weather card with 3×2 stat grid
  CityWidget.tsx        — Compact weather card for dashboard grid
  TemperatureChart.tsx  — Recharts line/bar chart with toggle
  AQIWidget.tsx         — Air quality widget with AQI bar + pollutants
  LastSyncBadge.tsx     — "Data as of HH:MM · Xm ago" indicator

lib/
  api.ts                — All backend calls (public + protected with internal key)
  theme.ts              — CSS custom property values from theme.config.json

types/
  weather.ts            — City, WeatherSnapshot, WeatherResponse, SyncResult
  air_quality.ts        — AirQualitySnapshot, AirQualityResponse, AQI types

__tests__/              — Jest unit tests
```

---

## Running Tests

```bash
npm test
```

---

## Building for Production

```bash
npm run build
npm start
```

---

## Adding a New City

Cities are managed by the backend. Edit `DEFAULT_CITIES` in `weather-api/.env`:

```
DEFAULT_CITIES=Moscow,London,New York,Tokyo,Sydney,Limassol
```

Restart the Go server — it will geocode the new city automatically and start syncing data.
