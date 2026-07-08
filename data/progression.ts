export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface LevelDefinition {
  level: number;
  title: string;
  xpRequired: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'catch' | 'streak' | 'rarity' | 'exploration' | 'progression';
  target: number;
  metric: 'totalCatches' | 'currentStreak' | 'bestStreak' | 'uniqueSpecies' | 'rareCatches' | 'legendaryCatches' | 'level' | 'regionsFished';
}

const TITLE_BANDS = [
  { from: 1, title: 'First Cast' },
  { from: 5, title: 'Bank Explorer' },
  { from: 10, title: 'Line Tamer' },
  { from: 15, title: 'Water Reader' },
  { from: 20, title: 'Seasoned Angler' },
  { from: 30, title: 'Species Hunter' },
  { from: 40, title: 'Trophy Chaser' },
  { from: 50, title: 'Master Angler' },
  { from: 60, title: 'Waterway Sage' },
  { from: 70, title: 'Ocean Vanguard' },
  { from: 80, title: 'World-Class Angler' },
  { from: 90, title: 'Fishing Icon' },
  { from: 100, title: 'Legend of the Waters' },
] as const;

export const xpRequiredForLevel = (level: number) => {
  const clamped = Math.max(1, Math.min(100, Math.floor(level)));
  return clamped === 1 ? 0 : 100 * (clamped - 1) * (clamped - 1);
};

export const titleForLevel = (level: number) => {
  let title: string = TITLE_BANDS[0].title;
  for (const band of TITLE_BANDS) {
    if (level < band.from) break;
    title = band.title;
  }
  return title;
};

export const LEVELS: LevelDefinition[] = Array.from({ length: 100 }, (_, index) => {
  const level = index + 1;
  return { level, title: titleForLevel(level), xpRequired: xpRequiredForLevel(level) };
});

export const levelFromXp = (xp: number) => {
  const safeXp = Math.max(0, xp);
  return Math.min(100, Math.floor(Math.sqrt(safeXp / 100)) + 1);
};

export const levelProgress = (xp: number) => {
  const level = levelFromXp(xp);
  if (level === 100) return { level, current: 0, required: 0, progress: 1 };
  const floor = xpRequiredForLevel(level);
  const ceiling = xpRequiredForLevel(level + 1);
  return {
    level,
    current: Math.max(0, xp - floor),
    required: ceiling - floor,
    progress: Math.min(1, Math.max(0, (xp - floor) / (ceiling - floor))),
  };
};

export const RARITY_XP: Record<RarityTier, number> = {
  common: 50,
  uncommon: 85,
  rare: 150,
  epic: 300,
  legendary: 600,
};

export const BADGES: BadgeDefinition[] = [
  { id: 'first-catch', name: 'First Bite', description: 'Log your first catch', icon: 'fish', category: 'catch', target: 1, metric: 'totalCatches' },
  { id: 'catch-10', name: 'Double Figures', description: 'Log 10 catches', icon: 'counter', category: 'catch', target: 10, metric: 'totalCatches' },
  { id: 'catch-25', name: 'Tight Lines', description: 'Log 25 catches', icon: 'hook', category: 'catch', target: 25, metric: 'totalCatches' },
  { id: 'catch-50', name: 'Half Century', description: 'Log 50 catches', icon: 'numeric-50', category: 'catch', target: 50, metric: 'totalCatches' },
  { id: 'catch-100', name: 'Centurion', description: 'Log 100 catches', icon: 'trophy', category: 'catch', target: 100, metric: 'totalCatches' },
  { id: 'catch-250', name: 'Net Veteran', description: 'Log 250 catches', icon: 'medal', category: 'catch', target: 250, metric: 'totalCatches' },
  { id: 'species-3', name: 'Curious Angler', description: 'Catch 3 different species', icon: 'fishbowl', category: 'catch', target: 3, metric: 'uniqueSpecies' },
  { id: 'species-10', name: 'Species Scout', description: 'Catch 10 different species', icon: 'binoculars', category: 'catch', target: 10, metric: 'uniqueSpecies' },
  { id: 'species-25', name: 'Biodiversity Pro', description: 'Catch 25 different species', icon: 'earth', category: 'catch', target: 25, metric: 'uniqueSpecies' },
  { id: 'streak-3', name: 'On a Roll', description: 'Build a 3-day catch streak', icon: 'fire', category: 'streak', target: 3, metric: 'bestStreak' },
  { id: 'streak-7', name: 'Week on the Water', description: 'Build a 7-day catch streak', icon: 'calendar-week', category: 'streak', target: 7, metric: 'bestStreak' },
  { id: 'streak-14', name: 'Unstoppable', description: 'Build a 14-day catch streak', icon: 'lightning-bolt', category: 'streak', target: 14, metric: 'bestStreak' },
  { id: 'streak-30', name: 'Daily Ritual', description: 'Build a 30-day catch streak', icon: 'calendar-star', category: 'streak', target: 30, metric: 'bestStreak' },
  { id: 'rare-1', name: 'Rare Find', description: 'Land a rare catch', icon: 'diamond-stone', category: 'rarity', target: 1, metric: 'rareCatches' },
  { id: 'rare-5', name: 'Trophy Cabinet', description: 'Land 5 rare-or-better catches', icon: 'star-circle', category: 'rarity', target: 5, metric: 'rareCatches' },
  { id: 'rare-20', name: 'Rarity Hunter', description: 'Land 20 rare-or-better catches', icon: 'creation', category: 'rarity', target: 20, metric: 'rareCatches' },
  { id: 'legendary-1', name: 'Against the Odds', description: 'Land a legendary catch', icon: 'crown', category: 'rarity', target: 1, metric: 'legendaryCatches' },
  { id: 'legendary-5', name: 'Living Legend', description: 'Land 5 legendary catches', icon: 'crown-circle', category: 'rarity', target: 5, metric: 'legendaryCatches' },
  { id: 'level-5', name: 'Finding Your Feet', description: 'Reach level 5', icon: 'chevron-double-up', category: 'progression', target: 5, metric: 'level' },
  { id: 'level-10', name: 'Committed Caster', description: 'Reach level 10', icon: 'arm-flex', category: 'progression', target: 10, metric: 'level' },
  { id: 'level-25', name: 'Quarter Master', description: 'Reach level 25', icon: 'shield-star', category: 'progression', target: 25, metric: 'level' },
  { id: 'level-50', name: 'Master Angler', description: 'Reach level 50', icon: 'trophy-award', category: 'progression', target: 50, metric: 'level' },
  { id: 'level-75', name: 'Elite Waterman', description: 'Reach level 75', icon: 'seal', category: 'progression', target: 75, metric: 'level' },
  { id: 'level-100', name: 'Legend of the Waters', description: 'Reach level 100', icon: 'podium-gold', category: 'progression', target: 100, metric: 'level' },
  { id: 'regions-3', name: 'Roaming Rod', description: 'Fish in 3 regions', icon: 'map-marker-radius', category: 'exploration', target: 3, metric: 'regionsFished' },
  { id: 'regions-5', name: 'Global Angler', description: 'Fish in 5 regions', icon: 'earth-arrow-right', category: 'exploration', target: 5, metric: 'regionsFished' },
];
