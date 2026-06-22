import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_KEY, CastApiError, castApi } from '../services/castApi';
import { useCatchStore } from './catchStore';
import { useFriendsStore } from './friendsStore';

export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  proStatus?: string;
  proPlan?: 'monthly' | 'annual' | null;
  proCurrentPeriodEnd?: string | null;
  proCancelAtPeriodEnd?: boolean;
  xp: number;
  level: number;
  streak: number;
  catchCount?: number;
  topSpecies?: string;
  avatar?: string;
  avatarColor?: string;
  favouriteSpecies: string[];
  regionId?: string;
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
  hasCompletedOnboarding?: boolean;
}

interface AuthResponse { token: string; user: User }
interface UserResponse { user: User }

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  loadUser: () => Promise<void>;
  completeOnboarding: (name: string, favouriteSpecies: string[], extras?: { regionId?: string; fishingExperience?: User['fishingExperience']; hasLicence?: boolean; preferredFishing?: User['preferredFishing'] }) => Promise<void>;
}

const PERSONAL_DATA_KEYS = [
  'cast_user', 'cast_catches', '@cast_friends_v3', 'cast_head_to_heads_v2',
  '@cast_fish_id_history', '@cast_pending_scan_photo', '@cast_journal_entries',
  'cast-profile-v1', 'cast_active_session', 'cast_trips',
];

const errorMessage = (error: unknown) => error instanceof CastApiError
  ? error.message
  : 'CAST could not connect. Check your internet connection and try again.';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        await AsyncStorage.removeItem('cast_user');
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const { user } = await castApi<UserResponse>('/auth/me');
      await AsyncStorage.setItem('cast_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, authError: null });
    } catch {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, 'cast_user']);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ authError: null });
    try {
      const response = await castApi<AuthResponse>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email: email.trim(), password }),
      }, false);
      await AsyncStorage.multiSet([[AUTH_TOKEN_KEY, response.token], ['cast_user', JSON.stringify(response.user)]]);
      useCatchStore.getState().clearMemory();
      useFriendsStore.getState().reset();
      await useCatchStore.getState().loadCatches();
      set({ user: response.user, isAuthenticated: true });
      return true;
    } catch (error) {
      set({ authError: errorMessage(error) });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ authError: null });
    try {
      const response = await castApi<AuthResponse>('/auth/register', {
        method: 'POST', body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      }, false);
      await AsyncStorage.multiRemove(PERSONAL_DATA_KEYS);
      await AsyncStorage.multiSet([[AUTH_TOKEN_KEY, response.token], ['cast_user', JSON.stringify(response.user)]]);
      useCatchStore.getState().clearMemory();
      useFriendsStore.getState().reset();
      set({ user: response.user, isAuthenticated: true });
      return true;
    } catch (error) {
      set({ authError: errorMessage(error) });
      return false;
    }
  },

  logout: async () => {
    try { await castApi('/auth/logout', { method: 'POST' }); } catch {}
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, 'cast_user']);
    useCatchStore.getState().clearMemory();
    useFriendsStore.getState().reset();
    set({ user: null, isAuthenticated: false, authError: null });
  },

  updateUser: async (updates) => {
    const current = get().user;
    if (!current) return;
    set({ authError: null });
    const optimistic = { ...current, ...updates };
    set({ user: optimistic });
    await AsyncStorage.setItem('cast_user', JSON.stringify(optimistic));
    if (updates.name || updates.favouriteSpecies || updates.regionId || updates.hasCompletedOnboarding !== undefined) {
      try {
        const { user } = await castApi<UserResponse>('/profile', {
          method: 'PATCH', body: JSON.stringify({
            name: optimistic.name,
            favouriteSpecies: optimistic.favouriteSpecies,
            regionId: optimistic.regionId,
            hasCompletedOnboarding: optimistic.hasCompletedOnboarding,
          }),
        });
        await AsyncStorage.setItem('cast_user', JSON.stringify({ ...optimistic, ...user }));
        set({ user: { ...optimistic, ...user }, authError: null });
      } catch (error) {
        set({ user: current, authError: errorMessage(error) });
        await AsyncStorage.setItem('cast_user', JSON.stringify(current));
      }
    }
  },

  completeOnboarding: async (name, favouriteSpecies, extras) => {
    await get().updateUser({
      name,
      favouriteSpecies,
      regionId: extras?.regionId,
      xp: 0,
      level: 1,
      streak: 0,
      hasCompletedOnboarding: true,
      ...extras,
    });
  },
}));
