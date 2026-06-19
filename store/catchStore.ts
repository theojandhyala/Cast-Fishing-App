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
  isDemoData: boolean;
  addCatch: (c: Omit<Catch, 'id' | 'date'>) => Promise<Catch>;
  removeCatch: (id: string) => void;
  updateCatch: (id: string, updates: Partial<Catch>) => void;
  loadCatches: () => Promise<void>;
  getStats: () => CatchStats;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEMO_CATCHES: Catch[] = [
  { id: 'demo1', species: 'Common Carp', weight: 8.4, length: 68, location: 'Redmire Pool', bait: 'Boilies', date: new Date(Date.now() - 2 * 86400000).toISOString(), notes: 'Caught just before dusk on a 15mm tutti frutti boilie' },
  { id: 'demo2', species: 'Northern Pike', weight: 5.2, length: 72, location: 'River Wye', bait: 'Deadbait', date: new Date(Date.now() - 5 * 86400000).toISOString(), notes: 'Spun a smelt along the far bank reeds' },
  { id: 'demo3', species: 'European Perch', weight: 1.1, length: 31, location: 'Grafham Water', bait: 'Drop shot lure', date: new Date(Date.now() - 7 * 86400000).toISOString(), notes: '' },
  { id: 'demo4', species: 'Bream', weight: 3.8, length: 52, location: 'Norfolk Broads', bait: 'Maggots', date: new Date(Date.now() - 10 * 86400000).toISOString(), notes: 'Dawn session, flat calm water' },
  { id: 'demo5', species: 'Tench', weight: 2.1, length: 44, location: 'Oxfordshire Lake', bait: 'Sweetcorn', date: new Date(Date.now() - 14 * 86400000).toISOString(), notes: 'Summer morning in the lily pads' },
  { id: 'demo6', species: 'Chub', weight: 1.9, length: 40, location: 'Hampshire Avon', bait: 'Cheese paste', date: new Date(Date.now() - 18 * 86400000).toISOString(), notes: 'Upstream cast under a willow' },
  { id: 'demo7', species: 'Brown Trout', weight: 0.8, length: 34, location: 'River Test', bait: 'Dry fly', date: new Date(Date.now() - 22 * 86400000).toISOString(), notes: '' },
  { id: 'demo8', species: 'Common Carp', weight: 11.2, length: 78, location: 'Savay Lake', bait: 'Boilies', date: new Date(Date.now() - 30 * 86400000).toISOString(), notes: 'PB! On a stiff zig rig at 18 inches depth' },
];

export const useCatchStore = create<CatchState>((set, get) => ({
  catches: [],
  isLoading: false,
  isDemoData: false,

  loadCatches: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_catches');
      if (stored) {
        const parsed: Catch[] = JSON.parse(stored);
        if (parsed.length > 0) {
          set({ catches: parsed, isDemoData: false });
          return;
        }
      }
      // No stored catches — seed with demo data
      set({ catches: DEMO_CATCHES, isDemoData: true });
    } catch {
      set({ catches: DEMO_CATCHES, isDemoData: true });
    }
  },

  addCatch: async (c) => {
    const newCatch: Catch = {
      ...c,
      id: generateId(),
      date: new Date().toISOString(),
    };
    // If currently showing demo data, discard it before adding real catch
    const base = get().isDemoData ? [] : get().catches;
    const updated = [newCatch, ...base];
    set({ catches: updated, isDemoData: false });
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
