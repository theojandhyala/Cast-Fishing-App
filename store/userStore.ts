import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Legacy types kept for backward compat ──────────────────────────────────
export interface FishIdentification {
  id: string;
  imageUri: string;
  species: string;
  confidence: number;
  weight?: string;
  length?: string;
  legal: boolean;
  notes: string;
  date: string;
}

interface UserPreferences {
  defaultLocation: string;
  favouriteSpecies: string[];
  notificationsEnabled: boolean;
  measurementUnit: 'metric' | 'imperial';
}

// ── UserProfile ────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUri: string | null;
  homeRegion: string;
  speciesInterests: string[];
  joinedAt: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalCatches: number;
  totalWeightKg: number;
  speciesCaught: string[];
  rarityCounts: Record<string, number>;
  personalBests: Record<string, number>;
  badges: string[];
  catchStreak: number;
  lastFishDate: string | null;
  friends: string[];
  friendRequests: string[];
  sentRequests: string[];
  isPublic: boolean;
  onboardingComplete: boolean;
}

// ── XP / Level helpers ─────────────────────────────────────────────────────
function xpForLevel(level: number): number {
  // XP required to reach this level from level 1
  // level 1 = 0, level 2 = 200, level 3 = 600, level 4 = 1200 ...
  // Each level N requires 200*(N-1) XP to advance. Sum from 1..level-1.
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += 200 * i;
  }
  return total;
}

function xpNeededForNextLevel(level: number): number {
  return 200 * level;
}

function computeLevel(totalXp: number): { level: number; xpToNextLevel: number } {
  let level = 1;
  while (level < 100) {
    const needed = xpForLevel(level + 1);
    if (totalXp >= needed) {
      level = level + 1;
    } else {
      break;
    }
  }
  if (level >= 100) {
    return { level: 100, xpToNextLevel: 0 };
  }
  const nextThreshold = xpForLevel(level + 1);
  return { level, xpToNextLevel: nextThreshold - totalXp };
}

export function getLevelTitle(level: number): string {
  if (level === 100) return 'GOAT';
  if (level >= 91) return 'Grand Master';
  if (level >= 81) return 'Legend';
  if (level >= 71) return 'Veteran';
  if (level >= 61) return 'Specialist';
  if (level >= 51) return 'Elite';
  if (level >= 41) return 'Master Angler';
  if (level >= 31) return 'Expert';
  if (level >= 21) return 'Skilled Angler';
  if (level >= 11) return 'Angler';
  if (level >= 6) return 'Apprentice';
  return 'Rookie';
}

// ── Badge definitions ──────────────────────────────────────────────────────
export const BADGE_DEFS: Record<string, { label: string; icon: string }> = {
  first_blood: { label: 'First Blood', icon: 'fish' },
  lucky_seven: { label: 'Lucky Seven', icon: 'numeric-7-circle' },
  century: { label: 'Century', icon: 'counter' },
  night_owl: { label: 'Night Owl', icon: 'owl' },
  early_bird: { label: 'Early Bird', icon: 'weather-sunset-up' },
  species_hunter_5: { label: 'Species Hunter', icon: 'magnify' },
  species_hunter_25: { label: 'Species Expert', icon: 'magnify-expand' },
  weight_lifter: { label: 'Weight Lifter', icon: 'weight' },
  titan: { label: 'Titan', icon: 'arm-flex' },
  leviathan: { label: 'Leviathan', icon: 'sea-wind' },
  rare_find: { label: 'Rare Find', icon: 'star-circle' },
  epic_catch: { label: 'Epic Catch', icon: 'lightning-bolt' },
  legendary_catch: { label: 'Legendary Catch', icon: 'crown' },
  streak_7: { label: '7-Day Streak', icon: 'fire' },
  streak_30: { label: '30-Day Streak', icon: 'fire-alert' },
  globetrotter: { label: 'Globetrotter', icon: 'earth' },
  pb_breaker: { label: 'PB Breaker', icon: 'trophy' },
};

