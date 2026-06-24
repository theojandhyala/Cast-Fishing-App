import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ActiveSession {
  spotName: string;
  spotQuery?: string;
  latitude?: number;
  longitude?: number;
  startTime: string; // ISO
  catchIds: string[];
  castCount: number;
}

export interface SessionSummary {
  spotName: string;
  startTime: string;
  endTime: string;
  catchIds: string[];
}

interface SessionState {
  activeSession: ActiveSession | null;
  lastSummary: SessionSummary | null;
  sessionHistory: SessionSummary[];
  startSession: (spotName: string, opts?: { spotQuery?: string; latitude?: number; longitude?: number }) => void;
  addCatchToSession: (catchId: string) => void;
  incrementCastCount: () => void;
  endSession: () => void;
  discardSession: () => void;
  clearSummary: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      lastSummary: null,
      sessionHistory: [],

      startSession: (spotName, opts) =>
        set({
          activeSession: {
            spotName,
            spotQuery: opts?.spotQuery,
            latitude: opts?.latitude,
            longitude: opts?.longitude,
            startTime: new Date().toISOString(),
            catchIds: [],
            castCount: 0,
          },
        }),

      incrementCastCount: () => {
        const session = get().activeSession;
        if (!session) return;
        set({ activeSession: { ...session, castCount: (session.castCount ?? 0) + 1 } });
      },

      addCatchToSession: (catchId) => {
        const session = get().activeSession;
        if (!session) return;
        set({ activeSession: { ...session, catchIds: [...session.catchIds, catchId] } });
      },

      endSession: () => {
        const session = get().activeSession;
        if (!session) return;
        const summary: SessionSummary = {
          spotName: session.spotName,
          startTime: session.startTime,
          endTime: new Date().toISOString(),
          catchIds: session.catchIds,
        };
        set({
          activeSession: null,
          lastSummary: summary,
          sessionHistory: [summary, ...get().sessionHistory].slice(0, 50),
        });
      },

      discardSession: () => set({ activeSession: null }),
      clearSummary: () => set({ lastSummary: null }),
    }),
    {
      name: 'cast_active_session',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
