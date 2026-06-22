import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

export const AUTH_TOKEN_KEY = '@cast_auth_token_v1';

export class CastApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function castApi<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const token = authenticated ? await AsyncStorage.getItem(AUTH_TOKEN_KEY) : null;
  const response = await fetch(`${CONFIG.API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new CastApiError(body?.error || 'CAST could not complete that request.', response.status);
  return body as T;
}
