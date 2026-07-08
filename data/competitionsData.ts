export interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  entryFee: number;
  species: string;
  prize: string;
  organiser: string;
  description: string;
  maxEntrants: number;
  currentEntrants: number;
  isPast: boolean;
}

export interface PastResult {
  competitionName: string;
  date: string;
  winner: string;
  winningCatch: string;
  weight: number;
}

export const COMPETITIONS: Competition[] = [
  {
    id: 'comp1',
    name: 'Grafham Water Open',
    date: '2026-06-14',
    location: 'Grafham Water, Cambridgeshire',
    entryFee: 25,
    species: 'Mixed Coarse',
    prize: '£500 + Trophy',
    organiser: 'Grafham Water AC',
    description: 'Annual open match at one of England\'s finest reservoirs. Biggest bag wins.',
    maxEntrants: 80,
    currentEntrants: 63,
    isPast: false,
  },
  {
    id: 'comp2',
    name: 'River Thames Barbel Championship',
    date: '2026-06-21',
    location: 'River Thames, Oxfordshire',
    entryFee: 30,
    species: 'Barbel',
    prize: '£750 + Rod Bundle',
    organiser: 'Thames Barbel Society',
    description: 'Two-day specimen hunt on the upper Thames for barbel over 8lb.',
    maxEntrants: 40,
    currentEntrants: 28,
    isPast: false,
  },
  {
    id: 'comp3',
    name: 'Chesil Beach Cod Festival',
    date: '2026-07-05',
    location: 'Chesil Beach, Dorset',
    entryFee: 20,
    species: 'Cod & Bass',
    prize: '£400 + Tackle Vouchers',
    organiser: 'Dorset Sea Anglers',
    description: 'Shore fishing festival along Chesil Beach. Biggest cod and bass counted.',
    maxEntrants: 120,
    currentEntrants: 87,
    isPast: false,
  },
  {
    id: 'comp4',
    name: 'Carp Classic Yateley',
    date: '2026-07-12',
    location: 'Yateley Complex, Hampshire',
    entryFee: 50,
    species: 'Carp',
    prize: '£2,000 + Korda Bundle',
    organiser: 'Yateley Carp Club',
    description: '48-hour carp fishing pairs event on the famous Yateley complex. Heaviest fish wins.',
    maxEntrants: 30,
    currentEntrants: 30,
    isPast: false,
  },
  {
    id: 'comp5',
    name: 'Scottish Salmon Cup',
    date: '2026-09-06',
    location: 'River Tay, Scotland',
    entryFee: 75,
    species: 'Atlantic Salmon',
    prize: '£1,500 + Hardy Rod',
    organiser: 'Tay District Salmon Fisheries Board',
    description: 'Prestigious salmon fly fishing competition on Scotland\'s greatest salmon river.',
    maxEntrants: 24,
    currentEntrants: 19,
    isPast: false,
  },
  {
    id: 'comp6',
    name: 'North Sea Shark Challenge',
    date: '2026-08-02',
    location: 'Whitby, Yorkshire',
    entryFee: 60,
    species: 'Blue Shark & Tope',
    prize: '£800 + Trophy',
    organiser: 'Whitby Sea Anglers',
    description: 'Boat fishing challenge from Whitby harbour targeting blue shark and tope. Catch and release.',
    maxEntrants: 36,
    currentEntrants: 22,
    isPast: false,
  },
  {
    id: 'comp7',
    name: 'Grand Union Canal Cup',
    date: '2026-06-28',
    location: 'Grand Union Canal, Northampton',
    entryFee: 15,
    species: 'Mixed Coarse',
    prize: '£200 + Tackle',
    organiser: 'Northampton AA',
    description: 'Classic canal match fishing. Roach, perch and skimmers expected.',
    maxEntrants: 60,
    currentEntrants: 41,
    isPast: false,
  },
  {
    id: 'comp8',
    name: 'Bass On The Fly Open',
    date: '2026-07-19',
    location: 'North Cornwall',
    entryFee: 35,
    species: 'Sea Bass',
    prize: '£600 + Fly Line Set',
    organiser: 'Cornish Fly Fishers',
    description: 'Shore-based fly fishing for sea bass along the stunning North Cornwall coast.',
    maxEntrants: 20,
    currentEntrants: 15,
    isPast: false,
  },
  {
    id: 'comp9',
    name: 'Pike Open — Norfolk Broads',
    date: '2026-10-10',
    location: 'Norfolk Broads',
    entryFee: 25,
    species: 'Pike',
    prize: '£500 + Abu Garcia Reel',
    organiser: 'Norfolk Pike Club',
    description: 'Boat-based pike fishing on the iconic Norfolk Broads. Largest fish wins. Catch & release required.',
    maxEntrants: 40,
    currentEntrants: 12,
    isPast: false,
  },
  {
    id: 'comp10',
    name: 'CAST Community Match — June',
    date: '2026-06-30',
    location: 'Virtual — Submit via CAST App',
    entryFee: 0,
    species: 'All Species',
    prize: '2,000 XP + Gold Badge',
    organiser: 'CAST Community',
    description: 'Our monthly virtual competition. Log your biggest catch of the month on CAST. Top 3 win bonus XP and exclusive badges.',
    maxEntrants: 999,
    currentEntrants: 247,
    isPast: false,
  },
];

export const PAST_RESULTS: PastResult[] = [
  { competitionName: 'CAST Community Match — May', date: '2026-05-31', winner: 'CarpKingUK', winningCatch: 'Carp', weight: 18.2 },
  { competitionName: 'River Avon Spring Open', date: '2026-05-18', winner: 'BarbelBoy', winningCatch: 'Barbel', weight: 9.4 },
  { competitionName: 'Grafham Spring Match', date: '2026-05-10', winner: 'FlyFisher99', winningCatch: 'Rainbow Trout', weight: 4.8 },
  { competitionName: 'CAST Community Match — April', date: '2026-04-30', winner: 'PikeSlayer', winningCatch: 'Pike', weight: 16.3 },
  { competitionName: 'Cornish Bass Classic', date: '2026-04-12', winner: 'BassFisher', winningCatch: 'Sea Bass', weight: 7.9 },
];

export const COMMUNITY_MATCH_LEADERBOARD = [
  { rank: 1, name: 'CarpKingUK', species: 'Carp', weight: 22.1, date: '2026-06-01' },
  { rank: 2, name: 'NightCarper', species: 'Carp', weight: 19.4, date: '2026-06-02' },
  { rank: 3, name: 'ReservoirDog', species: 'Carp', weight: 15.8, date: '2026-05-28' },
  { rank: 4, name: 'PikeSlayer', species: 'Pike', weight: 14.2, date: '2026-06-01' },
  { rank: 5, name: 'SeaAnglerBob', species: 'Bass', weight: 11.0, date: '2026-05-31' },
  { rank: 16, name: 'You', species: 'Carp', weight: 8.5, date: '2026-06-01' },
];
