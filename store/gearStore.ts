import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GearItem, DEFAULT_GEAR } from '../data/gearCategories';

interface GearState {
  gear: GearItem[];
  currentSetup: { rodId: string | null; reelId: string | null; lineId: string | null };
  addItem: (item: Omit<GearItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<GearItem>) => void;
  toggleWishlist: (id: string) => void;
  setCurrentSetup: (setup: Partial<GearState['currentSetup']>) => void;
  loadGear: () => Promise<void>;
  getTotalValue: () => number;
  getWishlistValue: () => number;
}

const generateId = () => 'gear_' + Math.random().toString(36).substr(2, 9);

export const useGearStore = create<GearState>((set, get) => ({
  gear: DEFAULT_GEAR,
  currentSetup: { rodId: 'gear1', reelId: 'gear2', lineId: 'gear3' },

  loadGear: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_gear');
      if (stored) set(JSON.parse(stored));
    } catch {}
  },

  addItem: async (item) => {
    const newItem: GearItem = { ...item, id: generateId() };
    const updated = [...get().gear, newItem];
    set({ gear: updated });
    await AsyncStorage.setItem('cast_gear', JSON.stringify({ gear: updated, currentSetup: get().currentSetup }));
  },

  removeItem: async (id) => {
    const updated = get().gear.filter(g => g.id !== id);
    set({ gear: updated });
    await AsyncStorage.setItem('cast_gear', JSON.stringify({ gear: updated, currentSetup: get().currentSetup }));
  },

  updateItem: async (id, updates) => {
    const updated = get().gear.map(g => g.id === id ? { ...g, ...updates } : g);
    set({ gear: updated });
    await AsyncStorage.setItem('cast_gear', JSON.stringify({ gear: updated, currentSetup: get().currentSetup }));
  },

  toggleWishlist: async (id) => {
    const updated = get().gear.map(g => g.id === id ? { ...g, isWishlist: !g.isWishlist } : g);
    set({ gear: updated });
    await AsyncStorage.setItem('cast_gear', JSON.stringify({ gear: updated, currentSetup: get().currentSetup }));
  },

  setCurrentSetup: async (setup) => {
    const updated = { ...get().currentSetup, ...setup };
    set({ currentSetup: updated });
    await AsyncStorage.setItem('cast_gear', JSON.stringify({ gear: get().gear, currentSetup: updated }));
  },

  getTotalValue: () => {
    return get().gear.filter(g => !g.isWishlist).reduce((sum, g) => sum + g.estimatedValue, 0);
  },

  getWishlistValue: () => {
    return get().gear.filter(g => g.isWishlist).reduce((sum, g) => sum + g.estimatedValue, 0);
  },
}));
