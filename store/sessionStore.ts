import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { liveSessions, LiveParticipant, LiveSessionInvite } from '../services/liveSessions';

export interface ActiveSession {
  spotName: string;
  spotQuery?: string;
  latitude?: number;
  longitude?: number;
  startTime: string; // ISO
  catchIds: string[];
  castCount: number;
  // Live (multi-angler) session fields — present only when the session is shared.
  liveId?: string;
  role?: 'host' | 'guest';
  participants?: LiveParticipant[];
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
  pendingInvites: LiveSessionInvite[];
  goingLive: boolean;
  startSession: (spotName: string, opts?: { spotQuery?: string; latitude?: number; longitude?: number }) => void;
  addCatchToSession: (catchId: string) => void;
  incrementCastCount: () => void;
  endSession: () => void;
  discardSession: () => void;
  clearSummary: () => void;
  // Live session (invite friends to fish together).
  goLive: () => Promise<string | null>;
  inviteFriend: (friendId: string) => Promise<boolean>;
  refreshLive: () => Promise<void>;
  fetchInvites: () => Promise<void>;
  acceptInvite: (invite: LiveSessionInvite) => Promise<void>;
  declineInvite: (sessionId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      lastSummary: null,
      sessionHistory: [],
      pendingInvites: [],
      goingLive: false,

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
        // If this device hosts a live session, end it for everyone.
        if (session.liveId && session.role === 'host') {
          liveSessions.end(session.liveId).catch(() => {});
        }
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

      // Promote the current local session to a live one others can join.
      goLive: async () => {
        const session = get().activeSession;
        if (!session) return null;
        if (session.liveId) return session.liveId;
        set({ goingLive: true });
        try {
          const live = await liveSessions.create({
            spotName: session.spotName,
            startTime: session.startTime,
            latitude: session.latitude,
            longitude: session.longitude,
          });
          set({
            goingLive: false,
            activeSession: { ...session, liveId: live.id, role: 'host', participants: live.participants },
          });
          return live.id;
        } catch {
          set({ goingLive: false });
          return null;
        }
      },

      inviteFriend: async (friendId) => {
        let session = get().activeSession;
        if (!session) return false;
        let liveId: string | null | undefined = session.liveId;
        if (!liveId) {
          liveId = await get().goLive();
          session = get().activeSession;
          if (!liveId || !session) return false;
        }
        try {
          const live = await liveSessions.invite(liveId, friendId);
          set({ activeSession: { ...session, liveId, role: 'host', participants: live.participants } });
          return true;
        } catch {
          return false;
        }
      },

      refreshLive: async () => {
        const session = get().activeSession;
        if (!session?.liveId) return;
        try {
          const live = await liveSessions.get(session.liveId);
          const current = get().activeSession;
          if (!current?.liveId) return;
          if (live.status === 'ended' && current.role === 'guest') {
            // Host ended the shared session — close it on this device too.
            get().endSession();
            return;
          }
          set({ activeSession: { ...current, participants: live.participants } });
        } catch {}
      },

      fetchInvites: async () => {
        try {
          const invites = await liveSessions.listInvites();
          set({ pendingInvites: invites });
        } catch {}
      },

      acceptInvite: async (invite) => {
        try {
          const live = await liveSessions.accept(invite.id);
          set({
            // Mirror the host's exact startTime so both timers match to the second.
            activeSession: {
              spotName: invite.spotName,
              latitude: invite.latitude ?? undefined,
              longitude: invite.longitude ?? undefined,
              startTime: invite.startTime,
              catchIds: [],
              castCount: 0,
              liveId: invite.id,
              role: 'guest',
              participants: live.participants,
            },
            pendingInvites: get().pendingInvites.filter((i) => i.id !== invite.id),
          });
        } catch {}
      },

      declineInvite: async (sessionId) => {
        set({ pendingInvites: get().pendingInvites.filter((i) => i.id !== sessionId) });
        try { await liveSessions.decline(sessionId); } catch {}
      },
    }),
    {
      name: 'cast_active_session',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
