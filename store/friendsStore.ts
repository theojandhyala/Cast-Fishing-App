import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  DEMO_SESSION_PINS,
  DEMO_SOCIAL_POSTS,
  DEMO_SOCIAL_USERS,
  FriendSessionPin,
  ReactionType,
  SocialCatchPost,
} from '../data/socialData';

const FRIENDS_KEY = '@cast_friends_v2';

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
  isDemo?: boolean;
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
  isDemo?: boolean;
}

interface PersistedFriendsState {
  version: 2;
  friends: Friend[];
  requests: FriendRequest[];
  suggestedAnglers: Friend[];
  reactionsByPost: Record<string, ReactionType>;
}

export interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  suggestedAnglers: Friend[];
  feed: SocialCatchPost[];
  sessionPins: FriendSessionPin[];
  reactionsByPost: Record<string, ReactionType>;
  isHydrated: boolean;
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  sendRequest: (angler: Friend) => void;
  reactToCatch: (postId: string, reaction: ReactionType) => void;
  getActiveSessionPins: (at?: Date) => FriendSessionPin[];
  hydrate: () => Promise<void>;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

const toFriend = (user: (typeof DEMO_SOCIAL_USERS)[number]): Friend => ({
  id: user.id,
  name: user.name,
  handle: user.handle,
  country: user.country,
  countryCode: user.countryCode,
  level: user.level,
  catchCount: user.catchCount,
  topSpecies: user.topSpecies,
  streak: user.streak,
  avatarColor: user.avatarColor,
  isOnline: user.isOnline,
  lastActive: user.lastActive,
  mutualFriends: user.mutualFriends,
  isDemo: true,
});

const INITIAL_FRIENDS = DEMO_SOCIAL_USERS.slice(0, 5).map(toFriend);
const INITIAL_SUGGESTED = DEMO_SOCIAL_USERS.slice(5).map(toFriend);
const INITIAL_REQUESTS: FriendRequest[] = [
  { id: 'request-ravi', fromId: 'demo-ravi', fromName: 'Ravi Menon', fromLevel: 24, fromCatchCount: 143, avatarColor: '#2A9D8F', sentAt: '2h ago', type: 'incoming', countryCode: 'IN', isDemo: true },
];

const persist = async (state: FriendsState) => {
  const data: PersistedFriendsState = {
    version: 2,
    friends: state.friends,
    requests: state.requests,
    suggestedAnglers: state.suggestedAnglers,
    reactionsByPost: state.reactionsByPost,
  };
  try {
    await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(data));
  } catch {
    // Social actions still work in memory when storage is unavailable.
  }
};

export const selectActiveFriendSessionPins = (state: FriendsState): FriendSessionPin[] => {
  const friendIds = new Set(state.friends.map((friend) => friend.id));
  const now = Date.now();
  return state.sessionPins.filter(
    (pin) => friendIds.has(pin.friendId) && new Date(pin.expiresAt).getTime() > now,
  );
};

export const useFriendsStore = create<FriendsState>((set, get) => {
  const updateAndPersist = (updater: (state: FriendsState) => Partial<FriendsState>) => {
    set(updater);
    void persist(get());
  };

  return {
    friends: INITIAL_FRIENDS,
    requests: INITIAL_REQUESTS,
    suggestedAnglers: INITIAL_SUGGESTED,
    feed: DEMO_SOCIAL_POSTS,
    sessionPins: DEMO_SESSION_PINS,
    reactionsByPost: {},
    isHydrated: false,

    addFriend: (friend) => updateAndPersist((state) => ({
      friends: state.friends.some((item) => item.id === friend.id)
        ? state.friends
        : [...state.friends, friend],
      suggestedAnglers: state.suggestedAnglers.filter((item) => item.id !== friend.id),
    })),

    removeFriend: (id) => updateAndPersist((state) => ({
      friends: state.friends.filter((friend) => friend.id !== id),
    })),

    acceptRequest: (id) => updateAndPersist((state) => {
      const request = state.requests.find((item) => item.id === id && item.type === 'incoming');
      if (!request) return {};
      const known = DEMO_SOCIAL_USERS.find((user) => user.id === request.fromId);
      const friend: Friend = known ? toFriend(known) : {
        id: request.fromId,
        name: request.fromName,
        level: request.fromLevel,
        catchCount: request.fromCatchCount,
        topSpecies: 'Not set',
        streak: 0,
        avatarColor: request.avatarColor,
        isOnline: false,
        lastActive: 'Recently',
        mutualFriends: 0,
        countryCode: request.countryCode,
        isDemo: request.isDemo,
      };
      return {
        requests: state.requests.filter((item) => item.id !== id),
        friends: state.friends.some((item) => item.id === friend.id)
          ? state.friends
          : [...state.friends, friend],
        suggestedAnglers: state.suggestedAnglers.filter((item) => item.id !== friend.id),
      };
    }),

    declineRequest: (id) => updateAndPersist((state) => ({
      requests: state.requests.filter((request) => request.id !== id),
    })),

    sendRequest: (angler) => updateAndPersist((state) => {
      const requestId = `out_${angler.id}`;
      if (state.requests.some((request) => request.id === requestId)) return {};
      return {
        requests: [...state.requests, {
          id: requestId,
          fromId: angler.id,
          fromName: angler.name,
          fromLevel: angler.level,
          fromCatchCount: angler.catchCount,
          avatarColor: angler.avatarColor,
          sentAt: 'Just now',
          type: 'outgoing' as const,
          countryCode: angler.countryCode,
          isDemo: angler.isDemo,
        }],
        suggestedAnglers: state.suggestedAnglers.filter((item) => item.id !== angler.id),
      };
    }),

    reactToCatch: (postId, reaction) => updateAndPersist((state) => {
      if (!state.feed.some((post) => post.id === postId)) return {};
      const next = { ...state.reactionsByPost };
      if (next[postId] === reaction) delete next[postId];
      else next[postId] = reaction;
      return { reactionsByPost: next };
    }),

    getActiveSessionPins: (at = new Date()) => {
      const friendIds = new Set(get().friends.map((friend) => friend.id));
      const timestamp = at.getTime();
      return get().sessionPins.filter(
        (pin) => friendIds.has(pin.friendId) && new Date(pin.expiresAt).getTime() > timestamp,
      );
    },

    hydrate: async () => {
      try {
        const raw = await AsyncStorage.getItem(FRIENDS_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as Partial<PersistedFriendsState>;
          set({
            friends: Array.isArray(stored.friends) ? stored.friends : INITIAL_FRIENDS,
            requests: Array.isArray(stored.requests) ? stored.requests : INITIAL_REQUESTS,
            suggestedAnglers: Array.isArray(stored.suggestedAnglers) ? stored.suggestedAnglers : INITIAL_SUGGESTED,
            reactionsByPost: stored.reactionsByPost ?? {},
          });
        }
      } catch {
        // Keep safe demo defaults if stored data is malformed.
      } finally {
        set({ isHydrated: true });
      }
    },

    load: async () => get().hydrate(),
    save: async () => persist(get()),
  };
});
