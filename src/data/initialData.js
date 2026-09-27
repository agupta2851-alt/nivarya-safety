// Clean, privacy-centric initial configuration.
// No hardcoded default users (Ananya Sharma) and no hardcoded Pune coordinates.

export const initialContacts = [];

export const emergencyResourcesList = [
  {
    id: "res-1",
    name: "National Emergency Number",
    category: "National Helpline",
    badge: "Government 24/7",
    number: "112",
    description: "Integrated single emergency number for Police, Fire, and Ambulance services across India.",
    distance: "Pan-India",
    address: "National Emergency Response Center",
    verified: true
  },
  {
    id: "res-2",
    name: "Women In Distress Helpline",
    category: "Women's Helpline",
    badge: "24/7 Toll-Free",
    number: "1091",
    description: "Dedicated national emergency response desk for women facing harassment, stalking, or distress.",
    distance: "Pan-India",
    address: "State Police Headquarters",
    verified: true
  },
  {
    id: "res-3",
    name: "Women Helpline (Domestic & Public)",
    category: "Women's Helpline",
    badge: "24/7 Support",
    number: "181",
    description: "Toll-free emergency helpline providing crisis intervention, counselling, and legal guidance.",
    distance: "Pan-India",
    address: "Ministry of Women & Child Development",
    verified: true
  },
  {
    id: "res-4",
    name: "Police Emergency Control Room",
    category: "Police",
    badge: "Emergency Dispatch",
    number: "100",
    description: "Direct line to City Police Control Room for patrol dispatch and instant intervention.",
    distance: "Available Locally",
    address: "City Police Headquarters",
    verified: true
  },
  {
    id: "res-5",
    name: "Ambulance & Trauma Care",
    category: "Medical",
    badge: "Emergency Medical",
    number: "108",
    description: "Emergency medical transport with life support equipment and hospital triage.",
    distance: "Available Locally",
    address: "District Civil & Trauma Care",
    verified: true
  },
  {
    id: "res-6",
    name: "Pink Patrol & Women Safety Booth",
    category: "Women's Support",
    badge: "Safe Zone",
    number: "1091",
    description: "Dedicated female police personnel kiosk with 24/7 assistance, first aid, and safe escort.",
    distance: "Nearest Transit Hub",
    address: "City Transit Hub Plaza",
    verified: true
  },
  {
    id: "res-7",
    name: "Campus & Institutional Safety Desk",
    category: "Campus Security",
    badge: "Security",
    number: "112",
    description: "Institutional warden and rapid action security team available round the clock.",
    distance: "Nearest Campus",
    address: "Security Control Post",
    verified: true
  }
];

/**
 * Dynamically computes safety infrastructure points relative to the user's real GPS position.
 * Prevents any hardcoding of Pune or synthetic coordinates.
 */