function checkBadges(
  profile: UserProfile,
  weightKg: number,
  rarity: string,
  timeOfCatch: Date,
  isNewSpecies: boolean,
  isPB: boolean
): string[] {
  const earned: string[] = [];
  const already = new Set(profile.badges);
  const hour = timeOfCatch.getHours();

  const check = (id: string, condition: boolean) => {
    if (condition && !already.has(id)) earned.push(id);
  };

  check('first_blood', profile.totalCatches === 1);
  check('lucky_seven', profile.totalCatches >= 7);
  check('century', profile.totalCatches >= 100);
  check('night_owl', hour >= 0 && hour < 4);
  check('early_bird', hour >= 4 && hour < 6);
  check('species_hunter_5', profile.speciesCaught.length >= 5);
  check('species_hunter_25', profile.speciesCaught.length >= 25);
  check('weight_lifter', weightKg > 5);
  check('titan', weightKg > 15);
  check('leviathan', weightKg > 30);
  check('rare_find', rarity === 'rare');
  check('epic_catch', rarity === 'epic');
  check('legendary_catch', rarity === 'legendary');
  check('streak_7', profile.catchStreak >= 7);
  check('streak_30', profile.catchStreak >= 30);
  check('pb_breaker', isPB);

  return earned;
}

function xpForCatch(rarity: string, weightKg: number): number {
  const base: Record<string, number> = {
    common: 20,
    uncommon: 35,
    rare: 60,
    epic: 100,
    legendary: 200,
  };
  const b = base[rarity] ?? 20;
  return Math.round(b + weightKg * 2);
}

// ── Default profile ────────────────────────────────────────────────────────
function defaultProfile(): UserProfile {
  return {
    id: '',
    username: '',
    displayName: '',
    bio: '',
    avatarUri: null,
    homeRegion: '',
    speciesInterests: [],
    joinedAt: '',
    level: 1,
    xp: 0,
    xpToNextLevel: 200,
    totalCatches: 0,
    totalWeightKg: 0,
    speciesCaught: [],
    rarityCounts: {},
    personalBests: {},
    badges: [],
    catchStreak: 0,
    lastFishDate: null,
    friends: [],
    friendRequests: [],
    sentRequests: [],
    isPublic: true,
    onboardingComplete: false,
  };
}

// ── Store state ────────────────────────────────────────────────────────────
interface UserState {
  // Profile
  profile: UserProfile;

  // Legacy fields (for backward compat with existing code that uses them)
  preferences: UserPreferences;
  bookmarkedKnots: string[];
  recentIdentifications: FishIdentification[];

  // Profile actions
  initUser: (
    username: string,
    displayName: string,
    homeRegion: string,
    speciesInterests: string[],
    avatarUri: string | null
  ) => Promise<void>;
  addCatchXP: (
    fishId: string,
    weightKg: number,
    rarity: string,
    timeOfCatch: Date
  ) => Promise<{
    xpGained: number;
    leveledUp: boolean;
    newLevel: number;
    newBadges: string[];
    isNewSpecies: boolean;
    isPB: boolean;
  }>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  addFriend: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  acceptFriendRequest: (userId: string) => Promise<void>;

  // Legacy actions
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  bookmarkKnot: (id: string) => void;
  unbookmarkKnot: (id: string) => void;
  isKnotBookmarked: (id: string) => boolean;
  addIdentification: (id: FishIdentification) => void;

  // Persistence
  load: () => Promise<void>;
  save: () => Promise<void>;
}

const STORAGE_KEY = 'cast_user_profile_v2';
const LEGACY_KEY = 'cast_user_prefs';
const IDENT_KEY = 'cast_identifications';

