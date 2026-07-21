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
  deleteAccount: () => Promise<boolean>;
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
    } catch (error) {
      // Only a real auth rejection should sign the user out. A network
      // failure (offline at the water, flaky signal) falls back to the
      // cached account so the app keeps working.
      const status = error instanceof CastApiError ? error.status : 0;
      if (status === 401 || status === 403) {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, 'cast_user']);
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      try {
        const cached = await AsyncStorage.getItem('cast_user');
        if (cached) {
          set({ user: JSON.parse(cached), isAuthenticated: true, isLoading: false });
          return;
        }
      } catch {}
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

  // Permanently delete the account (Apple App Store guideline 5.1.1(v) requires
  // in-app account deletion for any app that supports account creation).
  // Deletes server-side first, then wipes every local trace of the user.
  deleteAccount: async () => {
    set({ authError: null });
    try {
      await castApi('/auth/me', { method: 'DELETE' });
    } catch (error) {
      const status = error instanceof CastApiError ? error.status : 0;
      // 401/403 (token already invalid) or 404 (no such route / already gone)
      // mean the server account is unreachable-by-auth or deleted — safe to wipe
      // locally. Anything else (5xx, or a network failure = status 0) is a real
      // failure: do NOT claim the account was deleted; let the user retry.
      if (![401, 403, 404].includes(status)) {
        set({ authError: errorMessage(error) });
        return false;
      }
    }
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, ...PERSONAL_DATA_KEYS]);
    useCatchStore.getState().clearMemory();
    useFriendsStore.getState().reset();
    set({ user: null, isAuthenticated: false, authError: null });
    return true;
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
