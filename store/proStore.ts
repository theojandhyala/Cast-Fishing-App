import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cast_pro_usage';
const FREE_FISH_ID = 3;
const FREE_AI_ADVISOR = 5;

interface ProState {
  fishIdUses: number;       // uses remaining
  aiAdvisorUses: number;    // uses remaining
  loaded: boolean;
  load: () => Promise<void>;
  useFishId: () => boolean; // returns false if no uses left
  useAIAdvisor: () => boolean;
  resetFreeUses: () => void; // call when user goes Pro
}

export const useProStore = create<ProState>((set, get) => ({
  fishIdUses: FREE_FISH_ID,
  aiAdvisorUses: FREE_AI_ADVISOR,
  loaded: false,

  load: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { fishIdUses, aiAdvisorUses } = JSON.parse(stored);
        set({ fishIdUses: fishIdUses ?? FREE_FISH_ID, aiAdvisorUses: aiAdvisorUses ?? FREE_AI_ADVISOR, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch { set({ loaded: true }); }
  },

  useFishId: () => {
    const { fishIdUses } = get();
    if (fishIdUses <= 0) return false;
    const next = fishIdUses - 1;
    set({ fishIdUses: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ fishIdUses: next, aiAdvisorUses: get().aiAdvisorUses }));
    return true;
  },

  useAIAdvisor: () => {
    const { aiAdvisorUses } = get();
    if (aiAdvisorUses <= 0) return false;
    const next = aiAdvisorUses - 1;
    set({ aiAdvisorUses: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ fishIdUses: get().fishIdUses, aiAdvisorUses: next }));
    return true;
  },

  resetFreeUses: () => {
    set({ fishIdUses: 999, aiAdvisorUses: 999 });
  },
}));
