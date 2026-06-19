import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
  avatarColor?: string;
  favouriteSpecies: string[];
  joinedAt: string;
  fishingExperience?: 'beginner' | 'intermediate' | 'expert';
  hasLicence?: boolean;
  preferredFishing?: 'freshwater' | 'saltwater' | 'both';
  isPublicProfile?: boolean;
  sharesCatchesPublicly?: boolean;
  distanceUnit?: 'km' | 'miles';
  weightUnit?: 'kg' | 'lbs';
  tempUnit?: 'celsius' | 'fahrenheit';
  defaultLocation?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoUser: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  loadUser: () => Promise<void>;
  completeOnboarding: (name: string, favouriteSpecies: string[]) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Guest Angler',
  email: '',
  isPro: false,
  xp: 2340,
  level: 4,
  streak: 3,
  favouriteSpecies: ['Common Carp', 'Northern Pike', 'Perch'],
  joinedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  fishingExperience: 'intermediate',
  hasLicence: true,
  preferredFishing: 'freshwater',
  isPublicProfile: true,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isDemoUser: false,

  loadUser: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_user');
      if (stored) {
        const user = JSON.parse(stored);
        set({ user, isAuthenticated: true, isLoading: false, isDemoUser: false });
      } else {
        // No stored user — show demo state without persisting
        set({ user: DEMO_USER, isAuthenticated: false, isLoading: false, isDemoUser: true });
      }
    } catch {
      set({ user: DEMO_USER, isAuthenticated: false, isLoading: false, isDemoUser: true });
    }
  },

  login: async (email: string, _password: string) => {
    try {
      const stored = await AsyncStorage.getItem('cast_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.email === email) {
          set({ user, isAuthenticated: true, isDemoUser: false });
          return true;
        }
      }
      // Create demo user if not found
      const user: User = {
        id: generateId(),
        name: email.split('@')[0],
        email,
        isPro: false,
        xp: 0,
        level: 1,
        streak: 0,
        favouriteSpecies: [],
        joinedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('cast_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isDemoUser: false });
      return true;
    } catch {
      return false;
    }
  },

  register: async (name: string, email: string, _password: string) => {
    try {
      const user: User = {
        id: generateId(),
        name,
        email,
        isPro: false,
        xp: 0,
        level: 1,
        streak: 0,
        favouriteSpecies: [],
        joinedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('cast_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isDemoUser: false });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    AsyncStorage.removeItem('cast_user');
    set({ user: DEMO_USER, isAuthenticated: false, isDemoUser: true });
  },

  updateUser: async (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem('cast_user', JSON.stringify(updated));
    set({ user: updated });
  },

  completeOnboarding: (name: string, favouriteSpecies: string[], extras?: { fishingExperience?: User['fishingExperience']; hasLicence?: boolean; preferredFishing?: User['preferredFishing'] }) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, name, favouriteSpecies, xp: 100, ...extras };
    AsyncStorage.setItem('cast_user', JSON.stringify(updated));
    set({ user: updated });
  },
}));
