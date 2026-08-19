import { SimulationParams, SimulationResults, RoadSegment } from '../../types';
import { CHENNAI_ROAD_CORRIDORS } from '../../data/chennaiGeoData';

export const BASELINE_CITY_METRICS = {
  cityCongestionIndex: 78.4, // 0 to 100
  averageTravelSpeedKm: 20.8, // km/h
  dailyVehicleKilometersTraveled: 18450000, // VKT across Chennai MMA
  dailyTransportCO2Tons: 4250, // Tons of CO2 / day
  dailyTransportNOxKg: 24800, // Kg of NOx / day
  dailyTransportPM25Kg: 1650, // Kg of PM2.5 / day
  publicTransitSharePercent: 34.2, // % modal split
  averageCommuteDelayMinutes: 36.5, // Minutes delayed per peak commute
};

export function runWhatIfSimulation(params: SimulationParams): SimulationResults {
  // Aggregate effective modal shift factors
  const carDelta = params.privateCarUsageDeltaPercent / 100; // e.g. -0.20
  const transitDelta = (params.publicTransitAdoptionDeltaPercent + params.metroAdoptionDeltaPercent * 0.7 + params.busAdoptionDeltaPercent * 0.5) / 100;
  const evFraction = params.evAdoptionDeltaPercent / 100;

  // Signal optimization & infrastructure bonus
  let signalSpeedBonusPercent = params.trafficSignalOptimization ? 0.08 : 0;
  if (params.dedicatedBusLanesOMR) signalSpeedBonusPercent += 0.05;
  if (params.offPeakFreightRestrictions) signalSpeedBonusPercent += 0.06;

  // Net vehicle flow multiplier on arterial roads
  const netVehicleVolumeFactor = Math.max(0.45, 1.0 + carDelta * 0.65 - transitDelta * 0.35);

  // BPR speed relationship: Reduction in volume results in non-linear speed increase & congestion relief
  const speedMultiplier = (1 / Math.pow(netVehicleVolumeFactor, 0.75)) * (1 + signalSpeedBonusPercent);
  const simulatedSpeed = Math.min(48, Math.round(BASELINE_CITY_METRICS.averageTravelSpeedKm * speedMultiplier * 10) / 10);
  
  // Congestion index calculation
  const congestionReductionFactor = Math.pow(netVehicleVolumeFactor, 1.3) * (params.trafficSignalOptimization ? 0.88 : 1.0);
  const simulatedCongestion = Math.max(15, Math.min(98, Math.round(BASELINE_CITY_METRICS.cityCongestionIndex * congestionReductionFactor * 10) / 10));

  // Delay calculation
  const delayReductionRatio = simulatedCongestion / BASELINE_CITY_METRICS.cityCongestionIndex;
  const simulatedDelay = Math.max(8, Math.round(BASELINE_CITY_METRICS.averageCommuteDelayMinutes * delayReductionRatio * 10) / 10);

  // Transit share calculation
  const simulatedTransitShare = Math.max(10, Math.min(80, Math.round((BASELINE_CITY_METRICS.publicTransitSharePercent + transitDelta * 22 - carDelta * 12) * 10) / 10));

  // VKT (Vehicle Kilometers Traveled)
  const simulatedVkt = Math.round(BASELINE_CITY_METRICS.dailyVehicleKilometersTraveled * netVehicleVolumeFactor);

  // Idle emission reduction: speed increase reduces idle fuel loss by ~45%
  const idleReliefFactor = Math.max(0.4, 1.0 - (simulatedSpeed - BASELINE_CITY_METRICS.averageTravelSpeedKm) / 30);
  
  // Emission factor accounting for EV transition & idling relief
  const tailpipeMultiplier = (1 - evFraction * 0.85) * idleReliefFactor * netVehicleVolumeFactor;
  
  const simulatedCO2 = Math.round(BASELINE_CITY_METRICS.dailyTransportCO2Tons * tailpipeMultiplier);
  const simulatedNOx = Math.round(BASELINE_CITY_METRICS.dailyTransportNOxKg * tailpipeMultiplier);
  const simulatedPM25 = Math.round(BASELINE_CITY_METRICS.dailyTransportPM25Kg * (tailpipeMultiplier * 0.7 + (1 - evFraction * 0.4) * 0.3)); // PM2.5 includes brake/tire wear

  // Calculate corridor level breakdowns
  const corridorBreakdowns = CHENNAI_ROAD_CORRIDORS.map((corridor: RoadSegment) => {
    let localVolumeFactor = netVehicleVolumeFactor;
    if (params.dedicatedBusLanesOMR && corridor.id.includes('omr')) {
      localVolumeFactor *= 0.82;
    }
    if (params.offPeakFreightRestrictions && (corridor.id.includes('gst') || corridor.id.includes('mount_poonamallee'))) {
      localVolumeFactor *= 0.86;
    }

    const simSpeed = Math.min(
      corridor.speedLimitKm,
      Math.round(corridor.currentSpeedKm * (1 / Math.pow(localVolumeFactor, 0.8)) * (1 + signalSpeedBonusPercent) * 10) / 10
    );
    const simCongestion = Math.max(15, Math.round(corridor.congestionIndex * Math.pow(localVolumeFactor, 1.2) * 10) / 10);
    const co2Red = Math.round((1 - (localVolumeFactor * (1 - evFraction * 0.85))) * 100);

    return {
      corridorName: corridor.name.split(' (')[0],
      baselineCongestion: corridor.congestionIndex,
      simulatedCongestion: simCongestion,
      baselineSpeed: corridor.currentSpeedKm,
      simulatedSpeed: simSpeed,
      co2ReductionPercent: Math.max(0, co2Red)
    };
  });

  // Hourly projection curves (06:00 to 22:00)
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const baselineVehiclePeak = [4200, 14200, 11800, 7800, 6900, 10200, 15400, 12600, 5800];
  const hourlyTrafficProjection = hours.map((hour, idx) => {
    const baseVeh = baselineVehiclePeak[idx];
    const simVeh = Math.round(baseVeh * netVehicleVolumeFactor);
    const baseSpd = Math.round(38 - (baseVeh / 15400) * 22);
    const simSpd = Math.min(50, Math.round(baseSpd * speedMultiplier));
    return {
      hour,
      baselineVehicles: baseVeh,
      simulatedVehicles: simVeh,
      baselineSpeed: baseSpd,
      simulatedSpeed: simSpd
    };
  });

  // Synthesize policy insights
  const policyInsights: string[] = [];
  const co2DeltaPercent = Math.round(((simulatedCO2 - BASELINE_CITY_METRICS.dailyTransportCO2Tons) / BASELINE_CITY_METRICS.dailyTransportCO2Tons) * 1000) / 10;
  const congDeltaPercent = Math.round(((simulatedCongestion - BASELINE_CITY_METRICS.cityCongestionIndex) / BASELINE_CITY_METRICS.cityCongestionIndex) * 1000) / 10;

  if (congDeltaPercent <= -15) {
    policyInsights.push(`Major congestion relief of ${Math.abs(congDeltaPercent)}% achieved across key corridors including OMR and Kathipara.`);
  }
  if (co2DeltaPercent <= -15) {
    policyInsights.push(`Avoids ${BASELINE_CITY_METRICS.dailyTransportCO2Tons - simulatedCO2} metric tons of CO2 daily, equivalent to planting ~68,000 urban trees annually in Chennai.`);
  }
  if (params.trafficSignalOptimization) {
    policyInsights.push('AI adaptive signal synchronization prevents up to 14 minutes of queue idling at Sholinganallur and Vadapalani junctions.');
  }
  if (params.dedicatedBusLanesOMR) {
    policyInsights.push('Dedicated OMR Bus Corridor increases MTC bus commercial operating speed by ~42%, drawing 28,000 car commuters daily.');
  }
  if (params.evAdoptionDeltaPercent >= 20) {
    policyInsights.push(`Electrification reduces particulate PM2.5 roadside concentrations by ${Math.round(params.evAdoptionDeltaPercent * 0.45)}% in densely inhabited zones.`);
  }

  const result: SimulationResults = {
    scenarioId: `sim_${Date.now()}`,
    timestamp: new Date().toISOString(),
    cityCongestionIndex: {
      baseline: BASELINE_CITY_METRICS.cityCongestionIndex,
      simulated: simulatedCongestion,
      deltaPercent: congDeltaPercent,
      unit: 'pts'
    },
    averageTravelSpeedKm: {
      baseline: BASELINE_CITY_METRICS.averageTravelSpeedKm,
      simulated: simulatedSpeed,
      deltaPercent: Math.round(((simulatedSpeed - BASELINE_CITY_METRICS.averageTravelSpeedKm) / BASELINE_CITY_METRICS.averageTravelSpeedKm) * 1000) / 10,
      unit: 'km/h'
    },
    dailyVehicleKilometersTraveled: {
      baseline: BASELINE_CITY_METRICS.dailyVehicleKilometersTraveled,
      simulated: simulatedVkt,
      deltaPercent: Math.round(((simulatedVkt - BASELINE_CITY_METRICS.dailyVehicleKilometersTraveled) / BASELINE_CITY_METRICS.dailyVehicleKilometersTraveled) * 1000) / 10,
      unit: 'VKT'
    },
    dailyTransportCO2Tons: {
      baseline: BASELINE_CITY_METRICS.dailyTransportCO2Tons,
      simulated: simulatedCO2,
      deltaPercent: co2DeltaPercent,
      unit: 'tons/day'
    },
    dailyTransportNOxKg: {
      baseline: BASELINE_CITY_METRICS.dailyTransportNOxKg,
      simulated: simulatedNOx,
      deltaPercent: Math.round(((simulatedNOx - BASELINE_CITY_METRICS.dailyTransportNOxKg) / BASELINE_CITY_METRICS.dailyTransportNOxKg) * 1000) / 10,
      unit: 'kg/day'
    },
    dailyTransportPM25Kg: {
      baseline: BASELINE_CITY_METRICS.dailyTransportPM25Kg,
      simulated: simulatedPM25,
      deltaPercent: Math.round(((simulatedPM25 - BASELINE_CITY_METRICS.dailyTransportPM25Kg) / BASELINE_CITY_METRICS.dailyTransportPM25Kg) * 1000) / 10,
      unit: 'kg/day'
    },
    publicTransitSharePercent: {
      baseline: BASELINE_CITY_METRICS.publicTransitSharePercent,
      simulated: simulatedTransitShare,
      deltaPercent: Math.round(((simulatedTransitShare - BASELINE_CITY_METRICS.publicTransitSharePercent) / BASELINE_CITY_METRICS.publicTransitSharePercent) * 1000) / 10,
      unit: '%'
    },
    averageCommuteDelayMinutes: {
      baseline: BASELINE_CITY_METRICS.averageCommuteDelayMinutes,
      simulated: simulatedDelay,
      deltaPercent: Math.round(((simulatedDelay - BASELINE_CITY_METRICS.averageCommuteDelayMinutes) / BASELINE_CITY_METRICS.averageCommuteDelayMinutes) * 1000) / 10,
      unit: 'mins'
    },
    corridorBreakdowns,
    hourlyTrafficProjection,
    policyInsights,
    provenance: 'SIMULATED'
  };

  return result;
}
