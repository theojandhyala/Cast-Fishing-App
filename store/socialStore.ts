import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCIAL_KEY = '@cast_social';

export interface FriendActivity {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUri: string | null;
  avatarColor: string;
  type: 'catch' | 'level_up' | 'badge' | 'session_start' | 'session_end' | 'pb';
  timestamp: string; // ISO
  // catch-specific
  species?: string;
  weightKg?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  location?: string;
  photoUri?: string | null;
  // level/badge-specific
  level?: number;
  badgeName?: string;
  // reactions
  reactions: Record<string, string[]>; // reactionType → [userId, ...]
}

interface SocialState {
  myActivities: FriendActivity[];
  feed: FriendActivity[];
  seeded: boolean;
  postActivity: (activity: Omit<FriendActivity, 'id' | 'userId' | 'timestamp' | 'reactions'>) => void;
  addReaction: (activityId: string, reactionType: string, myUserId: string) => void;
  removeReaction: (activityId: string, reactionType: string, myUserId: string) => void;
  seedDemoFriends: () => void;
  clearFeed: () => void;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}
function daysAgo(d: number, h = 0): string {
  return new Date(Date.now() - (d * 24 + h) * 60 * 60 * 1000).toISOString();
}

const DEMO_ACTIVITIES: FriendActivity[] = [
  // Jake_Angler — UK carp/pike
  {
    id: 'da1',
    userId: 'jake_angler',
    username: 'Jake_Angler',
    displayName: 'Jake Angler',
    avatarUri: null,
    avatarColor: '#F97316',
    type: 'catch',
    timestamp: hoursAgo(1),
    species: 'Common Carp',
    weightKg: 12.4,
    rarity: 'epic',
    location: 'Redmire Pool, Herefordshire',
    photoUri: null,
    reactions: { NICE: ['user_demo1', 'user_demo2'], BEAST: ['user_demo3'] },
  },
  {
    id: 'da2',
    userId: 'jake_angler',
    username: 'Jake_Angler',
    displayName: 'Jake Angler',
    avatarUri: null,
    avatarColor: '#F97316',
    type: 'session_start',
    timestamp: hoursAgo(3),
    location: 'Redmire Pool, Herefordshire',
    reactions: {},
  },
  {
    id: 'da3',
    userId: 'jake_angler',
    username: 'Jake_Angler',
    displayName: 'Jake Angler',
    avatarUri: null,
    avatarColor: '#F97316',
    type: 'catch',
    timestamp: daysAgo(1, 4),
    species: 'Pike',
    weightKg: 8.2,
    rarity: 'rare',
    location: 'River Severn, Worcestershire',
    photoUri: null,
    reactions: { NICE: ['user_demo1'] },
  },
  {
    id: 'da4',
    userId: 'jake_angler',
    username: 'Jake_Angler',
    displayName: 'Jake Angler',
    avatarUri: null,
    avatarColor: '#F97316',
    type: 'level_up',
    timestamp: daysAgo(3),
    level: 9,
    reactions: { NICE: ['user_demo2', 'user_demo3'], SICK: ['user_demo1'] },
  },

  // SalmonSue — Scotland
  {
    id: 'da5',
    userId: 'salmon_sue',
    username: 'SalmonSue',
    displayName: 'Sue MacAlister',
    avatarUri: null,
    avatarColor: '#EC4899',
    type: 'catch',
    timestamp: hoursAgo(5),
    species: 'Atlantic Salmon',
    weightKg: 6.8,
    rarity: 'rare',
    location: 'River Tay, Perthshire',
    photoUri: null,
    reactions: { NICE: ['user_demo1', 'user_demo3'] },
  },
  {
    id: 'da6',
    userId: 'salmon_sue',
    username: 'SalmonSue',
    displayName: 'Sue MacAlister',
    avatarUri: null,
    avatarColor: '#EC4899',
    type: 'pb',
    timestamp: hoursAgo(5),
    species: 'Atlantic Salmon',
    weightKg: 6.8,
    location: 'River Tay, Perthshire',
    reactions: { BEAST: ['user_demo1', 'user_demo2', 'user_demo3'], PB: ['user_demo1'] },
  },
  {
    id: 'da7',
    userId: 'salmon_sue',
    username: 'SalmonSue',
    displayName: 'Sue MacAlister',
    avatarUri: null,
    avatarColor: '#EC4899',
    type: 'catch',
    timestamp: daysAgo(2, 6),
    species: 'Brown Trout',
    weightKg: 1.9,
    rarity: 'uncommon',
    location: 'Loch Lomond, Scotland',
    photoUri: null,
    reactions: { NICE: ['user_demo2'] },
  },

  // BassBro_TX — Texas
  {
    id: 'da8',
    userId: 'bassbro_tx',
    username: 'BassBro_TX',
    displayName: 'Tyler Bass',
    avatarUri: null,
    avatarColor: '#22C55E',
    type: 'catch',
    timestamp: hoursAgo(2),
    species: 'Largemouth Bass',
    weightKg: 3.1,
    rarity: 'uncommon',
    location: 'Lake Fork, Texas',
    photoUri: null,
    reactions: { NICE: ['user_demo1'] },
  },
  {
    id: 'da9',
    userId: 'bassbro_tx',
    username: 'BassBro_TX',
    displayName: 'Tyler Bass',
    avatarUri: null,
    avatarColor: '#22C55E',
    type: 'catch',
    timestamp: daysAgo(1, 2),
    species: 'Largemouth Bass',
    weightKg: 4.7,
    rarity: 'epic',
    location: 'Sam Rayburn Reservoir, Texas',
    photoUri: null,
    reactions: { BEAST: ['user_demo1', 'user_demo3'] },
  },
  {
    id: 'da10',
    userId: 'bassbro_tx',
    username: 'BassBro_TX',
    displayName: 'Tyler Bass',
    avatarUri: null,
    avatarColor: '#22C55E',
    type: 'catch',
    timestamp: daysAgo(1),
    species: 'Largemouth Bass',
    weightKg: 5.9,
    rarity: 'legendary',
    location: 'Lake Fork, Texas',
    photoUri: null,
    reactions: { BEAST: ['user_demo1', 'user_demo2', 'user_demo3'], NICE: ['user_demo1'], PB: ['user_demo2', 'user_demo3'] },
  },
  {
    id: 'da11',
    userId: 'bassbro_tx',
    username: 'BassBro_TX',
    displayName: 'Tyler Bass',
    avatarUri: null,
    avatarColor: '#22C55E',
    type: 'level_up',
    timestamp: daysAgo(2),
    level: 7,
    reactions: { NICE: ['user_demo1'] },
  },

  // CoastalCraig — Cornwall
  {
    id: 'da12',
    userId: 'coastal_craig',
    username: 'CoastalCraig',
    displayName: 'Craig Penrose',
    avatarUri: null,
    avatarColor: '#3B82F6',
    type: 'catch',
    timestamp: hoursAgo(4),
    species: 'Bass',
    weightKg: 2.3,
    rarity: 'uncommon',
    location: 'Sennen Cove, Cornwall',
    photoUri: null,
    reactions: { NICE: ['user_demo2'] },
  },
  {
    id: 'da13',
    userId: 'coastal_craig',
    username: 'CoastalCraig',
    displayName: 'Craig Penrose',
    avatarUri: null,
    avatarColor: '#3B82F6',
    type: 'catch',
    timestamp: daysAgo(1, 8),
    species: 'Mackerel',
    weightKg: 0.6,
    rarity: 'common',
    location: 'Falmouth Bay, Cornwall',
    photoUri: null,
    reactions: {},
  },
  {
    id: 'da14',
    userId: 'coastal_craig',
    username: 'CoastalCraig',
    displayName: 'Craig Penrose',
    avatarUri: null,
    avatarColor: '#3B82F6',
    type: 'session_start',
    timestamp: hoursAgo(4),
    location: 'Sennen Cove, Cornwall',
    reactions: {},
  },
  {
    id: 'da15',
    userId: 'coastal_craig',
    username: 'CoastalCraig',
    displayName: 'Craig Penrose',
    avatarUri: null,
    avatarColor: '#3B82F6',
    type: 'catch',
    timestamp: daysAgo(4, 2),
    species: 'Pollock',
    weightKg: 1.8,
    rarity: 'uncommon',
    location: 'Lizard Point, Cornwall',
    photoUri: null,
    reactions: { NICE: ['user_demo1'] },
  },

  // OzzieMatt — Queensland
  {
    id: 'da16',
    userId: 'ozzie_matt',
    username: 'OzzieMatt',
    displayName: 'Matt Callaghan',
    avatarUri: null,
    avatarColor: '#F59E0B',
    type: 'catch',
    timestamp: hoursAgo(6),
    species: 'Barramundi',
    weightKg: 7.4,
    rarity: 'rare',
    location: 'Cairns Estuary, Queensland',
    photoUri: null,
    reactions: { NICE: ['user_demo1', 'user_demo3'], BEAST: ['user_demo2'] },
  },
  {
    id: 'da17',
    userId: 'ozzie_matt',
    username: 'OzzieMatt',
    displayName: 'Matt Callaghan',
    avatarUri: null,
    avatarColor: '#F59E0B',
    type: 'catch',
    timestamp: daysAgo(2, 10),
    species: 'Barramundi',
    weightKg: 9.1,
    rarity: 'legendary',
    location: 'Lake Tinaroo, Queensland',
    photoUri: null,
    reactions: { BEAST: ['user_demo1', 'user_demo2', 'user_demo3'], PB: ['user_demo1', 'user_demo3'] },
  },
  {
    id: 'da18',
    userId: 'ozzie_matt',
    username: 'OzzieMatt',
    displayName: 'Matt Callaghan',
    avatarUri: null,
    avatarColor: '#F59E0B',
    type: 'badge',
    timestamp: daysAgo(3),
    badgeName: 'Barra Hunter',
    reactions: { NICE: ['user_demo2'] },
  },
  {
    id: 'da19',
    userId: 'ozzie_matt',
    username: 'OzzieMatt',
    displayName: 'Matt Callaghan',
    avatarUri: null,
    avatarColor: '#F59E0B',
    type: 'catch',
    timestamp: daysAgo(5),
    species: 'Mangrove Jack',
    weightKg: 2.8,
    rarity: 'uncommon',
    location: 'Daintree River, Queensland',
    photoUri: null,
    reactions: { NICE: ['user_demo1'] },
  },

  // FlyFisherFinn — Norway
  {
    id: 'da20',
    userId: 'flyfisher_finn',
    username: 'FlyFisherFinn',
    displayName: 'Finn Andersen',
    avatarUri: null,
    avatarColor: '#8B5CF6',
    type: 'catch',
    timestamp: hoursAgo(8),
    species: 'Atlantic Salmon',
    weightKg: 11.3,
    rarity: 'epic',
    location: 'River Gaula, Norway',
    photoUri: null,
    reactions: { BEAST: ['user_demo1', 'user_demo2'], NICE: ['user_demo3'] },
  },
  {
    id: 'da21',
    userId: 'flyfisher_finn',
    username: 'FlyFisherFinn',
    displayName: 'Finn Andersen',
    avatarUri: null,
    avatarColor: '#8B5CF6',
    type: 'session_start',
    timestamp: hoursAgo(10),
    location: 'River Gaula, Norway',
    reactions: {},
  },
  {
    id: 'da22',
    userId: 'flyfisher_finn',
    username: 'FlyFisherFinn',
    displayName: 'Finn Andersen',
    avatarUri: null,
    avatarColor: '#8B5CF6',
    type: 'catch',
    timestamp: daysAgo(3, 5),
    species: 'Sea Trout',
    weightKg: 4.6,
    rarity: 'rare',
    location: 'River Alta, Norway',
    photoUri: null,
    reactions: { NICE: ['user_demo2'] },
  },
  {
    id: 'da23',
    userId: 'flyfisher_finn',
    username: 'FlyFisherFinn',
    displayName: 'Finn Andersen',
    avatarUri: null,
    avatarColor: '#8B5CF6',
    type: 'level_up',
    timestamp: daysAgo(5),
    level: 11,
    reactions: { NICE: ['user_demo1', 'user_demo2'] },
  },

  // CarpKing_Dave — Netherlands
  {
    id: 'da24',
    userId: 'carpking_dave',
    username: 'CarpKing_Dave',
    displayName: 'Dave van der Berg',
    avatarUri: null,
    avatarColor: '#14B8A6',
    type: 'catch',
    timestamp: hoursAgo(12),
    species: 'Mirror Carp',
    weightKg: 16.2,
    rarity: 'legendary',
    location: 'Biesbosch, Netherlands',
    photoUri: null,
    reactions: { BEAST: ['user_demo1', 'user_demo2', 'user_demo3'], PB: ['user_demo1', 'user_demo2'] },
  },
  {
    id: 'da25',
    userId: 'carpking_dave',
    username: 'CarpKing_Dave',
    displayName: 'Dave van der Berg',
    avatarUri: null,
    avatarColor: '#14B8A6',
    type: 'pb',
    timestamp: hoursAgo(12),
    species: 'Mirror Carp',
    weightKg: 16.2,
    location: 'Biesbosch, Netherlands',
    reactions: { BEAST: ['user_demo1', 'user_demo2'], NICE: ['user_demo3'] },
  },
  {
    id: 'da26',
    userId: 'carpking_dave',
    username: 'CarpKing_Dave',
    displayName: 'Dave van der Berg',
    avatarUri: null,
    avatarColor: '#14B8A6',
    type: 'catch',
    timestamp: daysAgo(2, 3),
    species: 'Common Carp',
    weightKg: 10.8,
    rarity: 'epic',
    location: 'Vinkeveense Plassen, Netherlands',
    photoUri: null,
    reactions: { NICE: ['user_demo3'] },
  },
  {
    id: 'da27',
    userId: 'carpking_dave',
    username: 'CarpKing_Dave',
    displayName: 'Dave van der Berg',
    avatarUri: null,
    avatarColor: '#14B8A6',
    type: 'badge',
    timestamp: daysAgo(4),
    badgeName: 'Double Figure Master',
    reactions: { NICE: ['user_demo1', 'user_demo2'] },
  },
  {
    id: 'da28',
    userId: 'carpking_dave',
    username: 'CarpKing_Dave',
    displayName: 'Dave van der Berg',
    avatarUri: null,
    avatarColor: '#14B8A6',
    type: 'session_start',
    timestamp: hoursAgo(14),
    location: 'Biesbosch, Netherlands',
    reactions: {},
  },

  // TroutTamara — New Zealand
  {
    id: 'da29',
    userId: 'trout_tamara',
    username: 'TroutTamara',
    displayName: 'Tamara Walsh',
    avatarUri: null,
    avatarColor: '#F43F5E',
    type: 'catch',
    timestamp: hoursAgo(7),
    species: 'Rainbow Trout',
    weightKg: 3.4,
    rarity: 'rare',
    location: 'Tongariro River, New Zealand',
    photoUri: null,
    reactions: { NICE: ['user_demo1', 'user_demo2'] },
  },
  {
    id: 'da30',
    userId: 'trout_tamara',
    username: 'TroutTamara',
    displayName: 'Tamara Walsh',
    avatarUri: null,
    avatarColor: '#F43F5E',
    type: 'catch',
    timestamp: daysAgo(1, 5),
    species: 'Brown Trout',
    weightKg: 2.7,
    rarity: 'uncommon',
    location: 'Rangitikei River, New Zealand',
    photoUri: null,
    reactions: { NICE: ['user_demo3'] },
  },
  {
    id: 'da31',
    userId: 'trout_tamara',
    username: 'TroutTamara',
    displayName: 'Tamara Walsh',
    avatarUri: null,
    avatarColor: '#F43F5E',
    type: 'level_up',
    timestamp: daysAgo(2),
    level: 6,
    reactions: { NICE: ['user_demo1'] },
  },
  {
    id: 'da32',
    userId: 'trout_tamara',
    username: 'TroutTamara',
    displayName: 'Tamara Walsh',
    avatarUri: null,
    avatarColor: '#F43F5E',
    type: 'catch',
    timestamp: daysAgo(4, 3),
    species: 'Rainbow Trout',
    weightKg: 4.1,
    rarity: 'rare',
    location: 'Lake Taupo, New Zealand',
    photoUri: null,
    reactions: { BEAST: ['user_demo2'], NICE: ['user_demo1'] },
  },
  {
    id: 'da33',
    userId: 'trout_tamara',
    username: 'TroutTamara',
    displayName: 'Tamara Walsh',
    avatarUri: null,
    avatarColor: '#F43F5E',
    type: 'session_start',
    timestamp: hoursAgo(9),
    location: 'Tongariro River, New Zealand',
    reactions: {},
  },

  // Extra mixed
  {
    id: 'da34',
    userId: 'jake_angler',
    username: 'Jake_Angler',
    displayName: 'Jake Angler',
    avatarUri: null,
    avatarColor: '#F97316',
    type: 'catch',
    timestamp: daysAgo(5, 2),
    species: 'Tench',
    weightKg: 2.9,
    rarity: 'uncommon',
    location: 'Wraysbury Lake, Berkshire',
    photoUri: null,
    reactions: { NICE: ['user_demo1'] },
  },
  {
    id: 'da35',
    userId: 'salmon_sue',
    username: 'SalmonSue',
    displayName: 'Sue MacAlister',
    avatarUri: null,
    avatarColor: '#EC4899',
    type: 'session_start',
    timestamp: daysAgo(6, 6),
    location: 'River Spey, Scotland',
    reactions: {},
  },
  {
    id: 'da36',
    userId: 'bassbro_tx',
    username: 'BassBro_TX',
    displayName: 'Tyler Bass',
    avatarUri: null,
    avatarColor: '#22C55E',
    type: 'badge',
    timestamp: daysAgo(6),
    badgeName: 'Bass Slayer',
    reactions: { NICE: ['user_demo1', 'user_demo2'] },
  },
  {
    id: 'da37',
    userId: 'flyfisher_finn',
    username: 'FlyFisherFinn',
    displayName: 'Finn Andersen',
    avatarUri: null,
    avatarColor: '#8B5CF6',
    type: 'catch',
    timestamp: daysAgo(6, 8),
    species: 'Grayling',
    weightKg: 0.9,
    rarity: 'common',
    location: 'River Glomma, Norway',
    photoUri: null,
    reactions: {},
  },
  {
    id: 'da38',
    userId: 'coastal_craig',
    username: 'CoastalCraig',
    displayName: 'Craig Penrose',
    avatarUri: null,
    avatarColor: '#3B82F6',
    type: 'badge',
    timestamp: daysAgo(7),
    badgeName: 'Sea Angler',
    reactions: { NICE: ['user_demo1', 'user_demo3'] },
  },
  {
    id: 'da39',
    userId: 'ozzie_matt',
    username: 'OzzieMatt',
    displayName: 'Matt Callaghan',
    avatarUri: null,
    avatarColor: '#F59E0B',
    type: 'session_start',
    timestamp: hoursAgo(6),
    location: 'Cairns Estuary, Queensland',
    reactions: {},
  },
  {
    id: 'da40',
    userId: 'trout_tamara',
    username: 'TroutTamara',
    displayName: 'Tamara Walsh',
    avatarUri: null,
    avatarColor: '#F43F5E',
    type: 'catch',
    timestamp: daysAgo(6, 12),
    species: 'Chinook Salmon',
    weightKg: 5.8,
    rarity: 'rare',
    location: 'Waikato River, New Zealand',
    photoUri: null,
    reactions: { NICE: ['user_demo1'], BEAST: ['user_demo2'] },
  },
];

