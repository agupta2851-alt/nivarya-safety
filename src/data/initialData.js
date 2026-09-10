export const initialContacts = [
  {
    id: "cnt-1",
    name: "Sunita Sharma",
    relation: "Parent",
    phone: "+91 98765 43210",
    isPrimary: true,
    avatarColor: "#6366F1"
  },
  {
    id: "cnt-2",
    name: "Priya Patel",
    relation: "Friend",
    phone: "+91 98220 12345",
    isPrimary: false,
    avatarColor: "#10B981"
  },
  {
    id: "cnt-3",
    name: "Dr. Meenakshi Iyer",
    relation: "Hostel Warden",
    phone: "+91 98110 55678",
    isPrimary: false,
    avatarColor: "#F59E0B"
  },
  {
    id: "cnt-4",
    name: "Aman Sharma",
    relation: "Sibling",
    phone: "+91 98330 99887",
    isPrimary: false,
    avatarColor: "#EC4899"
  },
  {
    id: "cnt-5",
    name: "University Campus Security",
    relation: "College Security",
    phone: "+91 98000 11223",
    isPrimary: false,
    avatarColor: "#8B5CF6"
  }
];

export const emergencyResourcesList = [
  {
    id: "res-1",
    name: "National Emergency Number",
    category: "National Helpline",
    badge: "Government 24/7",
    number: "112",
    description: "Integrated single emergency number for Police, Fire, and Ambulance services across India.",
    distance: "Pan-India",
    address: "National Response Center",
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
    distance: "0.8 km away",
    address: "Central Police Station, MG Road",
    verified: true
  },
  {
    id: "res-5",
    name: "Ambulance & Trauma Care",
    category: "Medical",
    badge: "Emergency Medical",
    number: "108",
    description: "Emergency medical transport with life support equipment and hospital triage.",
    distance: "1.4 km away",
    address: "District Civil & Trauma Hospital",
    verified: true
  },
  {
    id: "res-6",
    name: "Pink Patrol & Women Safety Booth",
    category: "Women's Support",
    badge: "Safe Zone",
    number: "+91 11 2345 6789",
    description: "Dedicated female police personnel kiosk with 24/7 assistance, first aid, and safe escort.",
    distance: "0.4 km away",
    address: "Central Metro Station Gate 2 Plaza",
    verified: true
  },
  {
    id: "res-7",
    name: "Hostel & Campus Security Quick Response",
    category: "College Security",
    badge: "Campus",
    number: "+91 98000 11223",
    description: "Campus warden and rapid action security team available round the clock for students.",
    distance: "0.2 km away",
    address: "North Gate Security Pavilion",
    verified: true
  }
];

export const mapHotspots = [
  {
    id: "map-user",
    type: "user",
    name: "Your Live Location (Simulated)",
    lat: 18.5204,
    lng: 73.8567,
    category: "user",
    details: "Sector 4, University Circle • High GPS Accuracy",
    status: "Safe"
  },
  {
    id: "map-p1",
    type: "police",
    name: "Central Police Station & Pink Desk",
    lat: 18.5245,
    lng: 73.8521,
    category: "police",
    details: "24/7 Station with dedicated Women's Help Desk • 0.8 km",
    phone: "100 / 1091"
  },
  {
    id: "map-p2",
    type: "police",
    name: "Shivaji Nagar Police Outpost",
    lat: 18.5312,
    lng: 73.8445,
    category: "police",
    details: "Patrol unit base • Emergency vehicle on standby • 1.6 km",
    phone: "+91 20 2553 2200"
  },
  {
    id: "map-h1",
    type: "hospital",
    name: "Sancheti Emergency Trauma Hospital",
    lat: 18.5298,
    lng: 73.8510,
    category: "hospital",
    details: "24/7 Emergency Wing & Ambulance Bay • 1.1 km",
    phone: "108"
  },
  {
    id: "map-h2",
    type: "hospital",
    name: "District Civil Hospital",
    lat: 18.5135,
    lng: 73.8640,
    category: "hospital",
    details: "Level 1 Trauma Center • Free medical legal cell • 2.1 km",
    phone: "+91 20 2612 8000"
  },
  {
    id: "map-s1",
    type: "safezone",
    name: "Metro Station Pink Kiosk & Safe Zone",
    lat: 18.5220,
    lng: 73.8590,
    category: "safezone",
    details: "Brightly lit transit zone • CCTV monitored 24/7 • Security guards",
    phone: "020-2567890"
  },
  {
    id: "map-s2",
    type: "safezone",
    name: "24/7 University Library & Security Post",
    lat: 18.5175,
    lng: 73.8530,
    category: "safezone",
    details: "Guarded safe refuge point with emergency phone box",
    phone: "+91 98000 11223"
  },
  {
    id: "map-i1",
    type: "incident",
    name: "Hazard: Non-functional Streetlights",
    lat: 18.5260,
    lng: 73.8615,
    category: "incident",
    severity: "Medium",
    details: "Dark 300m stretch behind Old Bus Depot. Recommended to use Main Avenue.",
    reportedAgo: "2 hours ago"
  },
  {
    id: "map-i2",
    type: "incident",
    name: "Alert: Isolated Underpass",
    lat: 18.5150,
    lng: 73.8490,
    category: "incident",
    severity: "High",
    details: "Reported group loitering after 9 PM. Take the overbridge instead.",
    reportedAgo: "Yesterday"
  }
];

