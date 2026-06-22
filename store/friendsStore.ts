import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { FriendSessionPin, ReactionType, SocialCatchPost } from '../data/socialData';
import { CastApiError, castApi } from '../services/castApi';

const FRIENDS_KEY = '@cast_friends_v4';

const cacheKey = async () => {
  try {
    const user = JSON.parse(await AsyncStorage.getItem('cast_user') || '{}');
    return `${FRIENDS_KEY}:${user.id || 'signed-out'}`;
  } catch { return `${FRIENDS_KEY}:signed-out`; }
};

export interface Friend {
  id: string;
  name: string;
  level: number;
  catchCount: number;
  topSpecies: string;
  streak: number;
  avatarColor: string;
  isOnline: boolean;
  lastActive: string;
  mutualFriends: number;
  handle?: string;
  country?: string;
  countryCode?: string;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromLevel: number;
  fromCatchCount: number;
  avatarColor: string;
  sentAt: string;
  type: 'incoming' | 'outgoing';
  countryCode?: string;
}

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  suggestedAnglers: Friend[];
  feed: SocialCatchPost[];
  sessionPins: FriendSessionPin[];
  reactionsByPost: Record<string, ReactionType>;
  isHydrated: boolean;
  isSearching: boolean;
  lastError: string | null;
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => Promise<void>;
  acceptRequest: (id: string) => Promise<void>;
  declineRequest: (id: string) => Promise<void>;
  sendRequest: (angler: Friend) => Promise<boolean>;
  searchAnglers: (query: string) => Promise<void>;
  reactToCatch: (postId: string, reaction: ReactionType) => void;
  getActiveSessionPins: (at?: Date) => FriendSessionPin[];
  hydrate: () => Promise<void>;
  load: () => Promise<void>;
  save: () => Promise<void>;
  reset: () => void;
}

const messageFor = (error: unknown) => error instanceof CastApiError ? error.message : 'Could not reach CAST right now.';

const persist = async (state: FriendsState) => {
  try {
    await AsyncStorage.setItem(await cacheKey(), JSON.stringify({
      friends: state.friends,
      requests: state.requests,
      reactionsByPost: state.reactionsByPost,
    }));
  } catch {}
};

export const selectActiveFriendSessionPins = (state: FriendsState): FriendSessionPin[] => {
  const friendIds = new Set(state.friends.map((friend) => friend.id));
  const now = Date.now();
  return state.sessionPins.filter((pin) => friendIds.has(pin.friendId) && new Date(pin.expiresAt).getTime() > now);
};

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  requests: [],
  suggestedAnglers: [],
  feed: [],
  sessionPins: [],
  reactionsByPost: {},
  isHydrated: false,
  isSearching: false,
  lastError: null,

  addFriend: (friend) => set((state) => ({ friends: state.friends.some((item) => item.id === friend.id) ? state.friends : [...state.friends, friend] })),

  removeFriend: async (id) => {
    try {
      await castApi(`/friends/${encodeURIComponent(id)}`, { method: 'DELETE' });
      set((state) => ({ friends: state.friends.filter((friend) => friend.id !== id), lastError: null }));
      await persist(get());
    } catch (error) { set({ lastError: messageFor(error) }); }
  },

  acceptRequest: async (id) => {
    try {
      await castApi(`/friends/requests/${encodeURIComponent(id)}/accept`, { method: 'POST' });
      await get().hydrate();
    } catch (error) { set({ lastError: messageFor(error) }); }
  },

  declineRequest: async (id) => {
    try {
      await castApi(`/friends/requests/${encodeURIComponent(id)}/decline`, { method: 'POST' });
      set((state) => ({ requests: state.requests.filter((request) => request.id !== id), lastError: null }));
      await persist(get());
    } catch (error) { set({ lastError: messageFor(error) }); }
  },

  sendRequest: async (angler) => {
    try {
      await castApi('/friends/request', { method: 'POST', body: JSON.stringify({ username: angler.name }) });
      set((state) => ({ suggestedAnglers: state.suggestedAnglers.filter((item) => item.id !== angler.id), lastError: null }));
      await get().hydrate();
      return true;
    } catch (error) {
      set({ lastError: messageFor(error) });
      return false;
    }
  },

  searchAnglers: async (query) => {
    const value = query.trim().replace(/^@/, '');
    if (value.length < 2) { set({ suggestedAnglers: [], lastError: null }); return; }
    set({ isSearching: true, lastError: null });
    try {
      const { users } = await castApi<{ users: Friend[] }>(`/friends/search?q=${encodeURIComponent(value)}`);
      set({ suggestedAnglers: users, isSearching: false });
    } catch (error) { set({ suggestedAnglers: [], isSearching: false, lastError: messageFor(error) }); }
  },

  reactToCatch: (postId, reaction) => set((state) => {
    const next = { ...state.reactionsByPost };
    if (next[postId] === reaction) delete next[postId]; else next[postId] = reaction;
    return { reactionsByPost: next };
  }),

  getActiveSessionPins: (at = new Date()) => {
    const friendIds = new Set(get().friends.map((friend) => friend.id));
    return get().sessionPins.filter((pin) => friendIds.has(pin.friendId) && new Date(pin.expiresAt).getTime() > at.getTime());
  },

  hydrate: async () => {
    try {
      const [{ friends }, { requests }] = await Promise.all([
        castApi<{ friends: Friend[] }>('/friends'),
        castApi<{ requests: FriendRequest[] }>('/friends/requests'),
      ]);
      set({ friends, requests, isHydrated: true, lastError: null });
      await persist(get());
    } catch (error) {
      try {
        const cached = JSON.parse(await AsyncStorage.getItem(await cacheKey()) || '{}');
        set({ friends: cached.friends || [], requests: cached.requests || [], isHydrated: true, lastError: messageFor(error) });
      } catch { set({ friends: [], requests: [], isHydrated: true, lastError: messageFor(error) }); }
    }
  },

  load: async () => get().hydrate(),
  save: async () => persist(get()),
  reset: () => set({ friends: [], requests: [], suggestedAnglers: [], feed: [], sessionPins: [], reactionsByPost: {}, isHydrated: false, isSearching: false, lastError: null }),
}));
