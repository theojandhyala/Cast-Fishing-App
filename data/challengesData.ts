export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  expiresAt: string;
  emoji: string;
}

export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'wc1',
    title: 'Species Sampler',
    description: 'Catch 3 different species this week',
    type: 'weekly',
    xpReward: 300,
    progress: 1,
    target: 3,
    completed: false,
    expiresAt: '2026-06-09',
    emoji: '🐠',
  },
  {
    id: 'wc2',
    title: 'Dawn Patrol',
    description: 'Log a catch before 7am',
    type: 'weekly',
    xpReward: 250,
    progress: 0,
    target: 1,
    completed: false,
    expiresAt: '2026-06-09',
    emoji: '🌅',
  },
  {
    id: 'wc3',
    title: 'Cartographer',
    description: 'Add a new fishing spot',
    type: 'weekly',
    xpReward: 200,
    progress: 1,
    target: 1,
    completed: true,
    expiresAt: '2026-06-09',
    emoji: '📍',
  },
];

export const MONTHLY_CHALLENGES: Challenge[] = [
  {
    id: 'mc1',
    title: 'June Challenge',
    description: 'Catch 20 fish across 5 different species in June',
    type: 'monthly',
    xpReward: 1500,
    progress: 8,
    target: 20,
    completed: false,
    expiresAt: '2026-06-30',
    emoji: '🏆',
  },
];

export const SPECIAL_CHALLENGES: Challenge[] = [
  {
    id: 'sc1',
    title: 'Salmon Season',
    description: 'Catch a Salmon during September — the height of the salmon run',
    type: 'special',
    xpReward: 1000,
    progress: 0,
    target: 1,
    completed: false,
    expiresAt: '2026-09-30',
    emoji: '🐟',
  },
  {
    id: 'sc2',
    title: 'Winter Specimen',
    description: 'Catch a fish over 10kg between December and February',
    type: 'special',
    xpReward: 800,
    progress: 0,
    target: 1,
    completed: false,
    expiresAt: '2027-02-28',
    emoji: '❄️',
  },
  {
    id: 'sc3',
    title: 'Summer Slam',
    description: 'Log 30 catches during July and August',
    type: 'special',
    xpReward: 1200,
    progress: 0,
    target: 30,
    completed: false,
    expiresAt: '2026-08-31',
    emoji: '☀️',
  },
];

export const PAST_CHALLENGES = [
  { id: 'past1', title: 'May Mayfly', description: 'Catch a trout on a dry fly in May', xpEarned: 400, completedAt: '2026-05-28', emoji: '🪲' },
  { id: 'past2', title: 'Bank Holiday Bass', description: 'Catch a Sea Bass over the bank holiday weekend', xpEarned: 300, completedAt: '2026-05-26', emoji: '🌊' },
  { id: 'past3', title: 'Specimen Week', description: 'Catch 3 fish over 5kg in a single week', xpEarned: 600, completedAt: '2026-05-14', emoji: '⚖️' },
];
