# 🌊 Chennai Flow (Syncro)

**AI-Powered Transportation & Pollution Optimization Platform for Chennai**

> Syncro proves that the right price on a road is better than closing it, and shows you exactly what that price should be — without forcing anyone anywhere.

[![Live Demo](https://img.shields.io/badge/demo-live-06b6d4?style=for-the-badge)](https://syncro-1.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**[🔗 Live Demo](https://syncro-1.vercel.app/)** · **[📦 Repository](https://github.com/xSnehank/SYNCRO1)**

---

## About

**Chennai Flow** is a data-driven mobility dashboard that models Chennai's traffic, air quality, and transit network in one place. Instead of proposing blunt interventions like road closures, it simulates *incentive-based* policy levers (transit adoption, EV uptake, signal optimization, dedicated bus lanes, freight curfews) and shows their projected impact on congestion, travel speed, and emissions — so commuters and planners can see the trade-offs before anything changes on the ground.

It combines a live city dashboard, multi-objective route planning, a pollution heatmap, a "what-if" policy simulator, a city-planner recommendation panel, and a Gemini-powered mobility advisor, all built on real Chennai geographic and transit data.

## ✨ Features

| Module | Description |
|---|---|
| 🗺️ **Live City Dashboard** | Real-time-style view of city-wide congestion index, average speed, daily CO₂/NOx/PM2.5 output, and transit modal share, plus a ranked list of traffic hotspots (OMR, Kathipara/Guindy, Porur, Central). |
| 🧭 **Smart Routes** | Multi-objective route planner (`BALANCED`, `FASTEST`, `CHEAPEST`, `LOWEST_EMISSIONS`, `LOWEST_EXPOSURE`, `LOWEST_CONGESTION`) with turn-by-turn navigation, live GPS tracking, and free-tier road-geometry routing via OSRM. |
| 🌫️ **Pollution Intelligence** | Corridor-level emissions and air-quality-sensor heatmap layered on the map, with CO₂/NOx/PM2.5 breakdowns per road segment. |
| 🧪 **What-If Simulator** | Adjust levers — private car usage, transit/metro/bus adoption, EV adoption, adaptive traffic signals, dedicated OMR bus lanes, off-peak freight restrictions — and see non-linear (BPR-based) effects on speed, congestion, delay, and emissions, both city-wide and per corridor. |
| 🏙️ **City Planner Panel** | Curated infrastructure/policy proposals (BRT corridors, intermodal hubs, adaptive signal networks, EV feeder loops, congestion pricing) with projected cost, timeline, emissions/congestion reduction, and benefit-cost ratio. |
| 🤖 **Flow AI Advisor** | Ask natural-language mobility questions and get a structured recommendation (Observation → Recommendation → Expected Impact → Confidence → Data Basis), powered by Gemini with a deterministic Chennai-domain fallback when no API key is configured. |
| 🎙️ **Voice Navigation** | Free, zero-latency turn-by-turn voice guidance using the browser's native Web Speech API. |
| 🗾️ **Dual Map Engine** | Uses Google Maps Platform when a key is supplied, and automatically falls back to a free MapLibre GL vector map otherwise — the app is fully usable with zero paid keys. |

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion, Recharts, Lucide Icons
- **Maps:** `@vis.gl/react-google-maps` (Google Maps Platform) / MapLibre GL (free vector fallback), OSRM (free routing engine)
- **Backend:** Express (via `server.ts`), served through Vite middleware in dev and as static + API server in production
- **AI:** Google Gemini (`@google/genai`) for the Flow AI Advisor endpoint
- **Package manager:** Bun (`bun.lock`) — npm/yarn also work

## 📂 Project Structure

```
SYNCRO1/
├── server.ts                       # Express API server + Vite middleware
├── src/
│   ├── App.tsx                     # Root layout, tab routing, GPS/nav state
│   ├── main.tsx                    # React entry point
│   ├── components/
│   │   ├── ai/FlowAiAdvisor.tsx        # Gemini-powered advisor UI
│   │   ├── dashboard/LiveCityDashboard.tsx
│   │   ├── map/ChennaiMap.tsx          # MapLibre (free) map
│   │   ├── map/GoogleChennaiMap.tsx    # Google Maps Platform map
│   │   ├── navigation/NavigationHUD.tsx
│   │   ├── planner/CityPlannerPanel.tsx
│   │   ├── pollution/PollutionIntelligencePanel.tsx
│   │   ├── routing/SmartRoutesPanel.tsx
│   │   └── simulation/WhatIfSimulator.tsx
│   ├── data/
│   │   ├── chennaiGeoData.ts           # Landmarks, corridors, transit routes, hotspots, AQ sensors
│   │   └── plannerPolicies.ts          # Policy recommendation dataset
│   ├── lib/
│   │   ├── navigation/voiceAssistant.ts   # Web Speech API wrapper
│   │   ├── pollution/emissionsEngine.ts   # Per-mode emission/cost factors
│   │   ├── routing/smartRouter.ts         # Multi-objective route scoring
│   │   ├── routing/freeOsrmRouter.ts      # Free OSRM road geometry
│   │   └── simulation/simulator.ts        # BPR-based what-if simulation engine
│   └── types/index.ts
├── metadata.json
├── vite.config.ts
└── package.json
```

## 🔌 API Endpoints

The Express server exposes:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/transit/routes` | Chennai transit routes (Metro, MTC, Suburban Rail) |
| `GET` | `/api/transit/stops` | Landmark/stop dataset |
| `GET` | `/api/traffic` | Road corridors, hotspots, city-wide baseline metrics |
| `GET` | `/api/pollution/heatmap` | Air-quality sensors and corridor-level emissions |
| `POST` | `/api/routes/optimize` | Multi-objective route planning (`originId`, `destinationId`, `goal`) |
| `POST` | `/api/simulation/run` | Run a what-if policy simulation |
| `GET` | `/api/policy/recommendations` | City-planner policy dataset |
| `POST` | `/api/ai/analyze` | Ask Flow AI a mobility question (`question`, `context`) |
| `GET` | `/api/health` | Health check / Gemini status |

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- A [Gemini API key](https://ai.google.dev/) (optional — enables the AI advisor; a deterministic fallback runs without it)
- A [Google Maps Platform key](https://developers.google.com/maps) (optional — the app falls back to a free MapLibre map without it)

### Installation

```bash
# Clone the repo
git clone https://github.com/xSnehank/SYNCRO1.git
cd SYNCRO1

# Install dependencies
bun install
# or: npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in what you have (both are optional):

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="your_gemini_api_key"
GOOGLE_MAPS_PLATFORM_KEY="your_google_maps_key"
APP_URL="http://localhost:3000"
```

### Run in development

```bash
bun run dev
# or: npm run dev
```

The app runs on **http://localhost:3000**.

### Build for production

```bash
bun run build
bun run start
# or the npm equivalents
```

Other scripts: `npm run preview` (preview the production build), `npm run lint` (TypeScript type-check), `npm run clean` (remove build artifacts).

## 🌐 Deployment

The live instance is deployed on Vercel: **[syncro-1.vercel.app](https://syncro-1.vercel.app/)**

## 📄 License

No license has been specified for this repository. All rights reserved by the author unless stated otherwise.

## 👤 Author

**Snehank** — [@xSnehank](https://github.com/xSnehank)
**Aayush** -- [@aayushmangire] (https://github.com/aayushmangire)

---

<p align="center">Built for Chennai's commuters, planners, and cleaner air. 🌱</p>