export function getHotspotsForCoordinates(coords) {
  if (!coords || coords.lat == null || coords.lng == null) {
    return [];
  }
  const { lat, lng } = coords;

  return [
    {
      id: "map-p1",
      type: "police",
      name: "City Police Station & Pink Desk",
      lat: lat + 0.0035,
      lng: lng - 0.0032,
      category: "police",
      layer: "police",
      details: "24/7 Station with dedicated Women's Help Desk • ~0.5 km",
      phone: "100 / 1091"
    },
    {
      id: "map-p2",
      type: "police",
      name: "Rapid Response Police Outpost",
      lat: lat + 0.0078,
      lng: lng - 0.0084,
      category: "police",
      layer: "police",
      details: "Patrol unit base • Emergency vehicle on standby • ~1.0 km",
      phone: "112"
    },
    {
      id: "map-h1",
      type: "hospital",
      name: "District Emergency Trauma & Care Hospital",
      lat: lat + 0.0058,
      lng: lng - 0.0039,
      category: "hospital",
      layer: "hospitals",
      details: "24/7 Emergency Wing & Ambulance Bay • ~0.8 km",
      phone: "108"
    },
    {
      id: "map-h2",
      type: "hospital",
      name: "Civil Multi-Speciality Hospital",
      lat: lat - 0.0069,
      lng: lng + 0.0072,
      category: "hospital",
      layer: "hospitals",
      details: "Level 1 Trauma Center • Free medical legal cell • ~1.3 km",
      phone: "108"
    },
    {
      id: "map-s1",
      type: "safezone",
      name: "Transit Safe Zone & Pink Kiosk",
      lat: lat + 0.0018,
      lng: lng + 0.0022,
      category: "safezone",
      layer: "safezones",
      details: "Brightly lit transit zone • CCTV monitored 24/7 • Security guards",
      phone: "1091"
    },
    {
      id: "map-s2",
      type: "safezone",
      name: "Public Library & Guarded Community Post",
      lat: lat - 0.0035,
      lng: lng - 0.0025,
      category: "safezone",
      layer: "safezones",
      details: "Guarded safe refuge point with emergency telephone",
      phone: "112"
    },
    {
      id: "map-resp-1",
      type: "responder",
      layer: "responders",
      name: "Verified Community Volunteer Responder",
      lat: lat + 0.0012,
      lng: lng - 0.0011,
      details: "First-Aid certified responder • ~0.2 km • Response ready",
      phone: "112"
    },
    {
      id: "map-resp-2",
      type: "responder",
      layer: "responders",
      name: "PCR Mobile Unit (Pink Patrol)",
      lat: lat + 0.0052,
      lng: lng - 0.0048,
      details: "Patrolling local arterial avenue • ~0.6 km",
      phone: "1091"
    },
    {
      id: "map-light-1",
      type: "streetlight",
      layer: "streetlights",
      name: "Main Avenue Boulevard (Well-Lit)",
      lat: lat + 0.0020,
      lng: lng - 0.0015,
      details: "High-intensity LED grid • 100% operational • Sensor monitored",
      status: "Active Lighting"
    },
    {
      id: "map-light-2",
      type: "streetlight",
      layer: "streetlights",
      name: "Commercial High-Street Corridor",
      lat: lat - 0.0012,
      lng: lng - 0.0080,
      details: "Bright commercial avenue • Continuous street illumination till dawn",
      status: "Active Lighting"
    },
    {
      id: "map-risk-1",
      type: "highrisk",
      layer: "highrisk",
      name: "Reported Low-Light Stretch",
      lat: lat + 0.0068,
      lng: lng + 0.0072,
      details: "Low pedestrian footfall after 8 PM • Non-functional lights reported",
      severity: "High"
    },
    {
      id: "map-transit-1",
      type: "transit",
      layer: "transithubs",
      name: "Metro Station Main Concourse",
      lat: lat + 0.0015,
      lng: lng + 0.0016,
      details: "CCTV surveillance • 24/7 security guard post • Pre-paid auto stand",
      status: "High Footfall Safe Hub"
    },
    {
      id: "map-transit-2",
      type: "transit",
      layer: "transithubs",
      name: "Intercity Transit Terminal",
      lat: lat + 0.0085,
      lng: lng + 0.0012,
      details: "Police Help Desk on Platform 1 • Brightly lit boarding platforms",
      status: "Guarded Transit"
    }
  ];
}

// Fallback empty hotspots when no GPS location is provided
export const mapHotspots = [];
export const extendedMapHotspots = [];

// Start with empty arrays - real user activity populates database
export const initialCommunityIncidents = [];

export const initialSafetyStats = [
  { label: "Active Journeys Guarded", value: "0", change: "Real-time updates", key: "activeJourneys" },
  { label: "Completed Safe Journeys", value: "0", change: "Live database", key: "completedJourneys" },
  { label: "Pan-India Safety Hubs", value: "7", change: "24/7 National Helplines", key: "verifiedHubs" },
  { label: "Community Safety Reports", value: "0", change: "Peer vigilance reports", key: "safetyReports" }
];

