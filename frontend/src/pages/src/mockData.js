// Singapore Red Cross — mock data for all SRC pages

export const MOCK_ALERTS = [
  {
    id: 'ALT-2505-001',
    bloodType: 'O-',
    severity: 'Critical',
    forecastedShortage: 420,
    shortageWindow: '21–27 May 2026',
    recommendedAction: 'Organise donor drives targeting O- donors',
    receivedAt: '30 May 2026, 08:15 AM',
  },
  {
    id: 'ALT-2505-002',
    bloodType: 'B+',
    severity: 'High',
    forecastedShortage: 280,
    shortageWindow: '28 May – 3 Jun 2026',
    recommendedAction: 'Increase B+ donor outreach via SMS campaigns',
    receivedAt: '29 May 2026, 02:30 PM',
  },
  {
    id: 'ALT-2505-003',
    bloodType: 'A-',
    severity: 'Medium',
    forecastedShortage: 150,
    shortageWindow: '4–10 Jun 2026',
    recommendedAction: 'Schedule targeted outreach for A- eligible donors',
    receivedAt: '28 May 2026, 11:00 AM',
  },
  {
    id: 'ALT-2505-004',
    bloodType: 'O+',
    severity: 'High',
    forecastedShortage: 310,
    shortageWindow: '7–13 Jun 2026',
    recommendedAction: 'Plan donation drives at high-density residential areas',
    receivedAt: '27 May 2026, 09:45 AM',
  },
]

export const MOCK_HOTSPOTS = [
  { rank: 1, name: 'Tampines',    score: 86, pos: [1.3540, 103.9440], color: '#EF4444' },
  { rank: 2, name: 'Jurong East', score: 78, pos: [1.3333, 103.7420], color: '#EF4444' },
  { rank: 3, name: 'Woodlands',   score: 72, pos: [1.4382, 103.7891], color: '#F97316' },
  { rank: 4, name: 'Ang Mo Kio',  score: 65, pos: [1.3696, 103.8454], color: '#F97316' },
  { rank: 5, name: 'Bukit Batok', score: 58, pos: [1.3590, 103.7637], color: '#EAB308' },
]

export const MOCK_RECOMMENDED_DRIVE = {
  alertId: 'ALT-2505-001',
  location: 'Tampines Community Plaza',
  bloodType: 'O-',
  date: 'Sat, 31 May 2026',
  time: '10:00 AM – 4:00 PM',
  eligibleDonors: 86,
  highResponseDonors: 18,
  pastSuccessRate: 72,
  confidenceScore: 87,
  impact: 'High Impact',
  reasons: [
    { label: 'High eligible donor density', detail: 'Large pool of O- donors within 5km' },
    { label: 'Low recent donation activity', detail: 'Lower donation rate in the past 12 weeks' },
    { label: 'Excellent accessibility', detail: 'Near MRT & bus interchange' },
    { label: 'Nearby amenities', detail: 'Close to schools, offices & community centres' },
    { label: 'Strong past performance', detail: 'High turnout and conversion in previous drives' },
  ],
  scoreBreakdown: [
    { criterion: 'Eligible donor density',     weight: 30, score: 28 },
    { criterion: 'Low recent donation activity', weight: 25, score: 22 },
    { criterion: 'Accessibility',               weight: 20, score: 17 },
    { criterion: 'Nearby amenities',            weight: 15, score: 10 },
    { criterion: 'Past drive success',          weight: 10, score: 9  },
  ],
  alternativeLocations: [
    { name: 'Jurong East', venue: 'JEM (Level 1)',          score: 78, eligibleDonors: 72, successRate: 65 },
    { name: 'Woodlands',   venue: 'Woodlands Civic Centre', score: 72, eligibleDonors: 65, successRate: 63 },
    { name: 'Ang Mo Kio',  venue: 'AMK Hub',                score: 65, eligibleDonors: 58, successRate: 59 },
    { name: 'Bukit Timah', venue: 'Beauty World Plaza',     score: 58, eligibleDonors: 48, successRate: 52 },
  ],
}

