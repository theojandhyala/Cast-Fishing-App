import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SpotState {
  savedSpotIds: string[];
  toggleSavedSpot: (id: string) => void;
  isSpotSaved: (id: string) => boolean;
}

export const useSpotStore = create<SpotState>()(
  persist(
    (set, get) => ({
      savedSpotIds: [],
      toggleSavedSpot: (id) => set((state) => ({
        savedSpotIds: state.savedSpotIds.includes(id)
          ? state.savedSpotIds.filter((savedId) => savedId !== id)
          : [...state.savedSpotIds, id],
      })),
      isSpotSaved: (id) => get().savedSpotIds.includes(id),
    }),
    {
      name: 'cast_saved_spots_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ savedSpotIds: state.savedSpotIds }),
    },
  ),
);
