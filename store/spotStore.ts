import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ukSpots, FishingSpot } from '../data/ukSpots';

interface SpotState {
  spots: FishingSpot[];
  savedSpotIds: string[];
  spotNotes: Record<string, string>;
  saveSpot: (id: string) => void;
  unsaveSpot: (id: string) => void;
  isSaved: (id: string) => boolean;
  getSavedSpots: () => FishingSpot[];
  loadSaved: () => Promise<void>;
  setSpotNote: (spotId: string, note: string) => Promise<void>;
  getSpotNote: (spotId: string) => string;
}

export const useSpotStore = create<SpotState>((set, get) => ({
  spots: ukSpots,
  savedSpotIds: [],
  spotNotes: {},

  loadSaved: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_saved_spots');
      if (stored) {
        set({ savedSpotIds: JSON.parse(stored) });
      }
      const notesStored = await AsyncStorage.getItem('cast_spot_notes_all');
      if (notesStored) {
        set({ spotNotes: JSON.parse(notesStored) });
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

  setSpotNote: async (spotId, note) => {
    const updated = { ...get().spotNotes, [spotId]: note };
    set({ spotNotes: updated });
    await AsyncStorage.setItem('cast_spot_notes_all', JSON.stringify(updated));
    // Also store per-spot key for direct access
    await AsyncStorage.setItem(`@cast_spot_notes_${spotId}`, note);
  },

  getSpotNote: (spotId) => get().spotNotes[spotId] ?? '',

  getSavedSpots: () => {
    const { spots, savedSpotIds } = get();
    return spots.filter((s) => savedSpotIds.includes(s.id));
  },
}));