export const MOCK_UPCOMING_DRIVES = [
  {
    id: 'DD-001',
    location: 'Tampines Community Plaza',
    address: 'Tampines Street 11, Singapore 529455',
    bloodType: 'O-',
    expectedDonors: '80 – 100',
    expectedDonorsMin: 80,
    expectedDonorsMax: 100,
    confirmedDonors: 45,
    linkedAlert: 'ALT-2505-001',
    date: '31 May 2026',
    time: '10:00 AM – 4:00 PM',
    status: 'Planned',
    outreachSent: true,
    outreachCount: 312,
    staffAssigned: 3,
    venueConfirmed: true,
    notes: 'Drive targeting O- donors in response to critical shortage alert. Venue booked, awaiting more registrations.',
  },
  {
    id: 'DD-002',
    location: 'Jurong East Sports Centre',
    address: '21 Jurong East Street 31, Singapore 609517',
    bloodType: 'B+',
    expectedDonors: '70 – 90',
    expectedDonorsMin: 70,
    expectedDonorsMax: 90,
    confirmedDonors: 28,
    linkedAlert: 'ALT-2505-002',
    date: '7 Jun 2026',
    time: '9:00 AM – 3:00 PM',
    status: 'Planned',
    outreachSent: true,
    outreachCount: 245,
    staffAssigned: 2,
    venueConfirmed: true,
    notes: 'B+ shortage drive. Second outreach wave scheduled for 3 Jun to boost registrations.',
  },
  {
    id: 'DD-003',
    location: 'Woodlands Galaxy CC',
    address: '31 Woodlands Avenue 6, Singapore 738991',
    bloodType: 'A-',
    expectedDonors: '60 – 80',
    expectedDonorsMin: 60,
    expectedDonorsMax: 80,
    confirmedDonors: 61,
    linkedAlert: 'ALT-2505-003',
    date: '14 Jun 2026',
    time: '10:00 AM – 5:00 PM',
    status: 'Confirmed',
    outreachSent: true,
    outreachCount: 198,
    staffAssigned: 4,
    venueConfirmed: true,
    notes: 'Drive confirmed. All logistics in place. Staff briefing scheduled for 13 Jun.',
  },
]

export const MOCK_DRIVE_HISTORY = [
  {
    location: 'Tampines Hub',
    address: 'Tampines Avenue 4',
    date: '26 Apr 2026',
    bloodType: 'O-',
    actualTurnout: 112,
    unitsCollected: 96,
    conversionRate: 45,
    linkedAlert: 'ALT-2505-001',
  },
  {
    location: 'Jurong East Sports Centre',
    address: '21 Jurong East Street 31',
    date: '13 Apr 2026',
    bloodType: 'B+',
    actualTurnout: 98,
    unitsCollected: 82,
    conversionRate: 42,
    linkedAlert: 'ALT-2505-002',
  },
  {
    location: 'Causeway Point Atrium',
    address: '1 Woodlands Square',
    date: '30 Mar 2026',
    bloodType: 'A-',
    actualTurnout: 76,
    unitsCollected: 63,
    conversionRate: 37,
    linkedAlert: 'ALT-2505-003',
  },
  {
    location: 'Bedok Community Centre',
    address: '850 New Upper Changi Rd',
    date: '16 Mar 2026',
    bloodType: 'O+',
    actualTurnout: 85,
    unitsCollected: 71,
    conversionRate: 40,
    linkedAlert: 'ALT-2505-004',
  },
]

export const DONOR_STATS = {
  activeDonors: 128450,
  eligibleRepeat: 74320,
  dormant: 54130,
  responseRate: 28.7,
}

export const DONORS_BY_BLOOD_TYPE = [
  { type: 'O+',  count: 44150, pct: 34.4, color: '#EF4444' },
  { type: 'A+',  count: 32620, pct: 25.4, color: '#F97316' },
  { type: 'B+',  count: 20340, pct: 15.9, color: '#EAB308' },
  { type: 'O-',  count: 8950,  pct: 7.0,  color: '#22C55E' },
  { type: 'A-',  count: 7560,  pct: 5.9,  color: '#3B82F6' },
  { type: 'AB+', count: 7020,  pct: 5.5,  color: '#8B5CF6' },
  { type: 'B-',  count: 4120,  pct: 3.2,  color: '#EC4899' },
  { type: 'AB-', count: 3690,  pct: 2.7,  color: '#14B8A6' },
]

export const DONORS_BY_AGE = [
  { group: '16–20', count: 5420,  pct: 4.2  },
  { group: '21–30', count: 37980, pct: 29.6 },
  { group: '31–40', count: 34430, pct: 26.8 },
  { group: '41–50', count: 28400, pct: 22.1 },
  { group: '51–60', count: 17470, pct: 13.6 },
  { group: '60+',   count: 4750,  pct: 3.7  },
]

export const DONORS_BY_LOCATION = [
  { rank: 1, name: 'Tampines',    count: 18560, pos: [1.3540, 103.9440] },
  { rank: 2, name: 'Jurong East', count: 15230, pos: [1.3333, 103.7420] },
  { rank: 3, name: 'Woodlands',   count: 12480, pos: [1.4382, 103.7891] },
  { rank: 4, name: 'Ang Mo Kio',  count: 10390, pos: [1.3696, 103.8454] },
  { rank: 5, name: 'Bedok',       count: 8760,  pos: [1.3239, 103.9290] },
]

export const RESPONSE_RATE_TREND = [
  { month: 'Dec 2025', rate: 23.1 },
  { month: 'Jan 2026', rate: 24.0 },
  { month: 'Feb 2026', rate: 25.3 },
  { month: 'Mar 2026', rate: 26.1 },
  { month: 'Apr 2026', rate: 25.9 },
  { month: 'May 2026', rate: 28.7 },
]
