import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Catch {
  id: string;
  species: string;
  weight: number; // kg
  length?: number; // cm
  location?: string;
  latitude?: number;
  longitude?: number;
  bait?: string;
  notes?: string;
  photo?: string;
  weather?: {
    temp: number;
    description: string;
    wind: number;
  };
  date: string;
  emoji?: string;
}

export interface CatchStats {
  total: number;
  speciesCounts: Record<string, number>;
  personalBests: Record<string, number>;
  thisWeek: number;
  thisMonth: number;
  heaviest: Catch | null;
  longestStreak: number;
}

interface CatchState {
  catches: Catch[];
  isLoading: boolean;
  addCatch: (c: Omit<Catch, 'id' | 'date'>) => Promise<Catch>;
  removeCatch: (id: string) => void;
  updateCatch: (id: string, updates: Partial<Catch>) => void;
  loadCatches: () => Promise<void>;
  getStats: () => CatchStats;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useCatchStore = create<CatchState>((set, get) => ({
  catches: [],
  isLoading: false,

  loadCatches: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_catches');
      if (stored) {
        const parsed: Catch[] = JSON.parse(stored);
        set({ catches: parsed });
      } else {
        set({ catches: [] });
      }
    } catch {
      set({ catches: [] });
    }
  },

  addCatch: async (c) => {
    const newCatch: Catch = {
      ...c,
      id: generateId(),
      date: new Date().toISOString(),
    };
    const updated = [newCatch, ...get().catches];
    set({ catches: updated });
    await AsyncStorage.setItem('cast_catches', JSON.stringify(updated));
    return newCatch;
  },

  removeCatch: async (id) => {
    const updated = get().catches.filter((c) => c.id !== id);
    set({ catches: updated });
    await AsyncStorage.setItem('cast_catches', JSON.stringify(updated));
  },

  updateCatch: async (id, updates) => {
    const updated = get().catches.map((c) => (c.id === id ? { ...c, ...updates } : c));
    set({ catches: updated });
    await AsyncStorage.setItem('cast_catches', JSON.stringify(updated));
  },

  getStats: () => {
    const catches = get().catches;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const speciesCounts: Record<string, number> = {};
    const personalBests: Record<string, number> = {};
    let heaviest: Catch | null = null;

    for (const c of catches) {
      speciesCounts[c.species] = (speciesCounts[c.species] || 0) + 1;
      if (!personalBests[c.species] || c.weight > personalBests[c.species]) {
        personalBests[c.species] = c.weight;
      }
      if (!heaviest || c.weight > heaviest.weight) {
        heaviest = c;
      }
    }

    return {
      total: catches.length,
      speciesCounts,
      personalBests,
      thisWeek: catches.filter((c) => new Date(c.date) >= weekAgo).length,
      thisMonth: catches.filter((c) => new Date(c.date) >= monthAgo).length,
      heaviest,
      longestStreak: 0,
    };
  },
}));
