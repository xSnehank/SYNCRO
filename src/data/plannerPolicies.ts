import { CityPlannerPolicy } from '../types';

export const CHENNAI_PLANNER_POLICIES: CityPlannerPolicy[] = [
  {
    id: 'policy_omr_brt',
    title: 'OMR Dedicated Electric Feeder & BRT Corridor',
    category: 'Transit Expansion',
    targetCorridor: 'Rajiv Gandhi Salai (Madhya Kailash to Siruseri)',
    estimatedCostCrores: 180,
    implementationTimeMonths: 14,
    projectedEmissionsReductionPercent: 24.5,
    projectedCongestionReductionPercent: 28.0,
    projectedModalShiftPercent: 16.5,
    benefitCostRatio: 3.8,
    description: 'Establish high-frequency dedicated median electric bus lanes with pre-boarding fare collection, linking Madhya Kailash, TIDEL, Sholinganallur, and SIPCOT Siruseri.'
  },
  {
    id: 'policy_kathipara_hub',
    title: 'Kathipara Intermodal Hub & Park-and-Ride Expansion',
    category: 'Transit Expansion',
    targetCorridor: 'Guindy - Kathipara Cloverleaf',
    estimatedCostCrores: 95,
    implementationTimeMonths: 10,
    projectedEmissionsReductionPercent: 14.0,
    projectedCongestionReductionPercent: 19.5,
    projectedModalShiftPercent: 11.0,
    benefitCostRatio: 4.2,
    description: 'Integrate automated multi-level parking for 2,500 cars and 6,000 two-wheelers directly connected to Guindy & Alandur Metro with integrated unified ticketing.'
  },
  {
    id: 'policy_adaptive_signals',
    title: 'CUMTA-Wide AI Adaptive Signal Synchronization (Green-Wave)',
    category: 'Signal Intelligence',
    targetCorridor: 'Anna Salai, Poonamallee High Road & Inner Ring Road',
    estimatedCostCrores: 42,
    implementationTimeMonths: 6,
    projectedEmissionsReductionPercent: 11.5,
    projectedCongestionReductionPercent: 18.0,
    projectedModalShiftPercent: 4.5,
    benefitCostRatio: 6.4,
    description: 'Deploy real-time computer-vision and sensor-driven traffic signal adjustments to minimize idling delay at 85 high-volume junctions across Chennai.'
  },
  {
    id: 'policy_ev_shared_feeder',
    title: 'Last-Mile Electric Auto-Rickshaw Geofenced Networks',
    category: 'Fleet Electrification',
    targetCorridor: 'Velachery, Porur, and Airport Metros',
    estimatedCostCrores: 60,
    implementationTimeMonths: 8,
    projectedEmissionsReductionPercent: 18.2,
    projectedCongestionReductionPercent: 12.0,
    projectedModalShiftPercent: 9.5,
    benefitCostRatio: 3.5,
    description: 'Subsidize and organize 5,000 shared electric 3-wheelers operating fixed 3km radial loops feeding major Metro and Suburban stations.'
  },
  {
    id: 'policy_peak_freight_curfew',
    title: 'Time-of-Day Urban Freight Demarcation & Off-Peak Logistics',
    category: 'Congestion Pricing',
    targetCorridor: 'GST Road, Mount-Poonamallee & 100ft Road',
    estimatedCostCrores: 15,
    implementationTimeMonths: 3,
    projectedEmissionsReductionPercent: 13.8,
    projectedCongestionReductionPercent: 16.5,
    projectedModalShiftPercent: 2.0,
    benefitCostRatio: 5.8,
    description: 'Prohibit heavy 3-axle+ commercial freight vehicles from arterial corridors during 07:30–11:00 and 16:30–20:30 with smart ANPR enforcement.'
  },
  {
    id: 'policy_vit_express_link',
    title: 'Outer South (VIT-Kelambakkam) Fast-Transit Express',
    category: 'Transit Expansion',
    targetCorridor: 'Vandalur-Kelambakkam Road (VIT to Tambaram / OMR)',
    estimatedCostCrores: 50,
    implementationTimeMonths: 6,
    projectedEmissionsReductionPercent: 12.0,
    projectedCongestionReductionPercent: 14.5,
    projectedModalShiftPercent: 14.0,
    benefitCostRatio: 3.9,
    description: 'Deploy air-conditioned high-capacity student & commuter express shuttle buses connecting VIT Chennai directly to Tambaram Railway Terminal and Siruseri IT corridor.'
  }
];
