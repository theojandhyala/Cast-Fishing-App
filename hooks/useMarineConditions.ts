import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MarineConditions {
  seaLevelM: number | null;
  tideTrend: 'rising' | 'falling' | 'steady' | 'unknown';
  nextHigh: { time: string; heightM: number } | null;
  nextLow: { time: string; heightM: number } | null;
  waveHeightM: number | null;
  seaTemperatureC: number | null;
  currentVelocityKmh: number | null;
  currentDirection: number | null;
  observedAt: string;
  tideSeries: Array<{ time: string; heightM: number }>;
  source: 'Open-Meteo Marine API';
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function findExtremes(times: string[], levels: Array<number | null>, start: number) {
  let nextHigh: MarineConditions['nextHigh'] = null;
  let nextLow: MarineConditions['nextLow'] = null;
  for (let i = Math.max(1, start); i < Math.min(levels.length - 1, start + 48); i += 1) {
    const previous = levels[i - 1];
    const current = levels[i];
    const next = levels[i + 1];
    if (previous == null || current == null || next == null) continue;
    if (!nextHigh && current >= previous && current > next) nextHigh = { time: times[i], heightM: current };
    if (!nextLow && current <= previous && current < next) nextLow = { time: times[i], heightM: current };
    if (nextHigh && nextLow) break;
  }
  return { nextHigh, nextLow };
}

export function useMarineConditions(latitude?: number, longitude?: number, enabled = true) {
  const [marine, setMarine] = useState<MarineConditions | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!enabled || latitude === undefined || longitude === undefined) {
      setMarine(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const cacheKey = `cast_marine_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (refreshToken === 0 && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            if (!cancelled) setMarine(parsed.data);
            if (!cancelled) setLoading(false);
            return;
          }
        }

        const variables = 'wave_height,sea_level_height_msl,sea_surface_temperature,ocean_current_velocity,ocean_current_direction';
        const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=${variables}&hourly=sea_level_height_msl&timezone=auto&forecast_days=3`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Marine API HTTP ${response.status}`);
        const payload = await response.json();
        const levels = (payload.hourly?.sea_level_height_msl ?? []).map(numberOrNull);
        const times: string[] = payload.hourly?.time ?? [];
        const currentTime = String(payload.current?.time ?? '');
        const index = Math.max(0, times.findIndex((time) => time >= currentTime));
        const currentLevel = numberOrNull(payload.current?.sea_level_height_msl) ?? levels[index] ?? null;
        const nextLevel = levels[index + 1] ?? null;
        const delta = currentLevel != null && nextLevel != null ? nextLevel - currentLevel : 0;
        const tideTrend: MarineConditions['tideTrend'] = currentLevel == null || nextLevel == null ? 'unknown' : delta > 0.01 ? 'rising' : delta < -0.01 ? 'falling' : 'steady';
        const extremes = findExtremes(times, levels, index);
        const data: MarineConditions = {
          seaLevelM: currentLevel,
          tideTrend,
          ...extremes,
          waveHeightM: numberOrNull(payload.current?.wave_height),
          seaTemperatureC: numberOrNull(payload.current?.sea_surface_temperature),
          currentVelocityKmh: numberOrNull(payload.current?.ocean_current_velocity),
          currentDirection: numberOrNull(payload.current?.ocean_current_direction),
          observedAt: currentTime,
          tideSeries: times.slice(index, index + 25).map((time, offset) => ({
            time,
            heightM: levels[index + offset] ?? currentLevel ?? 0,
          })),
          source: 'Open-Meteo Marine API',
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        if (!cancelled) setMarine(data);
      } catch {
        if (!cancelled) {
          setMarine(null);
          setError('Marine forecast unavailable for this coordinate');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [latitude, longitude, enabled, refreshToken]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => setRefreshToken((token) => token + 1), 5 * 60 * 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setRefreshToken((token) => token + 1);
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [enabled]);

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  return { marine, loading, error, refresh };
}
