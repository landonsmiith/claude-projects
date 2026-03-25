# TripForge 🌍

An AI-powered trip planning web application built with React, Vite, Express, and Claude AI.

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, shadcn/ui, Framer Motion, Zustand, TanStack Query
- **Backend:** Node.js + Express
- **Database:** SQLite via Drizzle ORM
- **Maps:** Leaflet + OpenStreetMap (optional: Mapbox GL JS)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Search:** Brave Search API or SerpAPI

## Quick Start

### 1. Clone & install dependencies

```bash
npm install
npm install --workspace=client
npm install --workspace=server
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and add your API keys
```

**Required:**
- `ANTHROPIC_API_KEY` — Get at https://console.anthropic.com

**Optional (gracefully degraded without):**
- `OPENCAGE_API_KEY` — https://opencagedata.com (geocoding for geo-intelligence)
- `OPENWEATHER_API_KEY` — https://openweathermap.org (weather per day)
- `BRAVE_SEARCH_API_KEY` — https://brave.com/search/api (events search)

**Affiliate IDs (all optional, personal use):**
- `BOOKING_AFFILIATE_ID` — https://www.booking.com/affiliate-program
- `SKYSCANNER_AFFILIATE_ID` — https://www.partners.skyscanner.net
- `GYG_PARTNER_ID` — https://partner.getyourguide.com
- `VIATOR_AFFILIATE_ID` — https://www.viator.com/affiliates

### 3. Copy env to client

Create `client/.env.local`:
```
VITE_AFFILIATE_MODE=true
VITE_BOOKING_AFFILIATE_ID=your_id
VITE_SKYSCANNER_AFFILIATE_ID=your_id
VITE_GYG_PARTNER_ID=your_id
VITE_VIATOR_AFFILIATE_ID=your_id
VITE_AIRALO_AFFILIATE_ID=your_id
```

### 4. Run the app

```bash
npm run dev
```

Opens:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
tripforge/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── wizard/        # 4-step setup wizard
│       │   ├── dashboard/     # Trip board, day cards, tabs
│       │   └── ui/            # shadcn/ui base components
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # affiliates.js, api.js, dateUtils.js
│       ├── pages/             # LandingPage, WizardPage, BoardPage
│       └── store/             # Zustand store
├── server/                    # Express API
│   ├── routes/                # /api/recommendations, /geo, /trips...
│   ├── services/              # claudeService, geoService, weatherService
│   └── db/                    # SQLite via Drizzle ORM
├── data/                      # SQLite database (auto-created)
├── .env.example
└── README.md
```

## Features

### Wizard (4 steps)
1. **Trip Basics** — Origin, dates, travelers, budget
2. **Day-by-Day Planner** — Location per day (country/region/city), travel type badges
3. **Already Booked** — Mark booked flights/hotels to skip recommendations
4. **Preferences** — Interests, dietary restrictions, affiliate mode toggle

### Trip Board
- **Getting There** tab — Flight & ground transport options with affiliate deep-links
- **Stay** tab — Hotel, hostel, and Airbnb options with Booking.com links
- **Explore** tab — Claude AI activity recommendations with geographic intelligence
- **Events** tab — Live event search for each location/date
- **Deals** tab — Travel insurance, eSIM, car rental, credit cards

### Geographic Intelligence Engine
Claude recommendations are geo-aware:
- Coastal detection → beach activities only when near water
- Climate zones → no beach recs in arctic, prioritise aurora/fjords
- Elevation > 1500m → hiking/skiing prioritised
- City population > 1M → nightlife, rooftop bars, metro tips added

### Affiliate Link Engine (`/client/src/lib/affiliates.js`)
Centralised utility for building affiliate deep-links to:
- Booking.com, Skyscanner, GetYourGuide, Viator, Hostelworld, Airbnb
- Airalo (eSIM), World Nomads (insurance), Rentalcars.com

Toggle `VITE_AFFILIATE_MODE=false` to share clean links.

### Share Feature
- "Share Trip" button generates a read-only public URL
- Public view has same UI with your affiliate IDs embedded
- Viewers can "Edit a copy" to fork into their own session

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/recommendations/activities` | POST | Claude AI activity recs |
| `/api/recommendations/sub-regions` | POST | Sub-region suggestions |
| `/api/recommendations/festivals` | POST | Local festival lookup |
| `/api/geo/resolve` | POST | Geocode a location |
| `/api/geo/distance` | POST | Distance + travel mode |
| `/api/weather` | POST | Weather for location/date |
| `/api/search/events` | POST | Search events (Brave/SerpAPI) |
| `/api/trips` | POST | Save a trip |
| `/api/trips/:id` | GET/PUT/DELETE | Trip CRUD |
| `/api/trips/:id/share` | POST | Generate share URL |
