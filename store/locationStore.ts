import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ManualLocation {
  name: string;        // display name e.g. "Port de Sóller, Mallorca"
  query: string;       // query for weather API e.g. "Soller"
  latitude?: number;
  longitude?: number;
}

interface LocationStore {
  location: ManualLocation | null;
  setLocation: (loc: ManualLocation) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (loc) => set({ location: loc }),
      clearLocation: () => set({ location: null }),
    }),
    {
      name: 'cast_manual_location',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