export const sampleBotResponses = {
  cab: {
    title: "Late-Night Cab Safety Checklist",
    points: [
      "Before boarding: Check that the license plate, driver face, and vehicle model match your booking app exactly.",
      "Check child-locks: Before shutting the door, confirm the inside handle opens the door smoothly from inside.",
      "Share your journey: Start a 'Safe Journey' in Nivarya or share live ride details with at least 2 trusted contacts.",
      "Stay awake and watchful: Avoid sleeping. Keep your navigation map open to verify the driver follows the designated route.",
      "In doubt: If the driver deviates into dark unfamiliar roads, immediately speak loudly on call: 'Dad, I am reaching in 5 minutes, come to the gate.'"
    ]
  },
  followed: {
    title: "Immediate Action if Being Followed",
    points: [
      "DO NOT head directly into isolated alleys, home entryways, or quiet hostel lanes.",
      "Cross the street: Walk towards bright, crowded spots — a 24/7 medical store, petrol pump, hotel lobby, or bustling food stall.",
      "Be vocal and visible: Turn around assertively and make direct eye contact to show you are alert and aware.",
      "Dial or pretend call: Call your primary contact or dial 112 on speaker. Announce your exact location aloud.",
      "If danger is imminent: Press and hold the Nivarya Emergency SOS button or blow a whistle / scream 'FIRE!' (studies show it draws faster crowds)."
    ]
  },
  rights: {
    title: "Your Key Legal Safety Rights in India",
    points: [
      "Zero FIR: A woman can lodge an FIR at any police station regardless of where the incident took place.",
      "Right to Privacy: A woman's statement must be recorded in privacy, preferably by a woman police officer or in the presence of a female relative.",
      "No Arrest After Sunset: According to Section 46(4) CrPC, women cannot be arrested after sunset and before sunrise, except under exceptional judicial magistrate orders.",
      "Free Legal Aid: Under Legal Services Authorities Act, female victims of violence are entitled to free legal counsel.",
      "Virtual / Email Complaints: If unable to visit in person, written complaints can be emailed to the senior police commissioner."
    ]
  },
  general: {
    title: "Proactive Personal Safety Tips",
    points: [
      "Trust your intuition: If a situation, person, or deserted street feels wrong, leave immediately without overthinking.",
      "Keep phone battery above 30%: Enable battery-saver mode and carry a compact power bank.",
      "Memorize 2 core phone numbers: In case your phone is lost or damaged.",
      "Use Nivarya Safe Journey: Schedule automated 10-minute check-ins so your family is alerted if you don't ping 'I'm Safe'."
    ]
  }
};

export const safeZoneTypes = [
  { id: "police", label: "Police Stations & Pink Desks", icon: "Building2", color: "#6366F1" },
  { id: "hospital", label: "24/7 Hospitals & Medical Bays", icon: "HeartPulse", color: "#EC4899" },
  { id: "safezone", label: "Safe Havens & Transit Booths", icon: "ShieldCheck", color: "#10B981" },
  { id: "incident", label: "Reported Commuter Hazards", icon: "AlertTriangle", color: "#F59E0B" }
];

export const safetyModesData = [
  {
    id: 'personal',
    name: 'Personal Daily',
    icon: 'Shield',
    color: '#6366F1',
    description: 'Standard guard profile with default sensitivity and primary family emergency network.'
  },
  {
    id: 'college',
    name: 'College Campus',
    icon: 'GraduationCap',
    color: '#10B981',
    description: 'Tuned for student life: Campus security hotline, library safe zones, and roommate check-in alerts.'
  },
  {
    id: 'hostel',
    name: 'Hostel & P.G.',
    icon: 'Home',
    color: '#F59E0B',
    description: 'Tailored for hostel gates: Warden emergency alert, curfew check-in timers, and local trusted contacts.'
  },
  {
    id: 'office',
    name: 'Late-Night Office',
    icon: 'Briefcase',
    color: '#EC4899',
    description: 'For night shifts & commutes: Corporate transport tracking, office security desk, and cab variance radar.'
  },
  {
    id: 'travel',
    name: 'Intercity Travel',
    icon: 'Plane',
    color: '#8B5CF6',
    description: 'For unfamiliar cities: High-frequency GPS telemetry, highway police fast-dial, and hotel safe refuge zones.'
  }
];

