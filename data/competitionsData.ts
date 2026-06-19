export interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  entryFee: number;
  species: string;
  organiser: string;
  description: string;
  maxEntrants: number;
  currentEntrants: number;
  isPast: boolean;
  featured?: boolean;
  daysLeft?: number;
  format?: string;
}

export interface PastResult {
  competitionName: string;
  date: string;
  winner: string;
  winningCatch: string;
  weight: number;
}

const today = new Date('2026-06-19');
function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.max(0, Math.round((d.getTime() - today.getTime()) / 86400000));
}

export const COMPETITIONS: Competition[] = [
  {
    id: 'comp1',
    name: 'Grafham Water Open',
    date: '2026-06-28',
    location: 'Grafham Water, Cambridgeshire',
    entryFee: 25,
    species: 'Mixed Coarse',
    organiser: 'Grafham Water AC',
    description: 'Annual open match at one of England\'s finest reservoirs. Biggest bag wins. All methods allowed from the bank.',
    maxEntrants: 80,
    currentEntrants: 63,
    isPast: false,
    featured: true,
    daysLeft: daysUntil('2026-06-28'),
    format: '1-day bank match',
  },
  {
    id: 'comp2',
    name: 'River Thames Barbel Championship',
    date: '2026-07-05',
    location: 'River Thames, Oxfordshire',
    entryFee: 30,
    species: 'Barbel',
    organiser: 'Thames Barbel Society',
    description: 'Two-day specimen hunt on the upper Thames for barbel over 8lb. Catch & photo release system.',
    maxEntrants: 40,
    currentEntrants: 28,
    isPast: false,
    daysLeft: daysUntil('2026-07-05'),
    format: '2-day specimen',
  },
  {
    id: 'comp3',
    name: 'Chesil Beach Cod Festival',
    date: '2026-07-12',
    location: 'Chesil Beach, Dorset',
    entryFee: 20,
    species: 'Cod & Bass',
    organiser: 'Dorset Sea Anglers',
    description: 'Shore fishing festival along Chesil Beach. Biggest cod and bass counted. Starts at 06:00 local.',
    maxEntrants: 120,
    currentEntrants: 87,
    isPast: false,
    daysLeft: daysUntil('2026-07-12'),
    format: 'Shore match',
  },
  {
    id: 'comp4',
    name: 'Carp Classic Yateley',
    date: '2026-07-19',
    location: 'Yateley Complex, Hampshire',
    entryFee: 50,
    species: 'Carp',
    organiser: 'Yateley Carp Club',
    description: '48-hour carp fishing pairs event on the famous Yateley complex. Heaviest single fish wins. Booking in at 10:00.',
    maxEntrants: 30,
    currentEntrants: 30,
    isPast: false,
    daysLeft: daysUntil('2026-07-19'),
    format: '48hr pairs',
  },
  {
    id: 'comp5',
    name: 'Scottish Salmon Cup',
    date: '2026-09-06',
    location: 'River Tay, Scotland',
    entryFee: 75,
    species: 'Atlantic Salmon',
    organiser: 'Tay District Salmon Fisheries Board',
    description: 'Prestigious salmon fly fishing competition on Scotland\'s greatest salmon river. Fly only, catch and release. Formal attire on the bank.',
    maxEntrants: 24,
    currentEntrants: 19,
    isPast: false,
    daysLeft: daysUntil('2026-09-06'),
    format: 'Fly fishing',
  },
  {
    id: 'comp6',
    name: 'North Sea Shark Challenge',
    date: '2026-08-02',
    location: 'Whitby, Yorkshire',
    entryFee: 60,
    species: 'Blue Shark & Tope',
    organiser: 'Whitby Sea Anglers',
    description: 'Boat fishing challenge from Whitby harbour targeting blue shark and tope. All fish catch and release. Departs 05:30.',
    maxEntrants: 36,
    currentEntrants: 22,
    isPast: false,
    daysLeft: daysUntil('2026-08-02'),
    format: 'Boat charter C&R',
  },
  {
    id: 'comp7',
    name: 'Grand Union Canal Cup',
    date: '2026-06-28',
    location: 'Grand Union Canal, Northampton',
    entryFee: 15,
    species: 'Mixed Coarse',
    organiser: 'Northampton AA',
    description: 'Classic canal match fishing on drawn pegs. Roach, perch and skimmers expected in good numbers. Maggot and bread allowed.',
    maxEntrants: 60,
    currentEntrants: 41,
    isPast: false,
    daysLeft: daysUntil('2026-06-28'),
    format: 'Canal match',
  },
  {
    id: 'comp8',
    name: 'Bass On The Fly Open',
    date: '2026-07-19',
    location: 'North Cornwall',
    entryFee: 35,
    species: 'Sea Bass',
    organiser: 'Cornish Fly Fishers',
    description: 'Shore-based fly fishing for sea bass along the stunning North Cornwall coast. Catch & release, longest fish wins.',
    maxEntrants: 20,
    currentEntrants: 15,
    isPast: false,
    daysLeft: daysUntil('2026-07-19'),
    format: 'Shore fly',
  },
  {
    id: 'comp9',
    name: 'Pike Open — Norfolk Broads',
    date: '2026-10-10',
    location: 'Norfolk Broads',
    entryFee: 25,
    species: 'Pike',
    organiser: 'Norfolk Pike Club',
    description: 'Boat-based pike fishing on the iconic Norfolk Broads. Largest fish wins. Catch & release required, forceps and unhooking mats mandatory.',
    maxEntrants: 40,
    currentEntrants: 12,
    isPast: false,
    daysLeft: daysUntil('2026-10-10'),
    format: 'Boat C&R',
  },
  {
    id: 'comp10',
    name: 'CAST Community Match — June',
    date: '2026-06-30',
    location: 'Virtual — Submit via CAST App',
    entryFee: 0,
    species: 'All Species',
    organiser: 'CAST Community',
    description: 'Our monthly virtual competition. Log your biggest catch of the month on CAST. Top 3 win bonus XP and exclusive badges. Any species, any water.',
    maxEntrants: 999,
    currentEntrants: 247,
    isPast: false,
    daysLeft: daysUntil('2026-06-30'),
    format: 'Virtual app comp',
  },
  {
    id: 'comp11',
    name: 'Windermere Specimen Weekend',
    date: '2026-07-26',
    location: 'Windermere, Lake District',
    entryFee: 40,
    species: 'Bream & Carp',
    organiser: 'Cumbria Anglers',
    description: 'Weekend specimen hunt on England\'s largest natural lake. Points for each species with big fish bonus. Camping on-site.',
    maxEntrants: 50,
    currentEntrants: 34,
    isPast: false,
    daysLeft: daysUntil('2026-07-26'),
    format: '2-day specimen',
  },
  {
    id: 'comp12',
    name: 'Summer Roach Cup — River Kennet',
    date: '2026-07-05',
    location: 'River Kennet, Berkshire',
    entryFee: 10,
    species: 'Roach',
    organiser: 'Kennet Anglers',
    description: 'Traditional float fishing match on one of the UK\'s finest chalk streams. Bread punch and maggot only. Drawn pegs on the day.',
    maxEntrants: 30,
    currentEntrants: 24,
    isPast: false,
    daysLeft: daysUntil('2026-07-05'),
    format: 'Float match',
  },
];

