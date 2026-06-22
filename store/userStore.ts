import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface UserState {
  preferences: UserPreferences;
  bookmarkedKnots: string[];
  recentIdentifications: FishIdentification[];
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  bookmarkKnot: (id: string) => void;
  unbookmarkKnot: (id: string) => void;
  isKnotBookmarked: (id: string) => boolean;
  addIdentification: (id: FishIdentification) => void;
  load: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  preferences: {
    defaultLocation: 'London, UK',
    favouriteSpecies: ['Carp', 'Pike'],
    notificationsEnabled: true,
    measurementUnit: 'metric',
  },
  bookmarkedKnots: [],
  recentIdentifications: [],

  load: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_user_prefs');
      if (stored) {
        const data = JSON.parse(stored);
        set(data);
      }
    } catch {
      // use defaults
    }
  },

  updatePreferences: async (prefs) => {
    const updated = { ...get().preferences, ...prefs };
    set({ preferences: updated });
    await AsyncStorage.setItem('cast_user_prefs', JSON.stringify({ preferences: updated, bookmarkedKnots: get().bookmarkedKnots }));
  },

  bookmarkKnot: async (id) => {
    const updated = [...get().bookmarkedKnots, id];
    set({ bookmarkedKnots: updated });
    await AsyncStorage.setItem('cast_user_prefs', JSON.stringify({ preferences: get().preferences, bookmarkedKnots: updated }));
  },

  unbookmarkKnot: async (id) => {
    const updated = get().bookmarkedKnots.filter((k) => k !== id);
    set({ bookmarkedKnots: updated });
    await AsyncStorage.setItem('cast_user_prefs', JSON.stringify({ preferences: get().preferences, bookmarkedKnots: updated }));
  },

  isKnotBookmarked: (id) => get().bookmarkedKnots.includes(id),

  addIdentification: async (identification) => {
    const updated = [identification, ...get().recentIdentifications].slice(0, 20);
    set({ recentIdentifications: updated });
    await AsyncStorage.setItem('cast_identifications', JSON.stringify(updated));
  },
}));