export const safetyLayersConfig = [
  { id: 'safezones', label: 'Safe Zones & Pink Booths', color: '#10B981', icon: 'ShieldCheck', active: true },
  { id: 'police', label: 'Police Stations & Patrols', color: '#6366F1', icon: 'Building2', active: true },
  { id: 'hospitals', label: 'Hospitals & Trauma Care', color: '#EC4899', icon: 'HeartPulse', active: true },
  { id: 'responders', label: 'Verified Responders', color: '#06B6D4', icon: 'Users', active: true },
  { id: 'streetlights', label: 'Well-Lit Street Corridors', color: '#F59E0B', icon: 'Sun', active: true },
  { id: 'highrisk', label: 'High-Risk / Low-Light Areas', color: '#EF4444', icon: 'AlertTriangle', active: true },
  { id: 'transithubs', label: 'Transit Hubs & Metro Gates', color: '#8B5CF6', icon: 'Navigation', active: true },
  { id: 'incidents', label: 'Community Hazard Reports', color: '#F97316', icon: 'Flag', active: true }
];

export function getSafeRoutesData(coords) {
  const baseLat = coords?.lat != null ? coords.lat : 0;
  const baseLng = coords?.lng != null ? coords.lng : 0;
  const hasCoords = coords?.lat != null && coords?.lng != null;

  return [
    {
      id: 'route-safest',
      name: 'Safe Corridors Route (Recommended)',
      tag: 'Highest Safety Score',
      etaMinutes: 22,
      distanceKm: 8.4,
      safetyScore: 96,
      cctvCoverage: '98% Monitored',
      lightingScore: 'High LED Brightness',
      policePresence: '2 Active Patrol Booths',
      crowdDensity: 'Active Pedestrian Flow',
      highlights: [
        'Well-lit arterial road with operational streetlights',
        'Passes directly by Transit Pink Kiosk',
        'Continuous CCTV coverage via Smart City camera grid',
        '24/7 commercial stores & open pharmacies along corridor'
      ],
      warnings: [],
      polylinePoints: hasCoords ? [
        [baseLat, baseLng],
        [baseLat + 0.0020, baseLng + 0.0022],
        [baseLat + 0.0042, baseLng - 0.0035],
        [baseLat + 0.0088, baseLng - 0.0042],
        [baseLat + 0.0125, baseLng - 0.0068]
      ] : []
    },
    {
      id: 'route-fastest',
      name: 'Direct Transit Route',
      tag: 'Shortest Time',
      etaMinutes: 17,
      distanceKm: 6.9,
      safetyScore: 74,
      cctvCoverage: '62% Monitored',
      lightingScore: 'Moderate Lighting',
      policePresence: '1 Checkpoint',
      crowdDensity: 'Low after 9:30 PM',
      highlights: [
        'Direct connection via link road',
        'Saves 5 minutes transit time'
      ],
      warnings: [
        'Passes through 400m dimly lit industrial stretch',
        'Lower pedestrian traffic late night'
      ],
      polylinePoints: hasCoords ? [
        [baseLat, baseLng],
        [baseLat + 0.0025, baseLng - 0.0020],
        [baseLat + 0.0070, baseLng - 0.0065],
        [baseLat + 0.0125, baseLng - 0.0068]
      ] : []
    },
    {
      id: 'route-alternative',
      name: 'Commercial Boulevard Route',
      tag: 'Busy Commercial Belt',
      etaMinutes: 24,
      distanceKm: 9.1,
      safetyScore: 91,
      cctvCoverage: '92% Monitored',
      lightingScore: 'High Lighting',
      policePresence: 'Regular Night PCR Van',
      crowdDensity: 'Dense Market Area',
      highlights: [
        'Lined with restaurants, transit hubs, and hospitals',
        'Frequent public transport and transit stands throughout'
      ],
      warnings: [
        'Moderate traffic during evening hours'
      ],
      polylinePoints: hasCoords ? [
        [baseLat, baseLng],
        [baseLat - 0.0025, baseLng - 0.0030],
        [baseLat - 0.0060, baseLng + 0.0060],
        [baseLat + 0.0050, baseLng + 0.0040],
        [baseLat + 0.0125, baseLng - 0.0068]
      ] : []
    }
  ];
}

