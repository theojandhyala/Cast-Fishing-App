export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // First Steps
  { id: 'first_cast', name: 'First Cast', description: 'Log your first catch', category: 'First Steps', emoji: '🎣', xpReward: 50, rarity: 'common', unlocked: false },
  { id: 'tight_lines', name: 'Tight Lines', description: 'Log 5 catches', category: 'First Steps', emoji: '🏅', xpReward: 100, rarity: 'common', unlocked: false },
  { id: 'hooked', name: 'Hooked', description: 'Log 25 catches', category: 'First Steps', emoji: '🪝', xpReward: 250, rarity: 'rare', unlocked: false },
  { id: 'century_club', name: 'Century Club', description: 'Log 100 catches', category: 'First Steps', emoji: '💯', xpReward: 500, rarity: 'epic', unlocked: false },
  { id: 'legend', name: 'Legend', description: 'Log 500 catches', category: 'First Steps', emoji: '👑', xpReward: 2000, rarity: 'legendary', unlocked: false },

  // Species Hunter
  { id: 'fresh_starter', name: 'Fresh Starter', description: 'Catch a freshwater species', category: 'Species Hunter', emoji: '💧', xpReward: 50, rarity: 'common', unlocked: false },
  { id: 'salt_life', name: 'Salt Life', description: 'Catch a saltwater species', category: 'Species Hunter', emoji: '🌊', xpReward: 50, rarity: 'common', unlocked: false },
  { id: 'double_species', name: 'Double Species', description: 'Catch 2 different species', category: 'Species Hunter', emoji: '🐡', xpReward: 100, rarity: 'common', unlocked: false },
  { id: 'species_explorer', name: 'Species Explorer', description: 'Catch 5 different species', category: 'Species Hunter', emoji: '🗺️', xpReward: 300, rarity: 'rare', unlocked: false },
  { id: 'master_angler', name: 'Master Angler', description: 'Catch all 10 species in the database', category: 'Species Hunter', emoji: '🏆', xpReward: 1000, rarity: 'legendary', unlocked: false },

  // Size Matters
  { id: 'first_kilo', name: 'First Kilo', description: 'Catch a fish over 1kg', category: 'Size Matters', emoji: '⚖️', xpReward: 75, rarity: 'common', unlocked: false },
  { id: 'double_figures', name: 'Double Figures', description: 'Catch a fish over 10kg (22lb)', category: 'Size Matters', emoji: '📏', xpReward: 400, rarity: 'rare', unlocked: false },
  { id: 'monster', name: 'Monster', description: 'Catch a fish over 20kg', category: 'Size Matters', emoji: '🦈', xpReward: 800, rarity: 'epic', unlocked: false },
  { id: 'giant_slayer', name: 'Giant Slayer', description: 'Beat any UK record (mock check)', category: 'Size Matters', emoji: '⚡', xpReward: 1500, rarity: 'legendary', unlocked: false },
  { id: 'personal_best', name: 'Personal Best', description: 'Beat your own PB for any species', category: 'Size Matters', emoji: '🥇', xpReward: 200, rarity: 'rare', unlocked: false },

  // Time & Dedication
  { id: 'early_bird', name: 'Early Bird', description: 'Log a catch before 6am', category: 'Time & Dedication', emoji: '🌅', xpReward: 150, rarity: 'rare', unlocked: false },
  { id: 'night_owl', name: 'Night Owl', description: 'Log a catch after 10pm', category: 'Time & Dedication', emoji: '🦉', xpReward: 150, rarity: 'rare', unlocked: false },
  { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Fish on 5 consecutive weekends', category: 'Time & Dedication', emoji: '🗓️', xpReward: 400, rarity: 'epic', unlocked: false },
  { id: 'streak_master', name: 'Streak Master', description: '7-day catch streak', category: 'Time & Dedication', emoji: '🔥', xpReward: 500, rarity: 'epic', unlocked: false },
  { id: 'seasonal', name: 'Seasonal', description: 'Catch fish in all 4 seasons', category: 'Time & Dedication', emoji: '🍂', xpReward: 600, rarity: 'epic', unlocked: false },

  // Explorer
  { id: 'local_hero', name: 'Local Hero', description: 'Add your first spot', category: 'Explorer', emoji: '📍', xpReward: 75, rarity: 'common', unlocked: false },
  { id: 'spot_collector', name: 'Spot Collector', description: 'Add 5 spots', category: 'Explorer', emoji: '🗾', xpReward: 200, rarity: 'rare', unlocked: false },
  { id: 'world_explorer', name: 'World Explorer', description: 'Add spots in 3 countries', category: 'Explorer', emoji: '🌍', xpReward: 500, rarity: 'epic', unlocked: false },
  { id: 'map_master', name: 'Map Master', description: 'Visit 10 different spots', category: 'Explorer', emoji: '🗺️', xpReward: 400, rarity: 'rare', unlocked: false },
  { id: 'off_beaten_track', name: 'Off the Beaten Track', description: 'Fish a private water', category: 'Explorer', emoji: '🔒', xpReward: 300, rarity: 'rare', unlocked: false },

  // Knowledge
  { id: 'knot_master', name: 'Knot Master', description: 'Bookmark 5 knots', category: 'Knowledge', emoji: '🪢', xpReward: 150, rarity: 'rare', unlocked: false },
  { id: 'species_nerd', name: 'Species Nerd', description: 'View all species in the guide', category: 'Knowledge', emoji: '📚', xpReward: 200, rarity: 'rare', unlocked: false },
  { id: 'gear_head', name: 'Gear Head', description: 'Add 10 items to gear tracker', category: 'Knowledge', emoji: '🎒', xpReward: 200, rarity: 'rare', unlocked: false },
  { id: 'trip_planner', name: 'Trip Planner', description: 'Plan your first trip', category: 'Knowledge', emoji: '📋', xpReward: 100, rarity: 'common', unlocked: false },
  { id: 'prepared', name: 'Prepared', description: 'Complete full gear checklist', category: 'Knowledge', emoji: '✅', xpReward: 150, rarity: 'common', unlocked: false },

  // Social
  { id: 'community_member', name: 'Community Member', description: 'Post first public catch', category: 'Social', emoji: '🌐', xpReward: 100, rarity: 'common', unlocked: false },
  { id: 'fan_favourite', name: 'Fan Favourite', description: 'Get 10 likes on a catch', category: 'Social', emoji: '❤️', xpReward: 300, rarity: 'rare', unlocked: false },
  { id: 'club_member', name: 'Club Member', description: 'Join a fishing club', category: 'Social', emoji: '🤝', xpReward: 150, rarity: 'common', unlocked: false },
  { id: 'mentor', name: 'Mentor', description: 'Share a tip in community', category: 'Social', emoji: '💡', xpReward: 200, rarity: 'rare', unlocked: false },
  { id: 'top_leaderboard', name: 'Top of the Leaderboard', description: 'Reach #1 weekly', category: 'Social', emoji: '🥇', xpReward: 1000, rarity: 'legendary', unlocked: false },

  // Specialist
  { id: 'carp_whisperer', name: 'Carp Whisperer', description: 'Catch 10 Carp', category: 'Specialist', emoji: '🐠', xpReward: 350, rarity: 'rare', unlocked: false },
  { id: 'pike_hunter', name: 'Pike Hunter', description: 'Catch 5 Pike', category: 'Specialist', emoji: '🦷', xpReward: 300, rarity: 'rare', unlocked: false },
  { id: 'salmon_king', name: 'Salmon King', description: 'Catch a Salmon', category: 'Specialist', emoji: '🐟', xpReward: 500, rarity: 'epic', unlocked: false },
  { id: 'sea_bass_surfer', name: 'Sea Bass Surfer', description: 'Catch 3 Sea Bass', category: 'Specialist', emoji: '🌊', xpReward: 300, rarity: 'rare', unlocked: false },
  { id: 'night_carper', name: 'Night Carper', description: 'Catch Carp after midnight', category: 'Specialist', emoji: '🌙', xpReward: 400, rarity: 'epic', unlocked: false },
];
