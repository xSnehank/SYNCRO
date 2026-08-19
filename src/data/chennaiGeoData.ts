import { LandmarkNode, RoadSegment, TransitRoute, HotspotArea } from '../types';

export const CHENNAI_CENTER: [number, number] = [80.2200, 13.0400]; // [lng, lat]
export const CHENNAI_DEFAULT_ZOOM = 11.5;

export const CHENNAI_LANDMARKS: LandmarkNode[] = [
  {
    id: 'vit_chennai',
    name: 'VIT Chennai (Vandalur-Kelambakkam)',
    tamilName: 'விஐடி சென்னை',
    category: 'education',
    coordinate: { lat: 12.8406, lng: 80.1534 },
    description: 'Premier university campus on Vandalur-Kelambakkam Road, heavy student & faculty transit traffic.',
    connectedModes: ['MTC_BUS', 'AUTO_RICKSHAW', 'CAR_PETROL', 'TWO_WHEELER']
  },
  {
    id: 'siruseri_sipcot',
    name: 'SIPCOT IT Park, Siruseri',
    tamilName: 'சிறுசேரி சிப்காட்',
    category: 'tech_park',
    coordinate: { lat: 12.8290, lng: 80.2185 },
    description: 'Largest IT corridor terminus in Asia with over 100,000 tech employees traveling on OMR daily.',
    connectedModes: ['MTC_BUS', 'CAR_PETROL', 'CAR_EV', 'TWO_WHEELER', 'MULTIMODAL']
  },
  {
    id: 'sholinganallur',
    name: 'Sholinganallur Junction (OMR - ECR Link)',
    tamilName: 'சோழிங்கநல்லூர் சந்திப்பு',
    category: 'commercial',
    coordinate: { lat: 12.9010, lng: 80.2279 },
    description: 'Major IT & transportation crossroads on OMR connecting Medavakkam, ECR, and Siruseri.',
    connectedModes: ['MTC_BUS', 'CAR_PETROL', 'TWO_WHEELER', 'AUTO_RICKSHAW']
  },
  {
    id: 'tidel_park',
    name: 'TIDEL Park, Tharamani',
    tamilName: 'டைடல் பார்க்',
    category: 'tech_park',
    coordinate: { lat: 12.9892, lng: 80.2482 },
    description: 'Pioneering IT landmark at the gateway to OMR with direct access to Thiruvanmiyur MRTS station.',
    connectedModes: ['SUBURBAN_RAIL', 'MTC_BUS', 'CAR_PETROL', 'CAR_EV', 'WALK']
  },
  {
    id: 'chennai_central',
    name: 'Puratchi Thalaivar Dr. M.G.R Chennai Central',
    tamilName: 'சென்னை சென்ட்ரல்',
    category: 'transit_hub',
    coordinate: { lat: 13.0827, lng: 80.2755 },
    description: 'Apex multimodal transport node uniting Intercity rail, Metro Blue & Green lines, Suburban lines, and MTC buses.',
    connectedModes: ['CHENNAI_METRO', 'SUBURBAN_RAIL', 'MTC_BUS', 'CAR_PETROL', 'AUTO_RICKSHAW', 'WALK']
  },
  {
    id: 'chennai_egmore',
    name: 'Chennai Egmore Railway Station',
    tamilName: 'சென்னை எழும்பூர்',
    category: 'transit_hub',
    coordinate: { lat: 13.0784, lng: 80.2612 },
    description: 'Major southern railway terminal with integrated Metro Green Line station.',
    connectedModes: ['CHENNAI_METRO', 'SUBURBAN_RAIL', 'MTC_BUS', 'AUTO_RICKSHAW']
  },
  {
    id: 'guindy_junction',
    name: 'Guindy Industrial & Transit Hub',
    tamilName: 'கிண்டி',
    category: 'transit_hub',
    coordinate: { lat: 13.0067, lng: 80.2106 },
    description: 'Critical intersection of Mount Road, GST Road, and Inner Ring Road with Metro Blue Line & Suburban interchange.',
    connectedModes: ['CHENNAI_METRO', 'SUBURBAN_RAIL', 'MTC_BUS', 'CAR_PETROL', 'AUTO_RICKSHAW']
  },
  {
    id: 'chennai_airport',
    name: 'Chennai International Airport (MAA)',
    tamilName: 'சென்னை விமான நிலையம்',
    category: 'airport',
    coordinate: { lat: 12.9941, lng: 80.1709 },
    description: 'Direct Metro Blue Line terminal with airport shuttle and heavy GST road taxi corridor.',
    connectedModes: ['CHENNAI_METRO', 'CAR_PETROL', 'CAR_EV', 'MTC_BUS']
  },
  {
    id: 'tambaram_hub',
    name: 'Tambaram Railway & Bus Terminal',
    tamilName: 'தாம்பரம்',
    category: 'transit_hub',
    coordinate: { lat: 12.9249, lng: 80.1190 },
    description: 'Gateway to Southern Tamil Nadu with massive suburban rail and MTC bus transfer volume.',
    connectedModes: ['SUBURBAN_RAIL', 'MTC_BUS', 'CAR_PETROL', 'TWO_WHEELER', 'AUTO_RICKSHAW']
  },
  {
    id: 't_nagar',
    name: 'T. Nagar (Pondy Bazaar / Panagal Park)',
    tamilName: 'தி. நகர்',
    category: 'commercial',
    coordinate: { lat: 13.0418, lng: 80.2341 },
    description: 'High-density commercial retail zone with pedestrian plaza, heavy bus network, and Mambalam suburban station.',
    connectedModes: ['SUBURBAN_RAIL', 'MTC_BUS', 'AUTO_RICKSHAW', 'WALK']
  },
  {
    id: 'anna_nagar',
    name: 'Anna Nagar Roundtana',
    tamilName: 'அண்ணா நகர்',
    category: 'residential',
    coordinate: { lat: 13.0850, lng: 80.2101 },
    description: 'Planned residential and commercial hub with Metro Green Line underground station.',
    connectedModes: ['CHENNAI_METRO', 'MTC_BUS', 'CAR_PETROL', 'TWO_WHEELER']
  },
  {
    id: 'velachery_hub',
    name: 'Velachery MRTS & Vijayanagar Junction',
    tamilName: 'வேளச்சேரி',
    category: 'transit_hub',
    coordinate: { lat: 12.9759, lng: 80.2212 },
    description: 'Rapidly expanding residential-commercial transit junction connecting South Chennai to OMR and Guindy.',
    connectedModes: ['SUBURBAN_RAIL', 'MTC_BUS', 'AUTO_RICKSHAW', 'TWO_WHEELER']
  },
  {
    id: 'porur_junction',
    name: 'Porur Toll / Mount-Poonamallee Junction',
    tamilName: 'போரூர்',
    category: 'commercial',
    coordinate: { lat: 13.0336, lng: 80.1585 },
    description: 'Western corridor bottleneck connecting DLF IT Park, Sri Ramachandra Medical, and outer ring road.',
    connectedModes: ['MTC_BUS', 'CAR_PETROL', 'TWO_WHEELER', 'AUTO_RICKSHAW']
  },
  {
    id: 'adyar_junction',
    name: 'Adyar Signal & Malar Hospital Corner',
    tamilName: 'அடையாறு',
    category: 'commercial',
    coordinate: { lat: 13.0064, lng: 80.2558 },
    description: 'Scenic bridge crossing connecting South Beach road, Besant Nagar, and Madhya Kailash entrance to OMR.',
    connectedModes: ['MTC_BUS', 'CAR_PETROL', 'TWO_WHEELER', 'WALK']
  },
  {
    id: 'koyambedu_cmbt',
    name: 'Koyambedu CMBT & Metro Interchange',
    tamilName: 'கோயம்பேடு',
    category: 'transit_hub',
    coordinate: { lat: 13.0694, lng: 80.1948 },
    description: 'Massive transit hub with Chennai Metro Green Line, vegetable wholesale market, and arterial ring road.',
    connectedModes: ['CHENNAI_METRO', 'MTC_BUS', 'CAR_PETROL', 'AUTO_RICKSHAW']
  }
];

