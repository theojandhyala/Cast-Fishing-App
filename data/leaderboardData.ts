export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  catches: number;
  biggestFish: number;
  species: number;
  spotsAdded: number;
  change: 'up' | 'down' | 'same';
  changeAmount: number;
}

export const LEADERBOARD_WEEKLY: LeaderboardUser[] = [
  { id: '1', name: 'DaveAngler', avatar: 'DA', catches: 24, biggestFish: 12.4, species: 6, spotsAdded: 3, change: 'up', changeAmount: 2 },
  { id: '2', name: 'CarpKingUK', avatar: 'CK', catches: 21, biggestFish: 18.2, species: 4, spotsAdded: 1, change: 'same', changeAmount: 0 },
  { id: '3', name: 'PikeSlayer', avatar: 'PS', catches: 18, biggestFish: 9.8, species: 5, spotsAdded: 2, change: 'up', changeAmount: 4 },
  { id: '4', name: 'FlyFisher99', avatar: 'FF', catches: 16, biggestFish: 6.1, species: 7, spotsAdded: 0, change: 'down', changeAmount: 1 },
  { id: '5', name: 'SeaAnglerBob', avatar: 'SB', catches: 15, biggestFish: 11.0, species: 5, spotsAdded: 4, change: 'up', changeAmount: 1 },
  { id: '6', name: 'TroutWhisperer', avatar: 'TW', catches: 13, biggestFish: 5.5, species: 3, spotsAdded: 1, change: 'down', changeAmount: 3 },
  { id: '7', name: 'NightCarper', avatar: 'NC', catches: 12, biggestFish: 14.7, species: 2, spotsAdded: 0, change: 'up', changeAmount: 2 },
  { id: '8', name: 'MatchFisher', avatar: 'MF', catches: 11, biggestFish: 3.2, species: 8, spotsAdded: 0, change: 'same', changeAmount: 0 },
  { id: '9', name: 'BassFisher', avatar: 'BF', catches: 10, biggestFish: 7.8, species: 4, spotsAdded: 2, change: 'down', changeAmount: 2 },
  { id: '10', name: 'RiverRat', avatar: 'RR', catches: 9, biggestFish: 4.3, species: 5, spotsAdded: 1, change: 'up', changeAmount: 3 },
  { id: '11', name: 'LochLegend', avatar: 'LL', catches: 8, biggestFish: 8.9, species: 3, spotsAdded: 0, change: 'down', changeAmount: 1 },
  { id: '12', name: 'CanalKing', avatar: 'CK', catches: 7, biggestFish: 2.1, species: 6, spotsAdded: 3, change: 'up', changeAmount: 1 },
  { id: '13', name: 'SurfCaster', avatar: 'SC', catches: 7, biggestFish: 9.4, species: 4, spotsAdded: 1, change: 'same', changeAmount: 0 },
  { id: '14', name: 'BreamBuster', avatar: 'BB', catches: 6, biggestFish: 3.8, species: 3, spotsAdded: 0, change: 'down', changeAmount: 4 },
  { id: '15', name: 'TenchTime', avatar: 'TT', catches: 6, biggestFish: 5.2, species: 2, spotsAdded: 2, change: 'up', changeAmount: 2 },
  { id: 'user', name: 'You', avatar: 'ME', catches: 5, biggestFish: 8.5, species: 3, spotsAdded: 0, change: 'up', changeAmount: 5 },
  { id: '16', name: 'BarbelBoy', avatar: 'BB', catches: 5, biggestFish: 6.7, species: 3, spotsAdded: 1, change: 'down', changeAmount: 2 },
  { id: '17', name: 'ReservoirDog', avatar: 'RD', catches: 4, biggestFish: 10.2, species: 2, spotsAdded: 0, change: 'same', changeAmount: 0 },
  { id: '18', name: 'EelHunter', avatar: 'EH', catches: 3, biggestFish: 1.9, species: 2, spotsAdded: 1, change: 'down', changeAmount: 1 },
  { id: '19', name: 'SpinnerJim', avatar: 'SJ', catches: 2, biggestFish: 4.5, species: 2, spotsAdded: 0, change: 'down', changeAmount: 3 },
  { id: '20', name: 'Newbie2024', avatar: 'NB', catches: 1, biggestFish: 0.8, species: 1, spotsAdded: 0, change: 'same', changeAmount: 0 },
];

export const LEADERBOARD_MONTHLY: LeaderboardUser[] = LEADERBOARD_WEEKLY.map(u => ({
  ...u,
  catches: u.catches * 4,
  spotsAdded: u.spotsAdded * 3,
}));

export const LEADERBOARD_ALL_TIME: LeaderboardUser[] = LEADERBOARD_WEEKLY.map(u => ({
  ...u,
  catches: u.catches * 52,
  spotsAdded: u.spotsAdded * 20,
}));
