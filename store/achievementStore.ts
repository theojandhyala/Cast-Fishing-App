import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS, Achievement } from '../data/achievementsData';

interface AchievementState {
  achievements: Achievement[];
  newlyUnlocked: Achievement[];
  load: () => Promise<void>;
  checkAchievements: (params: {
    totalCatches?: number;
    speciesCounts?: Record<string, number>;
    heaviestWeight?: number;
    catchHour?: number;
    spotsAdded?: number;
    knotsBookmarked?: number;
    streak?: number;
  }) => Achievement[];
  clearNewlyUnlocked: () => void;
  getUnlockedCount: () => number;
  getTotalXPFromAchievements: () => number;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: ACHIEVEMENTS,
  newlyUnlocked: [],

  load: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_achievements');
      if (stored) {
        const savedStates: Record<string, { unlocked: boolean; unlockedAt?: string }> = JSON.parse(stored);
        const achievements = ACHIEVEMENTS.map(a => ({
          ...a,
          ...(savedStates[a.id] || {}),
          unlockedAt: savedStates[a.id]?.unlockedAt ? new Date(savedStates[a.id].unlockedAt!) : undefined,
        }));
        set({ achievements });
      }
    } catch {
      // use defaults
    }
  },

  checkAchievements: (params) => {
    const current = get().achievements;
    const newlyUnlocked: Achievement[] = [];
    const { totalCatches = 0, speciesCounts = {}, heaviestWeight = 0, catchHour = -1, spotsAdded = 0, knotsBookmarked = 0, streak = 0 } = params;
    const speciesCount = Object.keys(speciesCounts).length;
    const carpCount = speciesCounts['Carp'] || 0;
    const pikeCount = speciesCounts['Pike'] || 0;
    const salmonCount = speciesCounts['Salmon'] || 0;
    const seaBassCount = speciesCounts['Sea Bass'] || 0;

    const conditions: Record<string, boolean> = {
      first_cast: totalCatches >= 1,
      tight_lines: totalCatches >= 5,
      hooked: totalCatches >= 25,
      century_club: totalCatches >= 100,
      legend: totalCatches >= 500,
      fresh_starter: ['Carp', 'Pike', 'Perch', 'Roach', 'Tench', 'Bream', 'Barbel', 'Grayling', 'Brown Trout'].some(s => (speciesCounts[s] || 0) > 0),
      salt_life: ['Sea Bass', 'Cod', 'Mackerel', 'Pollock', 'Flounder'].some(s => (speciesCounts[s] || 0) > 0),
      double_species: speciesCount >= 2,
      species_explorer: speciesCount >= 5,
      master_angler: speciesCount >= 10,
      first_kilo: heaviestWeight >= 1,
      double_figures: heaviestWeight >= 10,
      monster: heaviestWeight >= 20,
      giant_slayer: heaviestWeight >= 30,
      personal_best: totalCatches > 0,
      early_bird: catchHour >= 0 && catchHour < 6,
      night_owl: catchHour >= 22,
      local_hero: spotsAdded >= 1,
      spot_collector: spotsAdded >= 5,
      knot_master: knotsBookmarked >= 5,
      streak_master: streak >= 7,
      carp_whisperer: carpCount >= 10,
      pike_hunter: pikeCount >= 5,
      salmon_king: salmonCount >= 1,
      sea_bass_surfer: seaBassCount >= 3,
      night_carper: carpCount > 0 && (catchHour >= 0 && catchHour < 3),
    };

    const updated = current.map(a => {
      if (!a.unlocked && conditions[a.id]) {
        const unlocked = { ...a, unlocked: true, unlockedAt: new Date() };
        newlyUnlocked.push(unlocked);
        return unlocked;
      }
      return a;
    });

    if (newlyUnlocked.length > 0) {
      set({ achievements: updated, newlyUnlocked });
      const savedStates: Record<string, { unlocked: boolean; unlockedAt?: string }> = {};
      updated.forEach(a => {
        savedStates[a.id] = { unlocked: a.unlocked, unlockedAt: a.unlockedAt?.toISOString() };
      });
      AsyncStorage.setItem('cast_achievements', JSON.stringify(savedStates));
    }

    return newlyUnlocked;
  },

  clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),

  getUnlockedCount: () => get().achievements.filter(a => a.unlocked).length,

  getTotalXPFromAchievements: () =>
    get().achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0),
}));
