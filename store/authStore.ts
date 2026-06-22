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

// Stored per-account entry (password kept device-local)
interface AccountEntry {
  user: User;
  password: string;
}

const ACCOUNTS_KEY = 'cast_accounts_v2';
const SESSION_KEY = 'cast_session_v2';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  loadUser: () => Promise<void>;
  completeOnboarding: (name: string, favouriteSpecies: string[], extras?: {
    fishingExperience?: User['fishingExperience'];
    hasLicence?: boolean;
    preferredFishing?: User['preferredFishing'];
  }) => void;
  clearAuthError: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

async function getAccounts(): Promise<Record<string, AccountEntry>> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveAccounts(accounts: Record<string, AccountEntry>): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  clearAuthError: () => set({ authError: null }),

  loadUser: async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const user = JSON.parse(raw) as User;
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch {}
    set({ isLoading: false });
  },

  login: async (email: string, password: string) => {
    const key = email.trim().toLowerCase();
    const accounts = await getAccounts();
    const entry = accounts[key];

    if (!entry) {
      set({ authError: 'No account found with that email. Please sign up first.' });
      return false;
    }

    if (entry.password !== password) {
      set({ authError: 'Incorrect password. Please try again.' });
      return false;
    }

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(entry.user));
    set({ user: entry.user, isAuthenticated: true, authError: null });
    return true;
  },

  register: async (name: string, email: string, password: string) => {
    const key = email.trim().toLowerCase();
    const accounts = await getAccounts();

    if (accounts[key]) {
      set({ authError: 'An account with this email already exists. Please sign in.' });
      return false;
    }

    const user: User = {
      id: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isPro: false,
      xp: 0,
      level: 1,
      streak: 0,
      favouriteSpecies: [],
      joinedAt: new Date().toISOString(),
    };

    accounts[key] = { user, password };
    await saveAccounts(accounts);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true, authError: null });
    return true;
  },

  logout: () => {
    AsyncStorage.removeItem(SESSION_KEY);
    set({ user: null, isAuthenticated: false, authError: null });
  },

  updateUser: async (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    // Update both session and accounts registry
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const accounts = await getAccounts();
    const key = updated.email.toLowerCase();
    if (accounts[key]) {
      accounts[key].user = updated;
      await saveAccounts(accounts);
    }
    set({ user: updated });
  },

  completeOnboarding: (name: string, favouriteSpecies: string[], extras?: {
    fishingExperience?: User['fishingExperience'];
    hasLicence?: boolean;
    preferredFishing?: User['preferredFishing'];
  }) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, name, favouriteSpecies, xp: 100, ...extras };
    AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    // Update accounts registry too
    getAccounts().then((accounts) => {
      const key = updated.email.toLowerCase();
      if (accounts[key]) {
        accounts[key].user = updated;
        saveAccounts(accounts);
      }
    });
    set({ user: updated });
  },
}));
