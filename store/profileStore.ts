import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BADGES, RARITY_XP, RarityTier, levelFromXp, titleForLevel } from '../data/progression';

export interface RarityStats {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

export interface UnlockedBadge {
  id: string;
  unlockedAt: string;
}

interface CatchProgress {
  speciesId: string;
  rarity: RarityTier;
  caughtAt?: string;
  regionId?: string;
  bonusXp?: number;
}

interface ProfileState {
  username: string;
  photoUri: string | null;
  regionId: string;
  targetSpecies: string[];
  onboardingComplete: boolean;
  xp: number;
  totalCatches: number;
  currentStreak: number;
  bestStreak: number;
  lastCatchDate: string | null;
  speciesCaught: string[];
  regionsFished: string[];
  rarityStats: RarityStats;
  badges: UnlockedBadge[];
  pendingLevelUp: number | null;
  setOnboardingProfile: (profile: Pick<ProfileState, 'username' | 'photoUri' | 'regionId' | 'targetSpecies'>) => void;
  updateProfile: (profile: Partial<Pick<ProfileState, 'username' | 'photoUri' | 'regionId' | 'targetSpecies'>>) => void;
  addXp: (amount: number) => void;
  recordCatch: (catchProgress: CatchProgress) => void;
  dismissLevelUp: () => void;
  resetProfile: () => void;
}

const initialState = {
  username: '',
  photoUri: null,
  regionId: '',
  targetSpecies: [] as string[],
  onboardingComplete: false,
  xp: 0,
  totalCatches: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastCatchDate: null,
  speciesCaught: [] as string[],
  regionsFished: [] as string[],
  rarityStats: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 } as RarityStats,
  badges: [] as UnlockedBadge[],
  pendingLevelUp: null,
};

const dayKey = (value: string | Date) => {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000;
};

const earnedBadges = (state: ProfileState, now: string): UnlockedBadge[] => {
  const rareCatches = state.rarityStats.rare + state.rarityStats.epic + state.rarityStats.legendary;
  const metrics: Record<(typeof BADGES)[number]['metric'], number> = {
    totalCatches: state.totalCatches,
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    uniqueSpecies: state.speciesCaught.length,
    rareCatches,
    legendaryCatches: state.rarityStats.legendary,
    level: levelFromXp(state.xp),
    regionsFished: state.regionsFished.length,
  };
  const existing = new Set(state.badges.map((badge) => badge.id));
  return BADGES.filter((badge) => !existing.has(badge.id) && metrics[badge.metric] >= badge.target)
    .map((badge) => ({ id: badge.id, unlockedAt: now }));
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...initialState,
      setOnboardingProfile: (profile) => set({ ...profile, onboardingComplete: true }),
      updateProfile: (profile) => set(profile),
      addXp: (amount) => set((state) => {
        const previousLevel = levelFromXp(state.xp);
        const xp = Math.max(0, state.xp + Math.max(0, Math.round(amount)));
        const level = levelFromXp(xp);
        const nextState = { ...state, xp, pendingLevelUp: level > previousLevel ? level : state.pendingLevelUp };
        return { xp, pendingLevelUp: nextState.pendingLevelUp, badges: [...state.badges, ...earnedBadges(nextState, new Date().toISOString())] };
      }),
      recordCatch: (entry) => set((state) => {
        const caughtAt = entry.caughtAt ?? new Date().toISOString();
        const today = dayKey(caughtAt);
        const last = state.lastCatchDate ? dayKey(state.lastCatchDate) : null;
        const currentStreak = last === today ? state.currentStreak : last === today - 1 ? state.currentStreak + 1 : 1;
        const xp = state.xp + RARITY_XP[entry.rarity] + Math.max(0, entry.bonusXp ?? 0);
        const previousLevel = levelFromXp(state.xp);
        const nextLevel = levelFromXp(xp);
        const nextState: ProfileState = {
          ...state,
          xp,
          totalCatches: state.totalCatches + 1,
          currentStreak,
          bestStreak: Math.max(state.bestStreak, currentStreak),
          lastCatchDate: caughtAt,
          speciesCaught: state.speciesCaught.includes(entry.speciesId) ? state.speciesCaught : [...state.speciesCaught, entry.speciesId],
          regionsFished: !entry.regionId || state.regionsFished.includes(entry.regionId) ? state.regionsFished : [...state.regionsFished, entry.regionId],
          rarityStats: { ...state.rarityStats, [entry.rarity]: state.rarityStats[entry.rarity] + 1 },
          pendingLevelUp: nextLevel > previousLevel ? nextLevel : state.pendingLevelUp,
        };
        return { ...nextState, badges: [...state.badges, ...earnedBadges(nextState, caughtAt)] };
      }),
      dismissLevelUp: () => set({ pendingLevelUp: null }),
      resetProfile: () => set(initialState),
    }),
    {
      name: 'cast-profile-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ pendingLevelUp: _pendingLevelUp, ...state }) => state,
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<ProfileState>), pendingLevelUp: null }),
    },
  ),
);

export const selectLevel = (state: ProfileState) => levelFromXp(state.xp);
export const selectTitle = (state: ProfileState) => titleForLevel(levelFromXp(state.xp));