export const initialCommunityIncidents = [
  {
    id: "inc-101",
    category: "Poor lighting",
    location: "Behind Central Metro Station (Exit 4 Lane)",
    date: "2026-09-03",
    time: "21:45",
    description: "Streetlights have been out for 4 consecutive days on the pedestrian walkway between Exit 4 and the auto stand. Extremely dark and isolated after 9 PM.",
    authorBadge: "Verified Student",
    upvotes: 38,
    flagged: false,
    severity: "Medium",
    status: "Forwarded to Municipal Corp"
  },
  {
    id: "inc-102",
    category: "Suspicious activity",
    location: "Railway Colony Overbridge walkway",
    date: "2026-09-02",
    time: "22:15",
    description: "Three unidentified men were blocking the stairway, making lewd remarks to women passing by. Advised to take the front road with active shoplights.",
    authorBadge: "Resident • Sector 7",
    upvotes: 54,
    flagged: false,
    severity: "High",
    status: "Police Night Patrol Alerted"
  },
  {
    id: "inc-103",
    category: "Public transport issue",
    location: "Bus Stop 14B (University Route)",
    date: "2026-09-03",
    time: "19:30",
    description: "Night route buses are skipping this stop regularly, leaving female commuters stranded. Auto drivers demanding 4x fares.",
    authorBadge: "Working Professional",
    upvotes: 21,
    flagged: false,
    severity: "Low",
    status: "Under Review"
  },
  {
    id: "inc-104",
    category: "Harassment",
    location: "Subway Underpass near Commercial Complex",
    date: "2026-09-01",
    time: "20:00",
    description: "Two bikers kept slowing down and stalking women walking towards the hostel. Pink Patrol unit was informed.",
    authorBadge: "Hostel Resident",
    upvotes: 62,
    flagged: false,
    severity: "High",
    status: "CCTV Footage Requested"
  }
];