export const CHENNAI_ROAD_CORRIDORS: RoadSegment[] = [
  {
    id: 'omr_corridor_1',
    name: 'OMR / Rajiv Gandhi Salai (Madhya Kailash to Sholinganallur)',
    corridor: 'Old Mahabalipuram Road (IT Corridor)',
    coordinates: [
      [80.2480, 13.0060], // Madhya Kailash
      [80.2482, 12.9892], // Tidel Park
      [80.2440, 12.9640], // Perungudi
      [80.2360, 12.9350], // Thoraipakkam
      [80.2279, 12.9010], // Sholinganallur
    ],
    lengthKm: 12.4,
    speedLimitKm: 60,
    currentSpeedKm: 18.5,
    freeFlowSpeedKm: 52,
    trafficDensity: 'SEVERE',
    congestionIndex: 86,
    estimatedIdleMinPerKm: 2.3,
    hourlyVehicleVolume: 11400,
    emissions: {
      co2KgPerHour: 2820,
      noxGramsPerHour: 14200,
      pm25GramsPerHour: 980,
      idleFuelWastedLitersPerHour: 1180
    },
    pollutionRisk: 'HAZARDOUS',
    provenance: 'ESTIMATED',
    historicalTrend: [
      { hour: '08:00', speed: 14, congestion: 92 },
      { hour: '11:00', speed: 26, congestion: 68 },
      { hour: '14:00', speed: 34, congestion: 52 },
      { hour: '18:00', speed: 12, congestion: 96 },
      { hour: '21:00', speed: 28, congestion: 64 },
    ]
  },
  {
    id: 'omr_corridor_2',
    name: 'OMR Expressway (Sholinganallur to Siruseri SIPCOT)',
    corridor: 'Old Mahabalipuram Road (Outer IT Express)',
    coordinates: [
      [80.2279, 12.9010], // Sholinganallur
      [80.2260, 12.8710], // Semmancheri
      [80.2240, 12.8450], // Navalur
      [80.2185, 12.8290], // Siruseri SIPCOT
    ],
    lengthKm: 8.6,
    speedLimitKm: 60,
    currentSpeedKm: 24.0,
    freeFlowSpeedKm: 55,
    trafficDensity: 'HIGH',
    congestionIndex: 72,
    estimatedIdleMinPerKm: 1.6,
    hourlyVehicleVolume: 8200,
    emissions: {
      co2KgPerHour: 1640,
      noxGramsPerHour: 8900,
      pm25GramsPerHour: 580,
      idleFuelWastedLitersPerHour: 680
    },
    pollutionRisk: 'HIGH',
    provenance: 'ESTIMATED',
    historicalTrend: [
      { hour: '08:00', speed: 18, congestion: 84 },
      { hour: '11:00', speed: 32, congestion: 58 },
      { hour: '14:00', speed: 40, congestion: 42 },
      { hour: '18:00', speed: 16, congestion: 89 },
      { hour: '21:00', speed: 35, congestion: 51 },
    ]
  },
  {
    id: 'anna_salai_corridor',
    name: 'Anna Salai / Mount Road (Central to Guindy Kathipara)',
    corridor: 'Mount Road Arterial Spine',
    coordinates: [
      [80.2755, 13.0827], // Central
      [80.2630, 13.0600], // Thousand Lights
      [80.2450, 13.0370], // Teynampet / Nandanam
      [80.2230, 13.0180], // Saidapet
      [80.2070, 13.0060], // Guindy Kathipara
    ],
    lengthKm: 11.2,
    speedLimitKm: 50,
    currentSpeedKm: 21.0,
    freeFlowSpeedKm: 48,
    trafficDensity: 'HIGH',
    congestionIndex: 78,
    estimatedIdleMinPerKm: 1.9,
    hourlyVehicleVolume: 12800,
    emissions: {
      co2KgPerHour: 2450,
      noxGramsPerHour: 13100,
      pm25GramsPerHour: 870,
      idleFuelWastedLitersPerHour: 990
    },
    pollutionRisk: 'HIGH',
    provenance: 'ESTIMATED',
    historicalTrend: [
      { hour: '08:00', speed: 16, congestion: 88 },
      { hour: '11:00', speed: 28, congestion: 65 },
      { hour: '14:00', speed: 35, congestion: 48 },
      { hour: '18:00', speed: 14, congestion: 92 },
      { hour: '21:00', speed: 30, congestion: 55 },
    ]
  },
  {
    id: 'gst_road_corridor',
    name: 'Grand Southern Trunk (GST) Road (Guindy to Tambaram)',
    corridor: 'GST National Highway 45',
    coordinates: [
      [80.2070, 13.0060], // Kathipara
      [80.1709, 12.9941], // Airport
      [80.1500, 12.9680], // Pallavaram
      [80.1380, 12.9510], // Chromepet
      [80.1190, 12.9249], // Tambaram
    ],
    lengthKm: 13.8,
    speedLimitKm: 70,
    currentSpeedKm: 26.5,
    freeFlowSpeedKm: 62,
    trafficDensity: 'HIGH',
    congestionIndex: 69,
    estimatedIdleMinPerKm: 1.4,
    hourlyVehicleVolume: 14200,
    emissions: {
      co2KgPerHour: 3100,
      noxGramsPerHour: 16800,
      pm25GramsPerHour: 1120,
      idleFuelWastedLitersPerHour: 1240
    },
    pollutionRisk: 'HIGH',
    provenance: 'ESTIMATED',
    historicalTrend: [
      { hour: '08:00', speed: 20, congestion: 82 },
      { hour: '11:00', speed: 36, congestion: 54 },
      { hour: '14:00', speed: 45, congestion: 38 },
      { hour: '18:00', speed: 19, congestion: 86 },
      { hour: '21:00', speed: 38, congestion: 48 },
    ]
  },
  {
    id: 'inner_ring_road',
    name: '100 Feet Road / Jawaharlal Nehru Salai (Koyambedu to Guindy)',
    corridor: 'Inner Ring Road',
    coordinates: [
      [80.1948, 13.0694], // Koyambedu
      [80.2050, 13.0510], // Vadapalani
      [80.2100, 13.0340], // Ashok Nagar
      [80.2106, 13.0067], // Guindy
    ],
    lengthKm: 8.5,
    speedLimitKm: 50,
    currentSpeedKm: 17.2,
    freeFlowSpeedKm: 46,
    trafficDensity: 'SEVERE',
    congestionIndex: 82,
    estimatedIdleMinPerKm: 2.1,
    hourlyVehicleVolume: 9600,
    emissions: {
      co2KgPerHour: 2150,
      noxGramsPerHour: 11500,
      pm25GramsPerHour: 790,
      idleFuelWastedLitersPerHour: 880
    },
    pollutionRisk: 'HAZARDOUS',
    provenance: 'ESTIMATED',
    historicalTrend: [
      { hour: '08:00', speed: 13, congestion: 91 },
      { hour: '11:00', speed: 24, congestion: 71 },
      { hour: '14:00', speed: 32, congestion: 55 },
      { hour: '18:00', speed: 12, congestion: 95 },
      { hour: '21:00', speed: 26, congestion: 67 },
    ]
  },
  {
    id: 'mount_poonamallee',
    name: 'Mount-Poonamallee High Road (Kathipara to Porur)',
    corridor: 'Western IT & Industrial Corridor',
    coordinates: [
      [80.2070, 13.0060], // Kathipara
      [80.1820, 13.0180], // DLF Ramapuram
      [80.1585, 13.0336], // Porur Junction
    ],
    lengthKm: 6.8,
    speedLimitKm: 50,
    currentSpeedKm: 15.0,
    freeFlowSpeedKm: 48,
    trafficDensity: 'SEVERE',
    congestionIndex: 88,
    estimatedIdleMinPerKm: 2.5,
    hourlyVehicleVolume: 8900,
    emissions: {
      co2KgPerHour: 1980,
      noxGramsPerHour: 10400,
      pm25GramsPerHour: 760,
      idleFuelWastedLitersPerHour: 820
    },
    pollutionRisk: 'HAZARDOUS',
    provenance: 'ESTIMATED',
    historicalTrend: [
      { hour: '08:00', speed: 11, congestion: 94 },
      { hour: '11:00', speed: 22, congestion: 74 },
      { hour: '14:00', speed: 30, congestion: 58 },
      { hour: '18:00', speed: 10, congestion: 98 },
      { hour: '21:00', speed: 22, congestion: 72 },
    ]
  },
  {
    id: 'velachery_bypass',
    name: 'Velachery Bypass & Taramani Link Road',
    corridor: 'South Arterial Connector',
    coordinates: [
      [80.2106, 13.0067], // Guindy
      [80.2212, 12.9759], // Velachery Vijayanagar
      [80.2482, 12.9892], // Taramani / TIDEL
    ],
    lengthKm: 7.2,
    speedLimitKm: 50,
    currentSpeedKm: 19.0,
    freeFlowSpeedKm: 45,
    trafficDensity: 'HIGH',
    congestionIndex: 75,
    estimatedIdleMinPerKm: 1.8,
    hourlyVehicleVolume: 7400,
    emissions: {
      co2KgPerHour: 1520,
      noxGramsPerHour: 8100,
      pm25GramsPerHour: 550,
      idleFuelWastedLitersPerHour: 620
    },
    pollutionRisk: 'HIGH',
    provenance: 'ESTIMATED',
    historicalTrend: [
      { hour: '08:00', speed: 15, congestion: 85 },
      { hour: '11:00', speed: 27, congestion: 64 },
      { hour: '14:00', speed: 34, congestion: 50 },
      { hour: '18:00', speed: 14, congestion: 89 },
      { hour: '21:00', speed: 28, congestion: 60 },
    ]
  },
  {
    id: 'vandalur_kelambakkam',
    name: 'Vandalur-Kelambakkam Road (VIT Chennai Corridor)',
    corridor: 'Outer South Link',
    coordinates: [
      [80.0820, 12.8900], // Vandalur Zoo
      [80.1534, 12.8406], // VIT Chennai
      [80.1890, 12.8120], // Mambakkam
      [80.2200, 12.7850], // Kelambakkam Junction
    ],
    lengthKm: 17.5,
    speedLimitKm: 60,
    currentSpeedKm: 38.0,
    freeFlowSpeedKm: 58,
    trafficDensity: 'MODERATE',
    congestionIndex: 48,
    estimatedIdleMinPerKm: 0.8,
    hourlyVehicleVolume: 4900,
    emissions: {
      co2KgPerHour: 980,
      noxGramsPerHour: 4900,
      pm25GramsPerHour: 340,
      idleFuelWastedLitersPerHour: 390
    },
    pollutionRisk: 'MODERATE',
    provenance: 'ESTIMATED',
    historicalTrend: [
      { hour: '08:00', speed: 28, congestion: 62 },
      { hour: '11:00', speed: 42, congestion: 42 },
      { hour: '14:00', speed: 48, congestion: 32 },
      { hour: '18:00', speed: 26, congestion: 68 },
      { hour: '21:00', speed: 44, congestion: 38 },
    ]
  }
];

