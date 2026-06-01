import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ukSpots, FishingSpot } from '../data/ukSpots';

interface SpotState {
  spots: FishingSpot[];
  savedSpotIds: string[];
  saveSpot: (id: string) => void;
  unsaveSpot: (id: string) => void;
  isSaved: (id: string) => boolean;
  getSavedSpots: () => FishingSpot[];
  loadSaved: () => Promise<void>;
}

export const useSpotStore = create<SpotState>((set, get) => ({
  spots: ukSpots,
  savedSpotIds: [],

  loadSaved: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_saved_spots');
      if (stored) {
        set({ savedSpotIds: JSON.parse(stored) });
      }
    } catch {
      // use defaults
    }
  },

  saveSpot: async (id) => {
    const updated = [...get().savedSpotIds, id];
    set({ savedSpotIds: updated });
    await AsyncStorage.setItem('cast_saved_spots', JSON.stringify(updated));
  },

  unsaveSpot: async (id) => {
    const updated = get().savedSpotIds.filter((s) => s !== id);
    set({ savedSpotIds: updated });
    await AsyncStorage.setItem('cast_saved_spots', JSON.stringify(updated));
  },

  isSaved: (id) => get().savedSpotIds.includes(id),

  getSavedSpots: () => {
    const { spots, savedSpotIds } = get();
    return spots.filter((s) => savedSpotIds.includes(s.id));
  },
}));