export const PAST_RESULTS: PastResult[] = [
  { competitionName: 'CAST Community Match — May', date: '2026-05-31', winner: 'CarpKingUK', winningCatch: 'Carp', weight: 18.2 },
  { competitionName: 'River Avon Spring Open', date: '2026-05-18', winner: 'BarbelBoy', winningCatch: 'Barbel', weight: 9.4 },
  { competitionName: 'Grafham Spring Match', date: '2026-05-10', winner: 'FlyFisher99', winningCatch: 'Rainbow Trout', weight: 4.8 },
  { competitionName: 'CAST Community Match — April', date: '2026-04-30', winner: 'PikeSlayer', winningCatch: 'Pike', weight: 16.3 },
  { competitionName: 'Cornish Bass Classic', date: '2026-04-12', winner: 'BassFisher', winningCatch: 'Sea Bass', weight: 7.9 },
  { competitionName: 'Kennet Spring Float Cup', date: '2026-04-06', winner: 'RoachRuler', winningCatch: 'Roach', weight: 2.1 },
  { competitionName: 'CAST Community Match — March', date: '2026-03-31', winner: 'TroutLady_Beth', winningCatch: 'Brown Trout', weight: 3.6 },
];

export const COMMUNITY_MATCH_LEADERBOARD = [
  { rank: 1, name: 'CarpKingUK', species: 'Carp', weight: 22.1, date: '2026-06-01' },
  { rank: 2, name: 'NightCarper', species: 'Carp', weight: 19.4, date: '2026-06-02' },
  { rank: 3, name: 'ReservoirDog', species: 'Carp', weight: 15.8, date: '2026-05-28' },
  { rank: 4, name: 'PikeSlayer', species: 'Pike', weight: 14.2, date: '2026-06-01' },
  { rank: 5, name: 'SeaAnglerBob', species: 'Bass', weight: 11.0, date: '2026-05-31' },
  { rank: 16, name: 'You', species: 'Carp', weight: 8.5, date: '2026-06-01' },
];