export const CHENNAI_TRANSIT_ROUTES: TransitRoute[] = [
  {
    id: 'metro_blue',
    shortName: 'Blue Line',
    longName: 'Wimco Nagar Depot ↔ Chennai International Airport',
    type: 'METRO',
    color: '#0284c7', // Sky blue
    coordinates: [
      [80.3012, 13.1670], // Wimco Nagar
      [80.2910, 13.1250], // Tollgate
      [80.2755, 13.0827], // Chennai Central (Interchange)
      [80.2630, 13.0600], // LIC
      [80.2450, 13.0370], // Nandanam
      [80.2230, 13.0180], // Saidapet
      [80.2106, 13.0067], // Guindy
      [80.1980, 13.0010], // Alandur (Interchange)
      [80.1709, 12.9941], // Chennai Airport
    ],
    stops: [
      { id: 'wimco', name: 'Wimco Nagar', coordinate: { lat: 13.1670, lng: 80.3012 } },
      { id: 'central_m', name: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central', coordinate: { lat: 13.0827, lng: 80.2755 }, isInterchange: true },
      { id: 'lic', name: 'LIC', coordinate: { lat: 13.0640, lng: 80.2650 } },
      { id: 'thousand_lights', name: 'Thousand Lights', coordinate: { lat: 13.0560, lng: 80.2540 } },
      { id: 'nandanam', name: 'Nandanam', coordinate: { lat: 13.0370, lng: 80.2450 } },
      { id: 'saidapet', name: 'Saidapet', coordinate: { lat: 13.0180, lng: 80.2230 } },
      { id: 'guindy_m', name: 'Guindy', coordinate: { lat: 13.0067, lng: 80.2106 }, isInterchange: true },
      { id: 'alandur_m', name: 'Alandur', coordinate: { lat: 13.0010, lng: 80.1980 }, isInterchange: true },
      { id: 'airport_m', name: 'Chennai International Airport', coordinate: { lat: 12.9941, lng: 80.1709 } }
    ],
    frequencyMin: 4.5,
    fareBaseRupees: 20,
    averageSpeedKm: 36,
    dailyRidershipEstimate: 210000
  },
  {
    id: 'metro_green',
    shortName: 'Green Line',
    longName: 'Puratchi Thalaivar Dr. MGR Central ↔ St. Thomas Mount',
    type: 'METRO',
    color: '#16a34a', // Emerald Green
    coordinates: [
      [80.2755, 13.0827], // Chennai Central
      [80.2612, 13.0784], // Chennai Egmore
      [80.2310, 13.0790], // Shenoy Nagar
      [80.2101, 13.0850], // Anna Nagar Tower
      [80.1948, 13.0694], // CMBT Koyambedu
      [80.2050, 13.0510], // Vadapalani
      [80.2100, 13.0340], // Ashok Nagar
      [80.1980, 13.0010], // Alandur (Interchange)
      [80.1930, 12.9920], // St. Thomas Mount
    ],
    stops: [
      { id: 'central_mg', name: 'Chennai Central', coordinate: { lat: 13.0827, lng: 80.2755 }, isInterchange: true },
      { id: 'egmore_m', name: 'Chennai Egmore', coordinate: { lat: 13.0784, lng: 80.2612 }, isInterchange: true },
      { id: 'anna_nagar_m', name: 'Anna Nagar Tower', coordinate: { lat: 13.0850, lng: 80.2101 } },
      { id: 'cmbt_m', name: 'CMBT', coordinate: { lat: 13.0694, lng: 80.1948 } },
      { id: 'vadapalani_m', name: 'Vadapalani', coordinate: { lat: 13.0510, lng: 80.2050 } },
      { id: 'ashok_nagar_m', name: 'Ashok Nagar', coordinate: { lat: 13.0340, lng: 80.2100 } },
      { id: 'alandur_mg', name: 'Alandur', coordinate: { lat: 13.0010, lng: 80.1980 }, isInterchange: true },
      { id: 'st_thomas_m', name: 'St. Thomas Mount', coordinate: { lat: 12.9920, lng: 80.1930 }, isInterchange: true }
    ],
    frequencyMin: 5,
    fareBaseRupees: 20,
    averageSpeedKm: 34,
    dailyRidershipEstimate: 165000
  },
  {
    id: 'mtc_570',
    shortName: 'MTC 570',
    longName: 'CMBT Koyambedu ↔ Kelambakkam (via OMR)',
    type: 'MTC_BUS',
    color: '#f59e0b', // Amber
    coordinates: [
      [80.1948, 13.0694], // CMBT
      [80.2050, 13.0510], // Vadapalani
      [80.2106, 13.0067], // Guindy
      [80.2212, 12.9759], // Velachery
      [80.2482, 12.9892], // Tidel Park
      [80.2360, 12.9350], // Thoraipakkam
      [80.2279, 12.9010], // Sholinganallur
      [80.2185, 12.8290], // Siruseri SIPCOT
      [80.2200, 12.7850], // Kelambakkam
    ],
    stops: [
      { id: 'cmbt_b', name: 'CMBT', coordinate: { lat: 13.0694, lng: 80.1948 } },
      { id: 'guindy_b', name: 'Guindy Race Course', coordinate: { lat: 13.0067, lng: 80.2106 } },
      { id: 'velachery_b', name: 'Velachery Vijayanagar', coordinate: { lat: 12.9759, lng: 80.2212 } },
      { id: 'tidel_b', name: 'TIDEL Park', coordinate: { lat: 12.9892, lng: 80.2482 } },
      { id: 'thoraipakkam_b', name: 'Thoraipakkam Toll', coordinate: { lat: 12.9350, lng: 80.2360 } },
      { id: 'sholinganallur_b', name: 'Sholinganallur', coordinate: { lat: 12.9010, lng: 80.2279 } },
      { id: 'siruseri_b', name: 'SIPCOT Siruseri', coordinate: { lat: 12.8290, lng: 80.2185 } },
      { id: 'kelambakkam_b', name: 'Kelambakkam Bus Stand', coordinate: { lat: 12.7850, lng: 80.2200 } }
    ],
    frequencyMin: 8,
    fareBaseRupees: 15,
    averageSpeedKm: 21,
    dailyRidershipEstimate: 48000
  },
  {
    id: 'mtc_19b',
    shortName: 'MTC 19B',
    longName: 'T. Nagar ↔ Kelambakkam (via OMR & Madhya Kailash)',
    type: 'MTC_BUS',
    color: '#ec4899', // Pink
    coordinates: [
      [80.2341, 13.0418], // T Nagar
      [80.2450, 13.0180], // Saidapet
      [80.2480, 13.0060], // Madhya Kailash
      [80.2482, 12.9892], // Tidel Park
      [80.2279, 12.9010], // Sholinganallur
      [80.2185, 12.8290], // Siruseri
      [80.2200, 12.7850], // Kelambakkam
    ],
    stops: [
      { id: 'tnagar_b', name: 'T. Nagar Bus Terminus', coordinate: { lat: 13.0418, lng: 80.2341 } },
      { id: 'madhya_kailash_b', name: 'Madhya Kailash', coordinate: { lat: 13.0060, lng: 80.2480 } },
      { id: 'tidel_19b', name: 'TIDEL Park', coordinate: { lat: 12.9892, lng: 80.2482 } },
      { id: 'sholinganallur_19b', name: 'Sholinganallur', coordinate: { lat: 12.9010, lng: 80.2279 } },
      { id: 'siruseri_19b', name: 'Siruseri IT Park', coordinate: { lat: 12.8290, lng: 80.2185 } }
    ],
    frequencyMin: 10,
    fareBaseRupees: 15,
    averageSpeedKm: 19,
    dailyRidershipEstimate: 34000
  },
  {
    id: 'suburban_south',
    shortName: 'Suburban Southern Line',
    longName: 'Chennai Beach ↔ Chennai Central ↔ Guindy ↔ Tambaram ↔ Chengalpattu',
    type: 'SUBURBAN_TRAIN',
    color: '#8b5cf6', // Violet
    coordinates: [
      [80.2920, 13.0930], // Beach
      [80.2755, 13.0827], // Central / Park
      [80.2612, 13.0784], // Egmore
      [80.2341, 13.0418], // Mambalam (T Nagar)
      [80.2106, 13.0067], // Guindy
      [80.1930, 12.9920], // St. Thomas Mount
      [80.1500, 12.9680], // Pallavaram
      [80.1380, 12.9510], // Chromepet
      [80.1190, 12.9249], // Tambaram
      [80.0050, 12.6900], // Chengalpattu
    ],
    stops: [
      { id: 'beach_s', name: 'Chennai Beach', coordinate: { lat: 13.0930, lng: 80.2920 } },
      { id: 'park_s', name: 'Chennai Park (Opp Central)', coordinate: { lat: 13.0827, lng: 80.2755 }, isInterchange: true },
      { id: 'egmore_s', name: 'Chennai Egmore', coordinate: { lat: 13.0784, lng: 80.2612 }, isInterchange: true },
      { id: 'mambalam_s', name: 'Mambalam (T. Nagar)', coordinate: { lat: 13.0418, lng: 80.2341 } },
      { id: 'guindy_s', name: 'Guindy', coordinate: { lat: 13.0067, lng: 80.2106 }, isInterchange: true },
      { id: 'tambaram_s', name: 'Tambaram', coordinate: { lat: 12.9249, lng: 80.1190 }, isInterchange: true }
    ],
    frequencyMin: 6,
    fareBaseRupees: 5,
    averageSpeedKm: 42,
    dailyRidershipEstimate: 450000
  }
];

export const CHENNAI_HOTSPOTS: HotspotArea[] = [
  {
    id: 'hotspot_omr',
    name: 'OMR Sholinganallur & Perungudi Corridor',
    zone: 'South IT Zone (CUMTA Sector 7)',
    coordinate: { lat: 12.9010, lng: 80.2279 },
    congestionLevel: 'SEVERE',
    congestionScore: 89,
    pollutionRisk: 'HAZARDOUS',
    aqiEstimate: 178,
    peakDelayMinutes: 44,
    dailyEmissionsKgCO2: 38400,
    primaryBottleneckReason: 'Concentration of 45+ IT tech parks with 82% single-occupant private vehicle share and Metro Phase 2 construction diversions.',
    recommendedIntervention: 'Deploy dedicated high-frequency electric feeder buses from Guindy/Velachery + enforce smart signal priority at Sholinganallur intersection.',
    provenance: 'ESTIMATED'
  },
  {
    id: 'hotspot_guindy',
    name: 'Guindy Kathipara Cloverleaf & Mount Road Entry',
    zone: 'Central Transit Crossroads (CUMTA Sector 3)',
    coordinate: { lat: 13.0067, lng: 80.2106 },
    congestionLevel: 'HIGH',
    congestionScore: 81,
    pollutionRisk: 'HIGH',
    aqiEstimate: 162,
    peakDelayMinutes: 32,
    dailyEmissionsKgCO2: 31200,
    primaryBottleneckReason: 'Convergence point of GST Highway, 100 Ft Inner Ring Road, Mount Road, and Airport inbound traffic.',
    recommendedIntervention: 'Integrated multimodal transit park-and-ride ticketing at Guindy Metro + dynamic variable message lane management.',
    provenance: 'ESTIMATED'
  },
  {
    id: 'hotspot_porur',
    name: 'Porur Junction & Mount-Poonamallee Road',
    zone: 'Western Industrial Hub (CUMTA Sector 5)',
    coordinate: { lat: 13.0336, lng: 80.1585 },
    congestionLevel: 'SEVERE',
    congestionScore: 87,
    pollutionRisk: 'HAZARDOUS',
    aqiEstimate: 184,
    peakDelayMinutes: 38,
    dailyEmissionsKgCO2: 26900,
    primaryBottleneckReason: 'Heavy commercial freight mixing with tech commute traffic from DLF CyberCity and Sri Ramachandra Hospital corridor.',
    recommendedIntervention: 'Restrict heavy peak-hour freight access + accelerate EV auto-feeder networks to Alandur Metro.',
    provenance: 'ESTIMATED'
  },
  {
    id: 'hotspot_central',
    name: 'Chennai Central - Broadway - Wall Tax Road',
    zone: 'North Urban Core (CUMTA Sector 1)',
    coordinate: { lat: 13.0827, lng: 80.2755 },
    congestionLevel: 'HIGH',
    congestionScore: 76,
    pollutionRisk: 'HIGH',
    aqiEstimate: 154,
    peakDelayMinutes: 28,
    dailyEmissionsKgCO2: 24500,
    primaryBottleneckReason: 'Massive intermodal transfers with unorganized private auto idling and curbside parking bottlenecks.',
    recommendedIntervention: 'Organized geofenced zero-emission auto pick-up zones + direct pedestrian subterranean walkways to Suburban/Metro.',
    provenance: 'ESTIMATED'
  },
  {
    id: 'hotspot_velachery',
    name: 'Velachery Vijayanagar - 100ft Road Junction',
    zone: 'South Residential Gateway',
    coordinate: { lat: 12.9759, lng: 80.2212 },
    congestionLevel: 'HIGH',
    congestionScore: 78,
    pollutionRisk: 'HIGH',
    aqiEstimate: 158,
    peakDelayMinutes: 26,
    dailyEmissionsKgCO2: 19800,
    primaryBottleneckReason: 'Flyover bottleneck merging Tambaram bypass, MRTS commuter drop-offs, and Phoenix MarketCity retail traffic.',
    recommendedIntervention: 'Complete MRTS-St. Thomas Mount loop connection + smart adaptive signal timing.',
    provenance: 'ESTIMATED'
  }
];

export const AIR_QUALITY_SENSORS = [
  { id: 'cpcb_alandur', name: 'Alandur CPCB Station', coordinate: { lat: 12.9980, lng: 80.2010 }, pm25: 68, pm10: 124, nox: 48, aqi: 152, status: 'MODERATE_POOR', provenance: 'REAL' as const },
  { id: 'cpcb_manali', name: 'Manali Industrial CPCB', coordinate: { lat: 13.1670, lng: 80.2620 }, pm25: 92, pm10: 168, nox: 74, aqi: 198, status: 'POOR', provenance: 'REAL' as const },
  { id: 'cpcb_iitm', name: 'IIT Madras TNPCB Sensor', coordinate: { lat: 12.9915, lng: 80.2337 }, pm25: 34, pm10: 62, nox: 22, aqi: 82, status: 'SATISFACTORY', provenance: 'REAL' as const },
  { id: 'cpcb_central', name: 'Central Railway Station AirMon', coordinate: { lat: 13.0827, lng: 80.2755 }, pm25: 72, pm10: 138, nox: 58, aqi: 160, status: 'MODERATE_POOR', provenance: 'REAL' as const },
  { id: 'flow_omr_toll', name: 'Chennai Flow OMR Perungudi IoT Node', coordinate: { lat: 12.9640, lng: 80.2440 }, pm25: 84, pm10: 152, nox: 64, aqi: 176, status: 'POOR', provenance: 'ESTIMATED' as const },
  { id: 'flow_porur_node', name: 'Chennai Flow Porur Junction IoT Node', coordinate: { lat: 13.0336, lng: 80.1585 }, pm25: 88, pm10: 159, nox: 69, aqi: 182, status: 'POOR', provenance: 'ESTIMATED' as const }
];