// Sort by timestamp descending
DEMO_ACTIVITIES.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export const useSocialStore = create<SocialState>((set, get) => ({
  myActivities: [],
  feed: [],
  seeded: false,

  postActivity: (activity) => {
    const newActivity: FriendActivity = {
      ...activity,
      id: `my_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: 'me',
      timestamp: new Date().toISOString(),
      reactions: {},
    };
    set((s) => ({
      myActivities: [newActivity, ...s.myActivities],
      feed: [newActivity, ...s.feed].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    }));
    get().save();
  },

  addReaction: (activityId, reactionType, myUserId) => {
    const updateList = (list: FriendActivity[]) =>
      list.map((a) => {
        if (a.id !== activityId) return a;
        const current = a.reactions[reactionType] ?? [];
        if (current.includes(myUserId)) return a;
        return { ...a, reactions: { ...a.reactions, [reactionType]: [...current, myUserId] } };
      });
    set((s) => ({ feed: updateList(s.feed), myActivities: updateList(s.myActivities) }));
    get().save();
  },

  removeReaction: (activityId, reactionType, myUserId) => {
    const updateList = (list: FriendActivity[]) =>
      list.map((a) => {
        if (a.id !== activityId) return a;
        const current = a.reactions[reactionType] ?? [];
        return { ...a, reactions: { ...a.reactions, [reactionType]: current.filter((id) => id !== myUserId) } };
      });
    set((s) => ({ feed: updateList(s.feed), myActivities: updateList(s.myActivities) }));
    get().save();
  },

  seedDemoFriends: () => {
    // Re-seed with fresh timestamps relative to now
    const freshActivities = DEMO_ACTIVITIES.map((a) => ({ ...a }));
    set((s) => ({
      feed: [...s.myActivities, ...freshActivities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      seeded: true,
    }));
  },

  clearFeed: () => {
    set({ feed: [], myActivities: [], seeded: false });
    get().save();
  },

  load: async () => {
    try {
      const stored = await AsyncStorage.getItem(SOCIAL_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          myActivities: parsed.myActivities ?? [],
          seeded: parsed.seeded ?? false,
        });
      }
    } catch {}
    // Always seed demo data for feed
    const { seeded } = get();
    if (!seeded) {
      get().seedDemoFriends();
    } else {
      const { myActivities } = get();
      set((s) => ({
        feed: [...myActivities, ...DEMO_ACTIVITIES].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      }));
    }
  },

  save: async () => {
    try {
      const { myActivities, seeded } = get();
      await AsyncStorage.setItem(SOCIAL_KEY, JSON.stringify({ myActivities, seeded }));
    } catch {}
  },
}));

export const DEMO_FRIEND_USERS = [
  { userId: 'jake_angler', username: 'Jake_Angler', displayName: 'Jake Angler', avatarColor: '#F97316', location: 'UK', specialty: 'Carp & Pike' },
  { userId: 'salmon_sue', username: 'SalmonSue', displayName: 'Sue MacAlister', avatarColor: '#EC4899', location: 'Scotland', specialty: 'Salmon & Trout' },
  { userId: 'bassbro_tx', username: 'BassBro_TX', displayName: 'Tyler Bass', avatarColor: '#22C55E', location: 'Texas, US', specialty: 'Largemouth Bass' },
  { userId: 'coastal_craig', username: 'CoastalCraig', displayName: 'Craig Penrose', avatarColor: '#3B82F6', location: 'Cornwall, UK', specialty: 'Sea Fishing' },
  { userId: 'ozzie_matt', username: 'OzzieMatt', displayName: 'Matt Callaghan', avatarColor: '#F59E0B', location: 'Queensland, AU', specialty: 'Barramundi' },
  { userId: 'flyfisher_finn', username: 'FlyFisherFinn', displayName: 'Finn Andersen', avatarColor: '#8B5CF6', location: 'Norway', specialty: 'Salmon Fly Fishing' },
  { userId: 'carpking_dave', username: 'CarpKing_Dave', displayName: 'Dave van der Berg', avatarColor: '#14B8A6', location: 'Netherlands', specialty: 'Carp' },
  { userId: 'trout_tamara', username: 'TroutTamara', displayName: 'Tamara Walsh', avatarColor: '#F43F5E', location: 'New Zealand', specialty: 'Trout' },
];
