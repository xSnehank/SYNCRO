import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { CHENNAI_LANDMARKS, CHENNAI_ROAD_CORRIDORS, CHENNAI_TRANSIT_ROUTES, CHENNAI_HOTSPOTS, AIR_QUALITY_SENSORS } from './src/data/chennaiGeoData';
import { planSmartRoutes } from './src/lib/routing/smartRouter';
import { runWhatIfSimulation, BASELINE_CITY_METRICS } from './src/lib/simulation/simulator';
import { CHENNAI_PLANNER_POLICIES } from './src/data/plannerPolicies';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

/** Extract a safe, user-facing message from an unknown thrown value. */
function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const optimizationGoals = ['BALANCED', 'FASTEST', 'CHEAPEST', 'LOWEST_EMISSIONS', 'LOWEST_EXPOSURE', 'LOWEST_CONGESTION'] as const;

const RouteOptimizeRequestSchema = z.object({
  originId: z.string().optional(),
  destinationId: z.string().optional(),
  goal: z.enum(optimizationGoals).optional().default('BALANCED')
});

const SimulationRequestSchema = z.object({
  privateCarUsageDeltaPercent: z.number().min(-50).max(50),
  publicTransitAdoptionDeltaPercent: z.number().min(-50).max(50),
  metroAdoptionDeltaPercent: z.number().min(-50).max(50),
  busAdoptionDeltaPercent: z.number().min(-50).max(50),
  evAdoptionDeltaPercent: z.number().min(0).max(100),
  trafficSignalOptimization: z.boolean(),
  dedicatedBusLanesOMR: z.boolean(),
  offPeakFreightRestrictions: z.boolean()
});

const AiAnalyzeRequestSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  context: z.unknown().optional()
});

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// 1. Transit Endpoints
// ==========================================
app.get('/api/transit/routes', (_req, res) => {
  res.json({
    routes: CHENNAI_TRANSIT_ROUTES,
    provenance: 'ESTIMATED',
    source: 'CUMTA / Chennai Metro Rail Limited / MTC GTFS Data'
  });
});

app.get('/api/transit/stops', (_req, res) => {
  res.json({
    landmarks: CHENNAI_LANDMARKS,
    provenance: 'REAL',
    source: 'OpenStreetMap / OpenDataChennai'
  });
});

// ==========================================
// 2. Traffic & Congestion Endpoints
// ==========================================
app.get('/api/traffic', (_req, res) => {
  res.json({
    corridors: CHENNAI_ROAD_CORRIDORS,
    hotspots: CHENNAI_HOTSPOTS,
    cityMetrics: BASELINE_CITY_METRICS,
    timestamp: new Date().toISOString(),
    provenance: 'ESTIMATED'
  });
});

// ==========================================
// 3. Pollution & Air Quality Endpoints
// ==========================================
app.get('/api/pollution/heatmap', (_req, res) => {
  const sensorData = AIR_QUALITY_SENSORS;
  const corridorEmissions = CHENNAI_ROAD_CORRIDORS.map(c => ({
    id: c.id,
    name: c.name,
    coordinates: c.coordinates,
    emissions: c.emissions,
    pollutionRisk: c.pollutionRisk,
    estimatedIdleMinPerKm: c.estimatedIdleMinPerKm,
    provenance: c.provenance
  }));

  res.json({
    sensors: sensorData,
    corridorEmissions,
    cityDailyTransportCO2Tons: BASELINE_CITY_METRICS.dailyTransportCO2Tons,
    cityDailyTransportNOxKg: BASELINE_CITY_METRICS.dailyTransportNOxKg,
    cityDailyTransportPM25Kg: BASELINE_CITY_METRICS.dailyTransportPM25Kg,
    provenance: 'ESTIMATED'
  });
});

// ==========================================
// 4. Smart Route Optimization Endpoint
// ==========================================
app.post('/api/routes/optimize', (req, res) => {
  const parsed = RouteOptimizeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
  }

  try {
    const { originId, destinationId, goal } = parsed.data;

    const origin = CHENNAI_LANDMARKS.find(l => l.id === originId) || CHENNAI_LANDMARKS[0];
    const destination = CHENNAI_LANDMARKS.find(l => l.id === destinationId) || CHENNAI_LANDMARKS[4];

    const options = planSmartRoutes(origin, destination, goal);
    return res.json({
      origin,
      destination,
      goal,
      options,
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Error in route optimization:', error);
    return res.status(500).json({ error: errorMessage(error, 'Route optimization failed') });
  }
});

// ==========================================
// 5. What-If Simulation Endpoint
// ==========================================
app.post('/api/simulation/run', (req, res) => {
  const parsed = SimulationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid simulation parameters', details: parsed.error.flatten() });
  }

  try {
    const results = runWhatIfSimulation(parsed.data);
    return res.json(results);
  } catch (error: unknown) {
    console.error('Error in simulation:', error);
    return res.status(500).json({ error: errorMessage(error, 'Simulation execution failed') });
  }
});

// ==========================================
// 6. City Planner Policies Endpoint
// ==========================================
app.get('/api/policy/recommendations', (_req, res) => {
  res.json({
    policies: CHENNAI_PLANNER_POLICIES,
    provenance: 'ESTIMATED',
    agency: 'CUMTA / Chennai Unified Metropolitan Transport Authority'
  });
});