export const initialSafetyStats = [
  { label: "Proactive Journeys Monitored", value: "142,500+", change: "+24% this month" },
  { label: "Simulated Response Latency", value: "< 2.8 sec", change: "Instant alert trigger" },
  { label: "Verified Safe Community Hubs", value: "1,840+", change: "Pan-city coverage" },
  { label: "Community Hazard Verifications", value: "99.4%", change: "Peer & patrol checked" }
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

export const safetyModesData = [
  {
    id: 'personal',
    name: 'Personal Mode',
    icon: 'User',
    color: '#6366F1',
    description: 'Standard day-to-day safety monitoring with trusted contacts and auto check-ins.',
    tag: 'Default',
    recommendedTools: ['Safe Journey', 'Safety Map', 'One-Tap SOS']
  },
  {
    id: 'college',
    name: 'College Mode',
    icon: 'GraduationCap',
    color: '#10B981',
    description: 'Campus geofencing, verified student responders, and direct campus security hotline.',
    tag: 'Campus Safe',
    recommendedTools: ['Campus Security SOS', 'Safe Walk Buddy', 'Incident Radar']
  },
  {
    id: 'hostel',
    name: 'Hostel Mode',
    icon: 'Home',
    color: '#F59E0B',
    description: 'Curfew automated check-ins, warden alert integration, and late-entry notifications.',
    tag: 'Hostel Secure',
    recommendedTools: ['Curfew Timer', 'Warden Ping', 'Late Gate Protocol']
  },
  {
    id: 'office',
    name: 'Office Mode',
    icon: 'Briefcase',
    color: '#06B6D4',
    description: 'Late-shift commute monitoring, cab deviation alerts, and corporate transport security.',
    tag: 'Late Shift',
    recommendedTools: ['Cab Safety Radar', 'Drop Confirmation', 'Route Variance']
  },
  {
    id: 'travel',
    name: 'Travel Mode',
    icon: 'Compass',
    color: '#EC4899',
    description: 'High-frequency GPS tracking, offline emergency dialer, and transit safety alerts.',
    tag: 'Transit Guard',
    recommendedTools: ['High-Freq GPS', 'Offline SMS Hub', 'Battery-Aware Mode']
  }
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
    address: 'Near Cafe Green, University Circle'
  },
  {
    id: 'resp-2',
    name: 'Officer Rekha Salve',
    role: 'Pink Patrol Officer',
    badge: 'Pune City Police',
    distance: '0.6 km away',
    eta: '4 mins',
    rating: '5.0 ★ (Official Patrol)',
    phone: '1091',
    status: 'Mobile Van Patrol',
    avatarColor: '#6366F1',
    address: 'Stationed at University North Gate'
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

export const safeRoutesData = [
  {
    id: 'route-safest',
    name: 'Safest Route (Recommended)',
    tag: 'Highest Safety Score',
    etaMinutes: 22,
    distanceKm: 8.4,
    safetyScore: 96,
    cctvCoverage: '98% Monitored',
    lightingScore: 'High LED Brightness',
    policePresence: '2 Active Patrol Booths',
    crowdDensity: 'Active Pedestrian Flow',
    highlights: [
      'Well-lit arterial road with 100% operational streetlights',
      'Passes directly by Central Metro Pink Kiosk',
      'Continuous CCTV coverage via Smart City camera grid',
      '24/7 commercial stores & open pharmacies along corridor'
    ],
    warnings: [],
    polylinePoints: [
      [18.5204, 73.8567],
      [18.5220, 73.8590],
      [18.5245, 73.8521],
      [18.5298, 73.8510],
      [18.5350, 73.8480]
    ]
  },
  {
    id: 'route-fastest',
    name: 'Fastest Route',
    tag: 'Shortest Time',
    etaMinutes: 17,
    distanceKm: 6.9,
    safetyScore: 74,
    cctvCoverage: '62% Monitored',
    lightingScore: 'Moderate Lighting',
    policePresence: '1 Checkpoint',
    crowdDensity: 'Low after 9:30 PM',
    highlights: [
      'Direct connection via bypass link road',
      'Saves 5 minutes transit time'
    ],
    warnings: [
      'Passes through 400m dimly lit industrial stretch',
      'Lower pedestrian traffic after 9 PM'
    ],
    polylinePoints: [
      [18.5204, 73.8567],
      [18.5230, 73.8540],
      [18.5280, 73.8490],
      [18.5350, 73.8480]
    ]
  },
  {
    id: 'route-alternative',
    name: 'Alternative Commercial Route',
    tag: 'Busy Commercial Belt',
    etaMinutes: 24,
    distanceKm: 9.1,
    safetyScore: 91,
    cctvCoverage: '92% Monitored',
    lightingScore: 'High Lighting',
    policePresence: 'Regular Night PCR Van',
    crowdDensity: 'Dense Market Area',
    highlights: [
      'Lined with restaurants, late-night transit hubs, and hospitals',
      'Frequent public transport and auto stands throughout'
    ],
    warnings: [
      'Moderate traffic delays during peak evening hours'
    ],
    polylinePoints: [
      [18.5204, 73.8567],
      [18.5175, 73.8530],
      [18.5135, 73.8640],
      [18.5260, 73.8615],
      [18.5350, 73.8480]
    ]
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

export const extendedMapHotspots = [
  ...mapHotspots,
  // Layer 4: Responders
  {
    id: "map-resp-1",
    type: "responder",
    layer: "responders",
    name: "Sneha K. (Verified Volunteer)",
    lat: 18.5215,
    lng: 73.8545,
    details: "First-Aid responder • 0.3 km away • Response ready",
    phone: "+91 98221 44550"
  },
  {
    id: "map-resp-2",
    type: "responder",
    layer: "responders",
    name: "PCR Mobile Unit 14 (Pink Patrol)",
    lat: 18.5270,
    lng: 73.8505,
    details: "Patrolling Shivaji Nagar stretch • 0.6 km away",
    phone: "1091"
  },
  // Layer 5: Streetlight corridors
  {
    id: "map-light-1",
    type: "streetlight",
    layer: "streetlights",
    name: "Main University Boulevard (Well-Lit)",
    lat: 18.5225,
    lng: 73.8550,
    details: "High-intensity LED grid • 100% operational • Smart City sensor monitored",
    status: "Active Lighting"
  },
  {
    id: "map-light-2",
    type: "streetlight",
    layer: "streetlights",
    name: "FC Road Commercial Corridor",
    lat: 18.5190,
    lng: 73.8420,
    details: "Bright commercial avenue • Continuous street illumination till dawn",
    status: "Active Lighting"
  },
  // Layer 6: High risk zones
  {
    id: "map-risk-1",
    type: "highrisk",
    layer: "highrisk",
    name: "Isolated Warehouse Alley",
    lat: 18.5285,
    lng: 73.8650,
    details: "Low pedestrian footfall after 8 PM • 4 non-functional lights reported",
    severity: "High"
  },
  // Layer 7: Transit Hubs
  {
    id: "map-transit-1",
    type: "transit",
    layer: "transithubs",
    name: "Central Metro Station - Gate 1 & 2",
    lat: 18.5218,
    lng: 73.8585,
    details: "CCTV surveillance • 24/7 security guard post • Pre-paid auto stand",
    status: "High Footfall Safe Hub"
  },
  {
    id: "map-transit-2",
    type: "transit",
    layer: "transithubs",
    name: "Intercity Bus Terminal (Platform 3 Safe Kiosk)",
    lat: 18.5305,
    lng: 73.8580,
    details: "Police Help Desk on Platform 1 • Brightly lit boarding platforms",
    status: "Guarded Transit"
  }
];

export const safetyRiskSignals = [
  { id: 'time', name: 'Time of Day', score: 85, status: 'Normal', desc: 'Active evening hours with regular vehicular traffic' },
  { id: 'lighting', name: 'Street Lighting Index', score: 92, status: 'Optimal', desc: 'Monitored municipal LED corridor' },
  { id: 'crowd', name: 'Pedestrian Density', score: 78, status: 'Moderate', desc: 'Steady commercial & transit footfall' },
  { id: 'police', name: 'Patrol Proximity', score: 95, status: 'High', desc: 'Pink Patrol within 600m radius' },
  { id: 'hazard', name: 'Recent Incident Density', score: 90, status: 'Low Risk', desc: 'No critical incidents reported within 1.5 km in past 48h' }
];

export const initialSafetyHistory = [
  {
    id: 'hist-1',
    type: 'journey',
    title: 'University North Campus → Sector 14 Hostel',
    date: '2026-09-06',
    time: '21:30',
    location: 'Pune University Corridor',
    details: '28-minute trip completed via Metro. 3 automatic check-ins verified.',
    status: 'Completed Safely'
  },
  {
    id: 'hist-2',
    type: 'checkin',
    title: 'Automated Safe Check-in',
    date: '2026-09-06',
    time: '21:45',
    location: 'Near Metro Gate 2',
    details: 'Self-confirmed safety ping sent to 3 primary trusted contacts.',
    status: 'Verified'
  },
  {
    id: 'hist-3',
    type: 'incident',
    title: 'Community Hazard Report: Non-functional Lights',
    date: '2026-09-04',
    time: '20:15',
    location: 'Exit 4 Walkway',
    details: 'Submitted hazard report. 38 peer upvotes received.',
    status: 'Forwarded to Authority'
  },
  {
    id: 'hist-4',
    type: 'sos',
    title: 'SOS Drill & Simulation Test',
    date: '2026-09-01',
    time: '18:00',
    location: 'Home / Safe Location',
    details: 'Simulated 3-second alert cascade and disarm PIN verification tested successfully.',
    status: 'Drill Completed'
  }
];

