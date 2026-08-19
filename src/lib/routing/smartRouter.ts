import { LandmarkNode, RouteOption, OptimizationGoal, ScoringWeights } from '../../types';
import { estimateTripEmissions } from '../pollution/emissionsEngine';

export const GOAL_WEIGHTS: Record<OptimizationGoal, ScoringWeights> = {
  BALANCED: { time: 0.30, cost: 0.20, emissions: 0.25, exposure: 0.15, congestion: 0.10 },
  FASTEST: { time: 0.65, cost: 0.05, emissions: 0.10, exposure: 0.10, congestion: 0.10 },
  CHEAPEST: { time: 0.10, cost: 0.65, emissions: 0.10, exposure: 0.05, congestion: 0.10 },
  LOWEST_EMISSIONS: { time: 0.10, cost: 0.10, emissions: 0.60, exposure: 0.10, congestion: 0.10 },
  LOWEST_EXPOSURE: { time: 0.15, cost: 0.05, emissions: 0.15, exposure: 0.55, congestion: 0.10 },
  LOWEST_CONGESTION: { time: 0.20, cost: 0.10, emissions: 0.20, exposure: 0.10, congestion: 0.40 },
};

function calculateDistanceKm(c1: { lat: number; lng: number }, c2: { lat: number; lng: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate realistic intermediate coordinates between origin and destination
function interpolateRoutePath(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  viaNodes: [number, number][] = []
): [number, number][] {
  const path: [number, number][] = [[start.lng, start.lat]];
  
  if (viaNodes.length > 0) {
    path.push(...viaNodes);
  } else {
    // Generate a couple realistic curvature points
    const midLng = (start.lng + end.lng) / 2 + (start.lat < end.lat ? 0.015 : -0.015);
    const midLat = (start.lat + end.lat) / 2 + (start.lng < end.lng ? -0.01 : 0.01);
    path.push([midLng, midLat]);
  }

  path.push([end.lng, end.lat]);
  return path;
}

export function planSmartRoutes(
  origin: LandmarkNode,
  destination: LandmarkNode,
  goal: OptimizationGoal = 'BALANCED'
): RouteOption[] {
  const directDistance = calculateDistanceKm(origin.coordinate, destination.coordinate);
  const roadDistance = Math.max(2.5, Math.round(directDistance * 1.35 * 10) / 10);
  
  // Estimate baseline corridor congestion based on origin/destination
  const isOmrOriginOrDest = origin.id.includes('siruseri') || origin.id.includes('sholinganallur') || origin.id.includes('tidel') || origin.id.includes('vit') || destination.id.includes('siruseri') || destination.id.includes('sholinganallur') || destination.id.includes('tidel');
  const isCentralOrEgmore = origin.id.includes('central') || origin.id.includes('egmore') || destination.id.includes('central') || destination.id.includes('egmore');
  
  const baseCongestion = isOmrOriginOrDest ? 84 : isCentralOrEgmore ? 78 : 65;
  const baseCarSpeed = isOmrOriginOrDest ? 19 : 24;

  const weights = GOAL_WEIGHTS[goal];

  // 1. CAR (Petrol)
  const carTime = Math.round((roadDistance / baseCarSpeed) * 60 + (isOmrOriginOrDest ? 14 : 8));
  const carCost = Math.round(roadDistance * 12.5 + 40); // Fuel + toll/parking
  const carEmissions = estimateTripEmissions('CAR_PETROL', roadDistance, baseCarSpeed, baseCongestion);
  const carPath = interpolateRoutePath(origin.coordinate, destination.coordinate, [
    [ (origin.coordinate.lng + destination.coordinate.lng)/2 + 0.01, (origin.coordinate.lat + destination.coordinate.lat)/2 ]
  ]);

  // 2. TWO WHEELER
  const bikeSpeed = Math.min(42, baseCarSpeed * 1.35);
  const bikeTime = Math.round((roadDistance / bikeSpeed) * 60 + 4);
  const bikeCost = Math.round(roadDistance * 3.2);
  const bikeEmissions = estimateTripEmissions('TWO_WHEELER', roadDistance, bikeSpeed, baseCongestion);

  // 3. CHENNAI METRO (or Suburban Train if connected)
  const metroDistance = Math.max(3.0, Math.round(directDistance * 1.15 * 10) / 10);
  const metroSpeed = 38; // km/h commercial operational speed
  const metroRideTime = Math.round((metroDistance / metroSpeed) * 60);
  const metroAccessTime = 14; // Walk + security + wait
  const metroTotalTime = metroRideTime + metroAccessTime;
  const metroCost = Math.min(50, Math.max(20, Math.round(15 + metroDistance * 1.4)));
  const metroEmissions = estimateTripEmissions('CHENNAI_METRO', metroDistance, metroSpeed, 10);
  const metroPath = interpolateRoutePath(origin.coordinate, destination.coordinate, [
    [80.2450, 13.0370],
    [80.2230, 13.0180]
  ]);

  // 4. MTC BUS (e.g. 570 / 19B)
  const busSpeed = 19;
  const busWaitTime = 10;
  const busTotalTime = Math.round((roadDistance / busSpeed) * 60 + busWaitTime);
  const busCost = Math.min(35, Math.max(12, Math.round(10 + roadDistance * 0.9)));
  const busEmissions = estimateTripEmissions('MTC_BUS', roadDistance, busSpeed, baseCongestion);
  const busPath = interpolateRoutePath(origin.coordinate, destination.coordinate);

  // 5. MULTIMODAL (Feeder Shared Auto/Bus + Metro + Short Walk)
  const feederDist = Math.min(3.5, roadDistance * 0.2);
  const metroDist = Math.max(2.0, roadDistance * 0.75);
  const walkDist = 0.5;
  const multiTime = Math.round((feederDist / 22) * 60 + (metroDist / 38) * 60 + 10);
  const multiCost = Math.round(20 + Math.min(40, metroDist * 1.5));
  const multiEmissions = estimateTripEmissions('MULTIMODAL', roadDistance, 32, 25);
  const multiPath = interpolateRoutePath(origin.coordinate, destination.coordinate, [
    [origin.coordinate.lng + (destination.coordinate.lng - origin.coordinate.lng)*0.3, origin.coordinate.lat + (destination.coordinate.lat - origin.coordinate.lat)*0.3],
    [origin.coordinate.lng + (destination.coordinate.lng - origin.coordinate.lng)*0.7, origin.coordinate.lat + (destination.coordinate.lat - origin.coordinate.lat)*0.7]
  ]);

  const rawOptions: Omit<RouteOption, 'compositeScore' | 'isRecommended' | 'recommendationReason' | 'carbonSavingsPercentVsCar'>[] = [
    {
      id: 'opt_car',
      mode: 'CAR_PETROL',
      modeLabel: 'Private Car (Petrol)',
      iconType: 'car',
      totalTimeMinutes: carTime,
      distanceKm: roadDistance,
      fareRupees: carCost,
      co2Grams: carEmissions.co2Grams,
      noxGrams: carEmissions.noxGrams,
      pm25Milligrams: carEmissions.pm25Milligrams,
      congestionExposureScore: baseCongestion,
      pollutionExposureIndex: carEmissions.exposureScore,
      walkingDistanceMeters: 100,
      transfers: 0,
      provenance: 'ESTIMATED',
      segments: [
        {
          instruction: `Drive via ${isOmrOriginOrDest ? 'Rajiv Gandhi Salai (OMR)' : 'Anna Salai / GST Road'}`,
          mode: 'CAR_PETROL',
          distanceKm: roadDistance,
          durationMinutes: carTime,
          coordinates: carPath,
          color: '#ef4444'
        }
      ]
    },
    {
      id: 'opt_bike',
      mode: 'TWO_WHEELER',
      modeLabel: 'Motorcycle / Scooter',
      iconType: 'bike',
      totalTimeMinutes: bikeTime,
      distanceKm: roadDistance,
      fareRupees: bikeCost,
      co2Grams: bikeEmissions.co2Grams,
      noxGrams: bikeEmissions.noxGrams,
      pm25Milligrams: bikeEmissions.pm25Milligrams,
      congestionExposureScore: Math.round(baseCongestion * 0.8),
      pollutionExposureIndex: Math.min(100, bikeEmissions.exposureScore + 18), // Higher inhaled dose in open traffic
      walkingDistanceMeters: 50,
      transfers: 0,
      provenance: 'ESTIMATED',
      segments: [
        {
          instruction: 'Ride via arterial roads with lane filtering during peak junctions',
          mode: 'TWO_WHEELER',
          distanceKm: roadDistance,
          durationMinutes: bikeTime,
          coordinates: carPath,
          color: '#f97316'
        }
      ]
    },
    {
      id: 'opt_metro',
      mode: 'CHENNAI_METRO',
      modeLabel: 'Chennai Metro + Walk',
      iconType: 'train',
      totalTimeMinutes: metroTotalTime,
      distanceKm: metroDistance,
      fareRupees: metroCost,
      co2Grams: metroEmissions.co2Grams,
      noxGrams: metroEmissions.noxGrams,
      pm25Milligrams: metroEmissions.pm25Milligrams,
      congestionExposureScore: 5,
      pollutionExposureIndex: 12,
      walkingDistanceMeters: 650,
      transfers: 1,
      provenance: 'ESTIMATED',
      segments: [
        {
          instruction: `Walk 350m to nearest Metro entry`,
          mode: 'WALK',
          distanceKm: 0.35,
          durationMinutes: 5,
          coordinates: [[origin.coordinate.lng, origin.coordinate.lat], [origin.coordinate.lng + 0.003, origin.coordinate.lat + 0.003]],
          color: '#94a3b8'
        },
        {
          instruction: `Take Chennai Metro (Blue/Green corridor) towards ${destination.name.split(' ')[0]}`,
          mode: 'CHENNAI_METRO',
          lineName: 'Metro Blue/Green Line',
          distanceKm: metroDistance,
          durationMinutes: metroRideTime,
          coordinates: metroPath,
          color: '#0284c7'
        },
        {
          instruction: `Walk 300m to ${destination.name}`,
          mode: 'WALK',
          distanceKm: 0.3,
          durationMinutes: 4,
          coordinates: [[destination.coordinate.lng - 0.003, destination.coordinate.lat - 0.003], [destination.coordinate.lng, destination.coordinate.lat]],
          color: '#94a3b8'
        }
      ]
    },
    {
      id: 'opt_mtc',
      mode: 'MTC_BUS',
      modeLabel: 'MTC Express Bus (570 / 19B)',
      iconType: 'bus',
      totalTimeMinutes: busTotalTime,
      distanceKm: roadDistance,
      fareRupees: busCost,
      co2Grams: busEmissions.co2Grams,
      noxGrams: busEmissions.noxGrams,
      pm25Milligrams: busEmissions.pm25Milligrams,
      congestionExposureScore: Math.round(baseCongestion * 0.9),
      pollutionExposureIndex: busEmissions.exposureScore,
      walkingDistanceMeters: 400,
      transfers: 0,
      provenance: 'ESTIMATED',
      segments: [
        {
          instruction: 'Walk 200m to MTC Bus Stop',
          mode: 'WALK',
          distanceKm: 0.2,
          durationMinutes: 3,
          coordinates: [[origin.coordinate.lng, origin.coordinate.lat], [origin.coordinate.lng + 0.002, origin.coordinate.lat + 0.002]],
          color: '#94a3b8'
        },
        {
          instruction: `Board MTC Bus 570 / 19B Express along corridor`,
          mode: 'MTC_BUS',
          lineName: 'MTC Route 570',
          distanceKm: roadDistance,
          durationMinutes: Math.round((roadDistance / busSpeed) * 60),
          coordinates: busPath,
          color: '#f59e0b'
        }
      ]
    },
    {
      id: 'opt_multimodal',
      mode: 'MULTIMODAL',
      modeLabel: 'Multimodal (EV Auto + Metro + Walk)',
      iconType: 'zap',
      totalTimeMinutes: multiTime,
      distanceKm: roadDistance,
      fareRupees: multiCost,
      co2Grams: multiEmissions.co2Grams,
      noxGrams: multiEmissions.noxGrams,
      pm25Milligrams: multiEmissions.pm25Milligrams,
      congestionExposureScore: 22,
      pollutionExposureIndex: 26,
      walkingDistanceMeters: 450,
      transfers: 1,
      provenance: 'ESTIMATED',
      segments: [
        {
          instruction: 'Take EV Shared Auto feeder to nearest transit junction',
          mode: 'AUTO_RICKSHAW',
          distanceKm: feederDist,
          durationMinutes: Math.round((feederDist / 22) * 60),
          coordinates: [[origin.coordinate.lng, origin.coordinate.lat], [multiPath[1][0], multiPath[1][1]]],
          color: '#10b981'
        },
        {
          instruction: 'Transfer to Grade-Separated Chennai Metro high-speed rail',
          mode: 'CHENNAI_METRO',
          lineName: 'Metro Grade Rail',
          distanceKm: metroDist,
          durationMinutes: Math.round((metroDist / 38) * 60),
          coordinates: multiPath,
          color: '#0284c7'
        },
        {
          instruction: `Walk 450m arrival connection to ${destination.name}`,
          mode: 'WALK',
          distanceKm: walkDist,
          durationMinutes: 5,
          coordinates: [[multiPath[multiPath.length - 1][0], multiPath[multiPath.length - 1][1]], [destination.coordinate.lng, destination.coordinate.lat]],
          color: '#94a3b8'
        }
      ]
    }
  ];

  // Normalize scores across candidates
  const maxTime = Math.max(...rawOptions.map(o => o.totalTimeMinutes));
  const maxCost = Math.max(...rawOptions.map(o => o.fareRupees));
  const maxCo2 = Math.max(...rawOptions.map(o => o.co2Grams));
  const maxExposure = Math.max(...rawOptions.map(o => o.pollutionExposureIndex));
  const maxCongestion = Math.max(...rawOptions.map(o => o.congestionExposureScore));

  const options: RouteOption[] = rawOptions.map(opt => {
    const normTime = opt.totalTimeMinutes / maxTime;
    const normCost = opt.fareRupees / maxCost;
    const normCo2 = opt.co2Grams / Math.max(1, maxCo2);
    const normExposure = opt.pollutionExposureIndex / Math.max(1, maxExposure);
    const normCongestion = opt.congestionExposureScore / Math.max(1, maxCongestion);

    const score = Math.round(
      (weights.time * normTime +
        weights.cost * normCost +
        weights.emissions * normCo2 +
        weights.exposure * normExposure +
        weights.congestion * normCongestion) * 100
    );

    const carbonSavings = carEmissions.co2Grams > 0
      ? Math.max(0, Math.round(((carEmissions.co2Grams - opt.co2Grams) / carEmissions.co2Grams) * 100))
      : 0;

    return {
      ...opt,
      compositeScore: score,
      carbonSavingsPercentVsCar: carbonSavings
    };
  });

  // Find lowest score as best overall recommendation
  let bestIdx = 0;
  let lowestScore = 9999;
  options.forEach((opt, idx) => {
    if (opt.compositeScore < lowestScore) {
      lowestScore = opt.compositeScore;
      bestIdx = idx;
    }
  });

  const best = options[bestIdx];
  best.isRecommended = true;

  if (best.mode === 'CHENNAI_METRO' || best.mode === 'MULTIMODAL') {
    best.recommendationReason = `${best.modeLabel} is recommended because it provides ${best.carbonSavingsPercentVsCar}% lower tailpipe emissions and completely bypasses ${baseCongestion}% arterial corridor congestion while saving ₹${carCost - best.fareRupees} vs driving.`;
  } else if (best.mode === 'MTC_BUS') {
    best.recommendationReason = `MTC Bus is recommended for maximum cost efficiency at ₹${best.fareRupees} (${Math.round((1 - best.fareRupees/carCost)*100)}% cheaper than private car) with low per-capita emissions.`;
  } else if (best.mode === 'TWO_WHEELER') {
    best.recommendationReason = `Two-Wheeler is recommended for fastest door-to-door transit time (${best.totalTimeMinutes} mins) under current traffic bottlenecks.`;
  } else {
    best.recommendationReason = `Direct private vehicle provides seamless point-to-point transit, though with high fuel burn and ${carEmissions.co2Grams}g CO2 emissions.`;
  }

  return options;
}
