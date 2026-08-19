import { TransportMode } from '../../types';

export interface VehicleEmissionFactors {
  baseCo2GramsPerKm: number;
  baseNoxMgPerKm: number;
  basePm25MgPerKm: number;
  costRupeesPerKm: number;
  averageOccupancy: number;
  fuelType: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HUMAN';
}

export const MODAL_EMISSION_PROFILES: Record<TransportMode, VehicleEmissionFactors> = {
  CAR_PETROL: {
    baseCo2GramsPerKm: 165,
    baseNoxMgPerKm: 280,
    basePm25MgPerKm: 18,
    costRupeesPerKm: 11.5,
    averageOccupancy: 1.2,
    fuelType: 'PETROL'
  },
  CAR_EV: {
    baseCo2GramsPerKm: 22, // Indirect lifecycle/grid average
    baseNoxMgPerKm: 8,
    basePm25MgPerKm: 2, // Tire/brake wear only
    costRupeesPerKm: 4.2,
    averageOccupancy: 1.3,
    fuelType: 'ELECTRIC'
  },
  TWO_WHEELER: {
    baseCo2GramsPerKm: 42,
    baseNoxMgPerKm: 110,
    basePm25MgPerKm: 12,
    costRupeesPerKm: 2.8,
    averageOccupancy: 1.1,
    fuelType: 'PETROL'
  },
  AUTO_RICKSHAW: {
    baseCo2GramsPerKm: 78,
    baseNoxMgPerKm: 160,
    basePm25MgPerKm: 14,
    costRupeesPerKm: 9.0,
    averageOccupancy: 1.5,
    fuelType: 'CNG'
  },
  MTC_BUS: {
    baseCo2GramsPerKm: 32, // Per passenger-km with average 45 passengers
    baseNoxMgPerKm: 45,
    basePm25MgPerKm: 3.5,
    costRupeesPerKm: 1.2,
    averageOccupancy: 45,
    fuelType: 'DIESEL'
  },
  CHENNAI_METRO: {
    baseCo2GramsPerKm: 7.5, // Per passenger-km clean electrified rail
    baseNoxMgPerKm: 1.2,
    basePm25MgPerKm: 0.3,
    costRupeesPerKm: 2.1,
    averageOccupancy: 280,
    fuelType: 'ELECTRIC'
  },
  SUBURBAN_RAIL: {
    baseCo2GramsPerKm: 5.8,
    baseNoxMgPerKm: 0.9,
    basePm25MgPerKm: 0.2,
    costRupeesPerKm: 0.35,
    averageOccupancy: 600,
    fuelType: 'ELECTRIC'
  },
  WALK: {
    baseCo2GramsPerKm: 0,
    baseNoxMgPerKm: 0,
    basePm25MgPerKm: 0,
    costRupeesPerKm: 0,
    averageOccupancy: 1,
    fuelType: 'HUMAN'
  },
  MULTIMODAL: {
    baseCo2GramsPerKm: 16,
    baseNoxMgPerKm: 18,
    basePm25MgPerKm: 1.5,
    costRupeesPerKm: 2.4,
    averageOccupancy: 1,
    fuelType: 'ELECTRIC'
  }
};

/**
 * Calculates congestion penalty multiplier based on average corridor speed.
 * Lower speeds (< 20 km/h) due to idling drastically spike fuel consumption & emissions.
 */
export function calculateSpeedEmissionMultiplier(currentSpeedKm: number, freeFlowSpeedKm: number = 50): number {
  if (currentSpeedKm <= 0) return 3.2;
  const speedRatio = Math.min(1.0, currentSpeedKm / freeFlowSpeedKm);
  
  if (speedRatio >= 0.8) {
    return 1.0; // Near free flow
  } else if (speedRatio >= 0.5) {
    return 1.0 + (0.8 - speedRatio) * 1.5; // Moderate congestion: 1.0x to 1.45x
  } else {
    // Severe crawling & idling (e.g. OMR peak, Kathipara junction)
    const severeFactor = (0.5 - speedRatio) / 0.5;
    return 1.45 + Math.pow(severeFactor, 1.8) * 1.75; // Up to 3.2x emissions
  }
}

/**
 * Calculate full emissions breakdown for a trip segment
 */
export function estimateTripEmissions(
  mode: TransportMode,
  distanceKm: number,
  averageSpeedKm: number,
  congestionIndex: number // 0 to 100
) {
  const profile = MODAL_EMISSION_PROFILES[mode];
  const speedMultiplier = (mode === 'WALK' || mode === 'CHENNAI_METRO' || mode === 'SUBURBAN_RAIL')
    ? 1.0
    : calculateSpeedEmissionMultiplier(averageSpeedKm);

  const totalCo2 = Math.round(distanceKm * profile.baseCo2GramsPerKm * speedMultiplier);
  const totalNox = Math.round(distanceKm * profile.baseNoxMgPerKm * speedMultiplier);
  const totalPm25 = Math.round(distanceKm * profile.basePm25MgPerKm * speedMultiplier * 10) / 10;
  
  // Passenger exposure index: open road modes (motorcycles, autos) and long slow traffic have highest inhaled dosage
  let exposureMultiplier = 1.0;
  if (mode === 'TWO_WHEELER' || mode === 'AUTO_RICKSHAW') exposureMultiplier = 2.4;
  if (mode === 'CHENNAI_METRO') exposureMultiplier = 0.2; // Filtered underground/elevated air conditioned cabin
  if (mode === 'WALK') exposureMultiplier = 1.5;

  const exposureScore = Math.min(100, Math.round(
    ((congestionIndex * 0.6) + (totalPm25 / Math.max(1, distanceKm) * 3.5)) * exposureMultiplier
  ));

  return {
    co2Grams: totalCo2,
    noxGrams: totalNox / 1000,
    pm25Milligrams: totalPm25,
    exposureScore,
    speedMultiplier
  };
}
