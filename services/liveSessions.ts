import { castApi } from './castApi';

export interface LiveParticipant {
  id: string;
  name: string;
  avatarColor: string;
  role: 'host' | 'guest';
  status: 'invited' | 'joined' | 'declined';
}

export interface LiveSession {
  id: string;
  hostId: string;
  spotName: string;
  latitude?: number | null;
  longitude?: number | null;
  startTime: string;
  status: 'active' | 'ended';
  participants: LiveParticipant[];
}

export interface LiveSessionInvite extends LiveSession {
  hostName: string;
}

export const liveSessions = {
  create: (body: { spotName: string; startTime: string; latitude?: number; longitude?: number }) =>
    castApi<{ session: LiveSession }>('/sessions', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.session),

  invite: (sessionId: string, friendId: string) =>
    castApi<{ session: LiveSession }>(`/sessions/${encodeURIComponent(sessionId)}/invite`, {
      method: 'POST', body: JSON.stringify({ friendId }),
    }).then((r) => r.session),

  listInvites: () =>
    castApi<{ invites: LiveSessionInvite[] }>('/sessions/invites').then((r) => r.invites),

  accept: (sessionId: string) =>
    castApi<{ session: LiveSession }>(`/sessions/${encodeURIComponent(sessionId)}/accept`, { method: 'POST' }).then((r) => r.session),

  decline: (sessionId: string) =>
    castApi<{ ok: boolean }>(`/sessions/${encodeURIComponent(sessionId)}/decline`, { method: 'POST' }),

  end: (sessionId: string) =>
    castApi<{ ok: boolean }>(`/sessions/${encodeURIComponent(sessionId)}/end`, { method: 'POST' }),

  get: (sessionId: string) =>
    castApi<{ session: LiveSession }>(`/sessions/${encodeURIComponent(sessionId)}`).then((r) => r.session),
};
