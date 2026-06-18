import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FRIENDS_KEY = '@cast_friends';

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
}

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  suggestedAnglers: Friend[];
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  sendRequest: (angler: Friend) => void;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Jake Morrison',
    level: 8,
    catchCount: 142,
    topSpecies: 'Carp',
    streak: 5,
    avatarColor: '#F97316',
    isOnline: true,
    lastActive: 'Now',
    mutualFriends: 3,
  },
  {
    id: 'f2',
    name: 'Emma Clarke',
    level: 5,
    catchCount: 67,
    topSpecies: 'Perch',
    streak: 2,
    avatarColor: '#EC4899',
    isOnline: false,
    lastActive: '2h ago',
    mutualFriends: 1,
  },
  {
    id: 'f3',
    name: 'Tom Fisher',
    level: 12,
    catchCount: 389,
    topSpecies: 'Pike',
    streak: 14,
    avatarColor: '#8B5CF6',
    isOnline: true,
    lastActive: 'Now',
    mutualFriends: 5,
  },
];

const INITIAL_REQUESTS: FriendRequest[] = [
  {
    id: 'req1',
    fromId: 'u10',
    fromName: 'Ryan Hughes',
    fromLevel: 6,
    fromCatchCount: 88,
    avatarColor: '#22C55E',
    sentAt: '1d ago',
    type: 'incoming',
  },
  {
    id: 'req2',
    fromId: 'u11',
    fromName: 'Sophia Marsh',
    fromLevel: 3,
    fromCatchCount: 24,
    avatarColor: '#3B82F6',
    sentAt: '3d ago',
    type: 'incoming',
  },
];

const INITIAL_SUGGESTED: Friend[] = [
  {
    id: 's1',
    name: 'Dan Brookes',
    level: 7,
    catchCount: 110,
    topSpecies: 'Trout',
    streak: 3,
    avatarColor: '#3B82F6',
    isOnline: false,
    lastActive: '5h ago',
    mutualFriends: 2,
  },
  {
    id: 's2',
    name: 'Lucy Wade',
    level: 4,
    catchCount: 45,
    topSpecies: 'Bass',
    streak: 1,
    avatarColor: '#EC4899',
    isOnline: true,
    lastActive: 'Now',
    mutualFriends: 1,
  },
  {
    id: 's3',
    name: 'Marcus Bell',
    level: 10,
    catchCount: 253,
    topSpecies: 'Pike',
    streak: 9,
    avatarColor: '#F97316',
    isOnline: false,
    lastActive: '1h ago',
    mutualFriends: 4,
  },
  {
    id: 's4',
    name: 'Chloe Davis',
    level: 3,
    catchCount: 18,
    topSpecies: 'Perch',
    streak: 0,
    avatarColor: '#22C55E',
    isOnline: false,
    lastActive: '2d ago',
    mutualFriends: 0,
  },
];

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: INITIAL_FRIENDS,
  requests: INITIAL_REQUESTS,
  suggestedAnglers: INITIAL_SUGGESTED,

  addFriend: (friend) => {
    set((s) => ({ friends: [...s.friends, friend] }));
    get().save();
  },

  removeFriend: (id) => {
    set((s) => ({ friends: s.friends.filter((f) => f.id !== id) }));
    get().save();
  },

  acceptRequest: (id) => {
    const req = get().requests.find((r) => r.id === id);
    if (!req) return;
    const newFriend: Friend = {
      id: req.fromId,
      name: req.fromName,
      level: req.fromLevel,
      catchCount: req.fromCatchCount,
      topSpecies: 'Carp',
      streak: 0,
      avatarColor: req.avatarColor,
      isOnline: false,
      lastActive: 'Just now',
      mutualFriends: 0,
    };
    set((s) => ({
      requests: s.requests.filter((r) => r.id !== id),
      friends: [...s.friends, newFriend],
    }));
    get().save();
  },

  declineRequest: (id) => {
    set((s) => ({ requests: s.requests.filter((r) => r.id !== id) }));
    get().save();
  },

  sendRequest: (angler) => {
    const outgoing: FriendRequest = {
      id: `out_${angler.id}`,
      fromId: angler.id,
      fromName: angler.name,
      fromLevel: angler.level,
      fromCatchCount: angler.catchCount,
      avatarColor: angler.avatarColor,
      sentAt: 'Just now',
      type: 'outgoing',
    };
    set((s) => ({
      requests: [...s.requests, outgoing],
      suggestedAnglers: s.suggestedAnglers.filter((a) => a.id !== angler.id),
    }));
    get().save();
  },

  load: async () => {
    try {
      const stored = await AsyncStorage.getItem(FRIENDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          friends: parsed.friends ?? INITIAL_FRIENDS,
          requests: parsed.requests ?? INITIAL_REQUESTS,
          suggestedAnglers: parsed.suggestedAnglers ?? INITIAL_SUGGESTED,
        });
      }
    } catch {}
  },

  save: async () => {
    try {
      const { friends, requests, suggestedAnglers } = get();
      await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify({ friends, requests, suggestedAnglers }));
    } catch {}
  },
}));