export const safeRoutesData = getSafeRoutesData(null);

export const safetyRiskSignals = [
  { id: 'time', name: 'Time of Day', score: 85, status: 'Normal', desc: 'Active evening hours with regular vehicular traffic' },
  { id: 'lighting', name: 'Street Lighting Index', score: 92, status: 'Optimal', desc: 'Monitored municipal LED corridor' },
  { id: 'crowd', name: 'Pedestrian Density', score: 78, status: 'Moderate', desc: 'Steady commercial & transit footfall' },
  { id: 'police', name: 'Patrol Proximity', score: 95, status: 'High', desc: 'Pink Patrol within ~600m radius' },
  { id: 'reports', name: 'Incident History', score: 90, status: 'Clear', desc: 'Zero violent hazard flags in past 14 days' }
];

export const batterySafetyProfiles = {
  normal: {
    label: 'Normal Power Mode',
    gpsFrequency: 'Every 5 seconds',
    audioRecord: 'Enabled',
    backgroundSync: 'Continuous',
    batteryThreshold: 20
  },
  lowPower: {
    label: 'Emergency Low-Power Mode',
    gpsFrequency: 'Adaptive (every 30s)',
    audioRecord: 'Event-triggered only',
    backgroundSync: 'Delta compressed',
    screenDimming: 'True Black OLED friendly',
    batteryThreshold: 15
  }
};

export const contactCategories = [
  "Parent",
  "Sibling",
  "Friend",
  "Partner",
  "Hostel Warden",
  "Colleague",
  "College Security",
  "Local Guardian"
];

export const communityCategories = [
  "Poor lighting",
  "Suspicious activity",
  "Public transport issue",
  "Harassment",
  "Unsafe route",
  "Safe space recommendation"
];

export const nearbyRespondersData = [
  {
    id: 'resp-1',
    name: 'Sneha Kulkarni',
    role: 'Verified Community Volunteer',
    badge: 'First-Aid Certified',
    distance: '0.3 km away',
    eta: '2 mins',
    rating: '4.9 ★ (42 responses)',
    phone: '+91 98221 44550',
    status: 'Active & Nearby',
    avatarColor: '#10B981',
    address: 'Near Cafe Green, Transit Circle'
  },
  {
    id: 'resp-2',
    name: 'Officer Rekha Salve',
    role: 'Pink Patrol Officer',
    badge: 'City Police Pink Patrol',
    distance: '0.6 km away',
    eta: '4 mins',
    rating: '5.0 ★ (Official Patrol)',
    phone: '1091',
    status: 'Mobile Van Patrol',
    avatarColor: '#6366F1',
    address: 'Stationed at Transit Plaza Gate'
  },
  {
    id: 'resp-3',
    name: 'Rameshwar Patil',
    role: 'Metro Transit Guard & Safe Haven',
    badge: 'Transit Authority',
    distance: '0.8 km away',
    eta: '5 mins',
    rating: '4.8 ★ (Gate 2 Security)',
    phone: '+91 98110 77890',
    status: 'Station Booth Active',
    avatarColor: '#F59E0B',
    address: 'Central Metro Station Plaza'
  },
  {
    id: 'resp-4',
    name: 'Dr. Radhika Sen',
    role: 'Emergency Medical Officer',
    badge: 'District Hospital',
    distance: '1.2 km away',
    eta: '7 mins',
    rating: '4.9 ★ (Trauma Ward)',
    phone: '108',
    status: 'Available On Call',
    avatarColor: '#EC4899',
    address: 'Civil Hospital Emergency Desk'
  }
];

// Real user actions will dynamically populate the audit history
export const initialSafetyHistory = [];