export const useUserStore = create<UserState>((set, get) => ({
  profile: defaultProfile(),
  preferences: {
    defaultLocation: 'London, UK',
    favouriteSpecies: ['Carp', 'Pike'],
    notificationsEnabled: true,
    measurementUnit: 'metric',
  },
  bookmarkedKnots: [],
  recentIdentifications: [],

  // ── Persistence ──────────────────────────────────────────────────────────
  load: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set(data);
        return;
      }
      // Migrate legacy prefs
      const legacy = await AsyncStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const data = JSON.parse(legacy);
        set({ preferences: data.preferences ?? get().preferences, bookmarkedKnots: data.bookmarkedKnots ?? [] });
      }
      const idents = await AsyncStorage.getItem(IDENT_KEY);
      if (idents) {
        set({ recentIdentifications: JSON.parse(idents) });
      }
    } catch {
      // use defaults
    }
  },

  save: async () => {
    try {
      const { profile, preferences, bookmarkedKnots, recentIdentifications } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, preferences, bookmarkedKnots, recentIdentifications }));
    } catch {}
  },

  // ── Profile actions ──────────────────────────────────────────────────────
  initUser: async (username, displayName, homeRegion, speciesInterests, avatarUri) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const profile: UserProfile = {
      ...defaultProfile(),
      id,
      username,
      displayName,
      homeRegion,
      speciesInterests,
      avatarUri,
      joinedAt: new Date().toISOString(),
      onboardingComplete: true,
    };
    set({ profile });
    await get().save();
  },

  addCatchXP: async (fishId, weightKg, rarity, timeOfCatch) => {
    const p = get().profile;
    const xpGained = xpForCatch(rarity, weightKg);
    const newXp = p.xp + xpGained;
    const oldLevel = p.level;

    const { level: newLevel, xpToNextLevel } = computeLevel(newXp);
    const leveledUp = newLevel > oldLevel;

    // Update streak
    let catchStreak = p.catchStreak;
    const today = timeOfCatch.toDateString();
    if (p.lastFishDate) {
      const last = new Date(p.lastFishDate).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (last === yesterday) catchStreak += 1;
      else if (last !== today) catchStreak = 1;
      // same day → no change
    } else {
      catchStreak = 1;
    }

    const isNewSpecies = !p.speciesCaught.includes(fishId);
    const speciesCaught = isNewSpecies ? [...p.speciesCaught, fishId] : p.speciesCaught;

    const isPB = weightKg > (p.personalBests[fishId] ?? 0);
    const personalBests = isPB ? { ...p.personalBests, [fishId]: weightKg } : p.personalBests;

    const rarityCounts = { ...p.rarityCounts, [rarity]: (p.rarityCounts[rarity] ?? 0) + 1 };

    const updatedProfile: UserProfile = {
      ...p,
      xp: newXp,
      level: newLevel,
      xpToNextLevel,
      totalCatches: p.totalCatches + 1,
      totalWeightKg: p.totalWeightKg + weightKg,
      speciesCaught,
      rarityCounts,
      personalBests,
      catchStreak,
      lastFishDate: timeOfCatch.toISOString(),
    };

    // Check badges against the updated profile (with new counts already in)
    const newBadges = checkBadges(updatedProfile, weightKg, rarity, timeOfCatch, isNewSpecies, isPB);
    updatedProfile.badges = [...p.badges, ...newBadges];

    set({ profile: updatedProfile });
    await get().save();

    return { xpGained, leveledUp, newLevel, newBadges, isNewSpecies, isPB };
  },

  updateProfile: async (partial) => {
    const profile = { ...get().profile, ...partial };
    set({ profile });
    await get().save();
  },

  addFriend: async (userId) => {
    const p = get().profile;
    if (!p.sentRequests.includes(userId) && !p.friends.includes(userId)) {
      const profile = { ...p, sentRequests: [...p.sentRequests, userId] };
      set({ profile });
      await get().save();
    }
  },

  removeFriend: async (userId) => {
    const p = get().profile;
    const profile = { ...p, friends: p.friends.filter((id) => id !== userId) };
    set({ profile });
    await get().save();
  },

  acceptFriendRequest: async (userId) => {
    const p = get().profile;
    const profile = {
      ...p,
      friendRequests: p.friendRequests.filter((id) => id !== userId),
      friends: [...p.friends, userId],
    };
    set({ profile });
    await get().save();
  },

  // ── Legacy actions ───────────────────────────────────────────────────────
  updatePreferences: async (prefs) => {
    const updated = { ...get().preferences, ...prefs };
    set({ preferences: updated });
    await get().save();
  },

  bookmarkKnot: async (id) => {
    const updated = [...get().bookmarkedKnots, id];
    set({ bookmarkedKnots: updated });
    await get().save();
  },

  unbookmarkKnot: async (id) => {
    const updated = get().bookmarkedKnots.filter((k) => k !== id);
    set({ bookmarkedKnots: updated });
    await get().save();
  },

  isKnotBookmarked: (id) => get().bookmarkedKnots.includes(id),

  addIdentification: async (identification) => {
    const updated = [identification, ...get().recentIdentifications].slice(0, 20);
    set({ recentIdentifications: updated });
    await get().save();
  },
}));
