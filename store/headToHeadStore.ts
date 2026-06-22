import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Friend } from './friendsStore';

export type DuelMetric = 'species' | 'catches' | 'weight';
export type DuelStatus = 'incoming' | 'outgoing' | 'active' | 'complete';

export interface HeadToHead {
  id: string;
  opponentId: string;
  opponentName: string;
  opponentColor: string;
  metric: DuelMetric;
  title: string;
  target: number;
  yourScore: number;
  opponentScore: number;
  status: DuelStatus;
  endsAt: string;
  isDemo: boolean;
}

interface HeadToHeadState {
  duels: HeadToHead[];
  challengeFriend: (friend: Friend) => void;
  acceptDuel: (id: string) => void;
  declineDuel: (id: string) => void;
}

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

const INITIAL_DUELS: HeadToHead[] = [];

export const useHeadToHeadStore = create<HeadToHeadState>()(
  persist(
    (set, get) => ({
      duels: INITIAL_DUELS,
      challengeFriend: (friend) => {
        const existing = get().duels.some((duel) => duel.opponentId === friend.id && ['active', 'outgoing', 'incoming'].includes(duel.status));
        if (existing) return;
        set((state) => ({ duels: [{
          id: `duel-${friend.id}-${Date.now()}`,
          opponentId: friend.id,
          opponentName: friend.name,
          opponentColor: friend.avatarColor,
          metric: 'catches',
          title: 'First to five',
          target: 5,
          yourScore: 0,
          opponentScore: 0,
          status: 'outgoing',
          endsAt: daysFromNow(7),
          isDemo: Boolean(friend.isDemo),
        }, ...state.duels] }));
      },
      acceptDuel: (id) => set((state) => ({ duels: state.duels.map((duel) => duel.id === id ? { ...duel, status: 'active' } : duel) })),
      declineDuel: (id) => set((state) => ({ duels: state.duels.filter((duel) => duel.id !== id) })),
    }),
    {
      name: 'cast_head_to_heads_v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
