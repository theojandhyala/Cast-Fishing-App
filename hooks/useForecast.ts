/**
 * 7-day weather forecast via Open-Meteo (free, no key, CORS-enabled).
 * Computes a per-day fishing score from temperature, precipitation, and wind.
 */

import { useState, useEffect, useCallback } from 'react';

export interface ForecastDay {
  day: string;           // 'Today', 'Tomorrow', 'Mon', etc.
  date: Date;
  icon: string;          // MaterialCommunityIcons name
  high: number;          // °C
  low: number;           // °C
  precipMm: number;
  windKmh: number;
  score: number;         // 1–10 fishing score
  scoreReason: string;
}

interface ForecastState {
  days: ForecastDay[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

// WMO weather code → MaterialCommunityIcons name
function wmoToIcon(code: number): string {
  if (code === 0)              return 'weather-sunny';
  if (code <= 2)               return 'weather-partly-cloudy';
  if (code === 3)              return 'weather-cloudy';
  if (code <= 49)              return 'weather-fog';
  if (code <= 55)              return 'weather-rainy';
  if (code <= 67)              return 'weather-pouring';
  if (code <= 77)              return 'weather-snowy';
  if (code <= 82)              return 'weather-rainy';
  if (code <= 86)              return 'weather-snowy-heavy';
  return 'weather-lightning-rainy';
}

// Fishing score: higher = better day to fish (UK coarse/game focus)
function fishingScore(high: number, low: number, precipMm: number, windKmh: number): { score: number; reason: string } {
  let score = 5;
  const reasons: string[] = [];

  // Temperature: UK fish love 10–18°C
  const avgTemp = (high + low) / 2;
  if (avgTemp >= 12 && avgTemp <= 18) {
    score += 2;
    reasons.push('ideal temp');
  } else if (avgTemp >= 8 && avgTemp < 12) {
    score += 1;
    reasons.push('cool — pike/perch');
  } else if (avgTemp > 18 && avgTemp <= 23) {
    score += 0.5;
    reasons.push('warm — early morning best');
  } else if (avgTemp < 4) {
    score -= 2;
    reasons.push('very cold');
  } else if (avgTemp > 25) {
    score -= 1.5;
    reasons.push('heat suppresses feeding');
  }

  // Precipitation: light rain = good (drops pressure, oxygenates); heavy = bad
  if (precipMm === 0) {
    score += 0.5; // dry/sunny
  } else if (precipMm <= 5) {
    score += 1.5; // light rain
    reasons.push('light rain ↑');
  } else if (precipMm <= 15) {
    score -= 0.5;
    reasons.push('moderate rain');
  } else {
    score -= 2;
    reasons.push('heavy rain — rivers colour up');
  }

  // Wind: calm to light = good (easier casting, less surface disturbance)
  if (windKmh <= 15) {
    score += 1;
  } else if (windKmh <= 30) {
    score += 0; // neutral
  } else if (windKmh <= 45) {
    score -= 1;
    reasons.push('strong wind');
  } else {
    score -= 2;
    reasons.push('gale force');
  }

  const clamped = Math.max(1, Math.min(10, Math.round(score)));
  const reason = reasons.length > 0 ? reasons.join(', ') : (clamped >= 7 ? 'good conditions' : 'average conditions');
  return { score: clamped, reason };
}

function dayLabel(date: Date, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-GB', { weekday: 'short' });
}

export function useForecast(lat: number = 52.5, lng: number = -1.5): ForecastState {
  const [days, setDays] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max` +
      `&forecast_days=7&timezone=auto`;

    fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const { daily } = data;
        const result: ForecastDay[] = daily.time.map((dateStr: string, i: number) => {
          const date = new Date(dateStr);
          const high = Math.round(daily.temperature_2m_max[i]);
          const low  = Math.round(daily.temperature_2m_min[i]);
          const precip = daily.precipitation_sum[i] ?? 0;
          const wind  = Math.round(daily.windspeed_10m_max[i] ?? 0);
          const code  = daily.weathercode[i] ?? 0;
          const { score, reason } = fishingScore(high, low, precip, wind);
          return {
            day: dayLabel(date, i),
            date,
            icon: wmoToIcon(code),
            high,
            low,
            precipMm: precip,
            windKmh: wind,
            score,
            scoreReason: reason,
          };
        });
        setDays(result);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Forecast unavailable');
        // Fallback: generate 7-day plausible data from today
        const fallback: ForecastDay[] = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return {
            day: dayLabel(d, i),
            date: d,
            icon: i % 3 === 0 ? 'weather-sunny' : i % 3 === 1 ? 'weather-partly-cloudy' : 'weather-rainy',
            high: 12 + Math.sin(i * 0.9) * 3 | 0,
            low: 7 + Math.sin(i * 0.7) * 2 | 0,
            precipMm: i % 3 === 2 ? 4 : 0,
            windKmh: 15 + (i * 3) % 20,
            score: 5 + (i % 4) - 1,
            scoreReason: 'estimated',
          };
        });
        setDays(fallback);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lat, lng, tick]);

  return { days, loading, error, lastUpdated, refresh };
}
