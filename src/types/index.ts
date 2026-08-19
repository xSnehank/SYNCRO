export type DataProvenance = 'REAL' | 'ESTIMATED' | 'SIMULATED' | 'DEMO';

export type TransportMode = 
  | 'CAR_PETROL'
  | 'CAR_EV'
  | 'TWO_WHEELER'
  | 'AUTO_RICKSHAW'
  | 'MTC_BUS'
  | 'CHENNAI_METRO'
  | 'SUBURBAN_RAIL'
  | 'WALK'
  | 'MULTIMODAL';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface LandmarkNode {
  id: string;
  name: string;
  tamilName?: string;
  category: 'transit_hub' | 'education' | 'tech_park' | 'commercial' | 'airport' | 'residential';
  coordinate: GeoCoordinate;
  description: string;
  connectedModes: TransportMode[];
}

export interface RoadSegment {
  id: string;
  name: string;
  corridor: string;
  coordinates: [number, number][]; // [lng, lat]
  lengthKm: number;
  speedLimitKm: number;
  currentSpeedKm: number;
  freeFlowSpeedKm: number;
  trafficDensity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  congestionIndex: number; // 0 to 100
  estimatedIdleMinPerKm: number;
  hourlyVehicleVolume: number;
  emissions: {
    co2KgPerHour: number;
    noxGramsPerHour: number;
    pm25GramsPerHour: number;
    idleFuelWastedLitersPerHour: number;
  };
  pollutionRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'HAZARDOUS';
  provenance: DataProvenance;
  historicalTrend: { hour: string; speed: number; congestion: number }[];
}

export interface TransitRoute {
  id: string;
  shortName: string;
  longName: string;
  type: 'METRO' | 'MTC_BUS' | 'SUBURBAN_TRAIN';
  color: string;
  stops: { id: string; name: string; coordinate: GeoCoordinate; isInterchange?: boolean }[];
  coordinates: [number, number][];
  frequencyMin: number;
  fareBaseRupees: number;
  averageSpeedKm: number;
  dailyRidershipEstimate: number;
}

export interface RouteOption {
  id: string;
  mode: TransportMode;
  modeLabel: string;
  iconType: string;
  totalTimeMinutes: number;
  distanceKm: number;
  fareRupees: number;
  co2Grams: number;
  noxGrams: number;
  pm25Milligrams: number;
  congestionExposureScore: number; // 0 to 100
  pollutionExposureIndex: number; // 0 to 100 (AQI inhaled equivalent)
  walkingDistanceMeters: number;
  transfers: number;
  segments: RouteSegmentDetail[];
  compositeScore: number;
  isRecommended?: boolean;
  recommendationReason?: string;
  carbonSavingsPercentVsCar: number;
  provenance: DataProvenance;
}

export interface RouteSegmentDetail {
  instruction: string;
  mode: TransportMode;
  distanceKm: number;
  durationMinutes: number;
  lineName?: string;
  color?: string;
  coordinates: [number, number][];
}

export type OptimizationGoal = 
  | 'BALANCED'
  | 'FASTEST'
  | 'CHEAPEST'
  | 'LOWEST_EMISSIONS'
  | 'LOWEST_EXPOSURE'
  | 'LOWEST_CONGESTION';

export interface ScoringWeights {
  time: number;
  cost: number;
  emissions: number;
  exposure: number;
  congestion: number;
}

export interface SimulationParams {
  privateCarUsageDeltaPercent: number; // -50 to +50
  publicTransitAdoptionDeltaPercent: number; // -50 to +50
  metroAdoptionDeltaPercent: number; // -50 to +50
  busAdoptionDeltaPercent: number; // -50 to +50
  evAdoptionDeltaPercent: number; // 0 to +100
  trafficSignalOptimization: boolean;
  dedicatedBusLanesOMR: boolean;
  offPeakFreightRestrictions: boolean;
}

export interface SimulationMetricDelta {
  baseline: number;
  simulated: number;
  deltaPercent: number;
  unit: string;
}

export interface SimulationResults {
  scenarioId: string;
  timestamp: string;
  cityCongestionIndex: SimulationMetricDelta;
  averageTravelSpeedKm: SimulationMetricDelta;
  dailyVehicleKilometersTraveled: SimulationMetricDelta;
  dailyTransportCO2Tons: SimulationMetricDelta;
  dailyTransportNOxKg: SimulationMetricDelta;
  dailyTransportPM25Kg: SimulationMetricDelta;
  publicTransitSharePercent: SimulationMetricDelta;
  averageCommuteDelayMinutes: SimulationMetricDelta;
  corridorBreakdowns: {
    corridorName: string;
    baselineCongestion: number;
    simulatedCongestion: number;
    baselineSpeed: number;
    simulatedSpeed: number;
    co2ReductionPercent: number;
  }[];
  hourlyTrafficProjection: {
    hour: string;
    baselineVehicles: number;
    simulatedVehicles: number;
    baselineSpeed: number;
    simulatedSpeed: number;
  }[];
  policyInsights: string[];
  provenance: DataProvenance;
}

export interface HotspotArea {
  id: string;
  name: string;
  zone: string;
  coordinate: GeoCoordinate;
  congestionLevel: 'MODERATE' | 'HIGH' | 'SEVERE';
  congestionScore: number; // 0 to 100
  pollutionRisk: 'MODERATE' | 'HIGH' | 'HAZARDOUS';
  aqiEstimate: number;
  peakDelayMinutes: number;
  dailyEmissionsKgCO2: number;
  primaryBottleneckReason: string;
  recommendedIntervention: string;
  provenance: DataProvenance;
}

export interface AiAdvisorQuery {
  question: string;
  context?: {
    origin?: string;
    destination?: string;
    currentMode?: string;
    scenarioParams?: SimulationParams;
  };
}

export interface AiAdvisorResponse {
  observation: string;
  recommendation: string;
  expectedImpact: string;
  confidence: 'High' | 'Medium' | 'Low';
  dataBasis: 'Observed / Open Data' | 'Estimated Transportation Model' | 'Simulated Scenario';
  keyMetrics?: { label: string; value: string }[];
  suggestedAction?: string;
}

export interface CityPlannerPolicy {
  id: string;
  title: string;
  category: 'Transit Expansion' | 'Congestion Pricing' | 'Fleet Electrification' | 'Signal Intelligence';
  targetCorridor: string;
  estimatedCostCrores: number;
  implementationTimeMonths: number;
  projectedEmissionsReductionPercent: number;
  projectedCongestionReductionPercent: number;
  projectedModalShiftPercent: number;
  benefitCostRatio: number;
  description: string;
}