// ==========================================
// 7. Flow AI Advisor Endpoint
// ==========================================
app.post('/api/ai/analyze', async (req, res) => {
  const parsed = AiAnalyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Question is required' });
  }
  const { question, context } = parsed.data;

  const ai = getGenAI();

  if (ai) {
    try {
      const promptContext = `
You are FLOW AI, the AI Mobility & Transportation Environmental Advisor for Chennai Flow (Chennai, Tamil Nadu).
Analyze the user's question using this verified Chennai transportation context:
- Primary Hotspots: OMR (89% congestion index, 38.4T CO2/day), Kathipara/Guindy (81% congestion, 31.2T CO2/day), Porur (87% congestion, 26.9T CO2/day), Central (76% congestion).
- Transit Modes: Chennai Metro (Blue line Airport-Wimco Nagar, Green line Central-St Thomas Mount), MTC Buses (570, 19B, 21G, 102), Suburban Rail (Beach-Tambaram-Chengalpattu).
- Baseline City Metrics: Congestion 78.4, Avg Speed 20.8 km/h, Daily Transport CO2 4,250 Tons, Transit Modal Share 34.2%.
- Key Tradeoff Philosophy: Shifting from private petrol cars/two-wheelers to Chennai Metro / MTC or EV Multimodal cut tailpipe emissions by 70-92% and avoids stop-and-go corridor idling.

User Question: "${question}"
Additional Context: ${JSON.stringify(context || {})}

Return your answer strictly formatted in this markdown structure:
### Observation
[What the data indicates regarding this corridor or policy in Chennai]

### Recommendation
[Direct actionable recommendation for commuter or urban planner]

### Expected Impact
[Specific estimated change: % emissions reduced, travel time saved, or modal shift]

### Confidence
[High / Medium / Low]

### Data Basis
[Observed / Open Data | Estimated Transportation Model | Simulated Scenario]
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptContext,
      });

      const responseText = response.text || '';
      return res.json({
        answer: responseText,
        source: 'Gemini 3.7 Flash + Chennai Flow Knowledge Base',
        provenance: 'ESTIMATED'
      });
    } catch (genAiError: unknown) {
      console.warn('Gemini API call failed, falling back to structured domain advisor:', errorMessage(genAiError, 'unknown error'));
    }
  }

  // Fallback domain-expert response generator
  const qLower = question.toLowerCase();
  let observation = "Transportation analysis for Chennai corridors indicates significant peak-hour saturation (congestion index 78-89%) driven by private vehicles and stop-and-go idling.";
  let recommendation = "Switch to Chennai Metro Blue/Green Line or MTC Express routes (e.g. 570 on OMR) with first/last mile electric feeder connectivity.";
  let expectedImpact = "Reduces individual travel carbon emissions by 68–84% and saves 25–40 minutes of queue delay compared to driving.";
  const confidence: 'High' | 'Medium' | 'Low' = 'High';
  let dataBasis = 'Estimated Transportation Model';

  if (qLower.includes('omr') || qLower.includes('sholinganallur') || qLower.includes('siruseri')) {
    observation = "OMR Rajiv Gandhi Salai experiences 89% congestion during peak hours (08:30–11:00 & 17:30–20:30) with average speeds dropping below 14 km/h, generating 38.4 metric tons of CO2 daily.";
    recommendation = "Utilize dedicated MTC 570/19B express services or multimodal transfer from Guindy/Taramani Metro rather than single-occupancy petrol vehicles.";
    expectedImpact = "Cuts vehicle idling fuel loss by ~45% and saves ~35 minutes of traffic delay per roundtrip.";
    dataBasis = 'Estimated Transportation Model';
  } else if (qLower.includes('vit') || qLower.includes('vandalur') || qLower.includes('kelambakkam')) {
    observation = "VIT Chennai on Vandalur-Kelambakkam Road connects both GST Road and OMR corridors; peak travel faces severe friction when merging into Tambaram or Siruseri.";
    recommendation = "For trips from VIT Chennai to Central, take feeder transit to Tambaram Railway Terminal to board the Suburban Southern Line / Metro at Guindy.";
    expectedImpact = "Saves ₹140 per trip compared to private cab while slashing CO2 emissions by over 80%.";
    dataBasis = 'Estimated Transportation Model';
  } else if (qLower.includes('what if') || qLower.includes('simulate') || qLower.includes('20%') || qLower.includes('percent')) {
    observation = "Simulating a 20% reduction in private car volume combined with a 20% increase in Metro adoption causes a non-linear relief in bottleneck queue lengths.";
    recommendation = "Implement peak congestion mitigation through employer transit subsidies in SIPCOT Siruseri and Guindy Industrial Estate.";
    expectedImpact = "Citywide average speed increases from 20.8 km/h to 27.4 km/h; daily transport CO2 drops by ~580 metric tons.";
    dataBasis = 'Simulated Scenario';
  } else if (qLower.includes('porur') || qLower.includes('dlf')) {
    observation = "Porur junction is restricted by freight traffic and heavy tech commuter flows to DLF CyberCity, recording an AQI pollution score of 184 (Hazardous).";
    recommendation = "Enforce peak-hour commercial freight curfews and expand electric auto-rickshaw feeder loops to Alandur Metro.";
    expectedImpact = "Lowers roadside PM2.5 concentrations by ~22% and reduces peak vehicle delay by 18 minutes.";
    dataBasis = 'Estimated Transportation Model';
  }

  const structuredFallback = `### Observation
${observation}

### Recommendation
${recommendation}

### Expected Impact
${expectedImpact}

### Confidence
${confidence}

### Data Basis
${dataBasis}`;

  return res.json({
    answer: structuredFallback,
    source: 'Chennai Flow Deterministic Mobility Engine',
    provenance: 'ESTIMATED'
  });
});

// ==========================================
// 8. Health Check
// ==========================================
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CHENNAI FLOW Intelligence Server',
    version: '1.0.0',
    geminiEnabled: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CHENNAI FLOW Server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
