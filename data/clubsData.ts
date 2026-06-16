export interface ClubMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  catchesThisWeek: number;
}

export interface ClubCatch {
  id: string;
  memberName: string;
  species: string;
  weight: number;
  date: string;
  location: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  type: 'coarse' | 'game' | 'sea' | 'mixed';
  isPrivate: boolean;
  memberCount: number;
  catchesThisWeek: number;
  founded: string;
  location: string;
  members: ClubMember[];
  recentCatches: ClubCatch[];
}

export const CLUBS: Club[] = [
  {
    id: 'c1',
    name: 'Carp Society UK',
    description: 'The premier carp fishing community in the UK. We share spots, tips, and catches from the best carp waters around England.',
    type: 'coarse',
    isPrivate: false,
    memberCount: 1247,
    catchesThisWeek: 89,
    founded: '2019',
    location: 'England',
    members: [
      { id: 'm1', name: 'CarpKingUK', avatar: 'CK', role: 'admin', catchesThisWeek: 8 },
      { id: 'm2', name: 'DaveAngler', avatar: 'DA', role: 'member', catchesThisWeek: 5 },
      { id: 'm3', name: 'NightCarper', avatar: 'NC', role: 'member', catchesThisWeek: 4 },
      { id: 'm4', name: 'BreamBuster', avatar: 'BB', role: 'member', catchesThisWeek: 3 },
    ],
    recentCatches: [
      { id: 'r1', memberName: 'CarpKingUK', species: 'Carp', weight: 18.2, date: '2026-05-31', location: 'Yateley' },
      { id: 'r2', memberName: 'DaveAngler', species: 'Carp', weight: 12.4, date: '2026-05-30', location: 'Wraysbury' },
      { id: 'r3', memberName: 'NightCarper', species: 'Carp', weight: 14.7, date: '2026-05-29', location: 'Colnemere' },
    ],
  },
  {
    id: 'c2',
    name: 'Bass Anglers Sportfishing Society',
    description: 'Dedicated sea bass anglers sharing marks, techniques and conservation best practices for sustainable bass fishing.',
    type: 'sea',
    isPrivate: false,
    memberCount: 643,
    catchesThisWeek: 34,
    founded: '2021',
    location: 'UK Coastline',
    members: [
      { id: 'm5', name: 'BassFisher', avatar: 'BF', role: 'admin', catchesThisWeek: 6 },
      { id: 'm6', name: 'SurfCaster', avatar: 'SC', role: 'member', catchesThisWeek: 4 },
      { id: 'm7', name: 'SeaAnglerBob', avatar: 'SB', role: 'member', catchesThisWeek: 3 },
    ],
    recentCatches: [
      { id: 'r4', memberName: 'BassFisher', species: 'Sea Bass', weight: 7.8, date: '2026-06-01', location: 'Chesil Beach' },
      { id: 'r5', memberName: 'SurfCaster', species: 'Sea Bass', weight: 5.4, date: '2026-05-31', location: 'Cornwall' },
    ],
  },
  {
    id: 'c3',
    name: 'Fly Fishing Fellowship',
    description: 'A private club for fly fishing enthusiasts. We focus on trout, salmon, and grayling across UK rivers and reservoirs.',
    type: 'game',
    isPrivate: true,
    memberCount: 112,
    catchesThisWeek: 21,
    founded: '2018',
    location: 'Scotland & Wales',
    members: [
      { id: 'm8', name: 'FlyFisher99', avatar: 'FF', role: 'admin', catchesThisWeek: 7 },
      { id: 'm9', name: 'TroutWhisperer', avatar: 'TW', role: 'member', catchesThisWeek: 5 },
      { id: 'm10', name: 'LochLegend', avatar: 'LL', role: 'member', catchesThisWeek: 4 },
    ],
    recentCatches: [
      { id: 'r6', memberName: 'FlyFisher99', species: 'Brown Trout', weight: 2.8, date: '2026-06-02', location: 'River Test' },
      { id: 'r7', memberName: 'TroutWhisperer', species: 'Grayling', weight: 1.2, date: '2026-06-01', location: 'River Wye' },
    ],
  },
  {
    id: 'c4',
    name: 'Night Fishing Crew',
    description: 'For those who fish through the dark hours. Carp, eels, and catfish specialists. Night sessions only!',
    type: 'coarse',
    isPrivate: false,
    memberCount: 387,
    catchesThisWeek: 45,
    founded: '2022',
    location: 'Nationwide',
    members: [
      { id: 'm11', name: 'NightCarper', avatar: 'NC', role: 'admin', catchesThisWeek: 9 },
      { id: 'm12', name: 'EelHunter', avatar: 'EH', role: 'member', catchesThisWeek: 3 },
      { id: 'm13', name: 'ReservoirDog', avatar: 'RD', role: 'member', catchesThisWeek: 5 },
    ],
    recentCatches: [
      { id: 'r8', memberName: 'NightCarper', species: 'Carp', weight: 21.3, date: '2026-06-02', location: 'Linear Fisheries' },
      { id: 'r9', memberName: 'ReservoirDog', species: 'Carp', weight: 10.2, date: '2026-05-31', location: 'Savay Lake' },
    ],
  },
  {
    id: 'c5',
    name: 'River Rovers',
    description: 'Exploring UK rivers for barbel, chub, roach and perch. We share GPS spots and seasonal reports.',
    type: 'mixed',
    isPrivate: false,
    memberCount: 529,
    catchesThisWeek: 67,
    founded: '2020',
    location: 'River UK',
    members: [
      { id: 'm14', name: 'RiverRat', avatar: 'RR', role: 'admin', catchesThisWeek: 11 },
      { id: 'm15', name: 'BarbelBoy', avatar: 'BB', role: 'member', catchesThisWeek: 7 },
      { id: 'm16', name: 'MatchFisher', avatar: 'MF', role: 'member', catchesThisWeek: 9 },
    ],
    recentCatches: [
      { id: 'r10', memberName: 'BarbelBoy', species: 'Barbel', weight: 6.7, date: '2026-06-02', location: 'River Severn' },
      { id: 'r11', memberName: 'MatchFisher', species: 'Roach', weight: 0.8, date: '2026-06-01', location: 'River Trent' },
    ],
  },
];
