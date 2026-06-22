import { useCallback, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyForecast {
  date: string;
  dayName: string;
  icon: string;
  high: number;
  low: number;
  description: string;
  wind: number;
  pressure: number;
  fishingScore: number;
}

export interface HourlyForecast {
  hour: number;
  label: string;
  icon: string;
  temp: number;
  wind: number;
  pressure: number;
  fishingScore: number;
}

export interface SolunarTime {
  type: 'major' | 'minor';
  start: string;
  end: string;
  rating: number;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  wind: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  pressureTrend: 'rising' | 'falling' | 'stable';
  moonPhase: string;
  moonEmoji: string;
  fishingScore: number;
  city: string;
  forecast7day: DailyForecast[];
  hourlyToday: HourlyForecast[];
  solunarTimes: SolunarTime[];
}

const MOCK_WEATHER: Omit<WeatherData, 'moonPhase' | 'moonEmoji' | 'fishingScore' | 'forecast7day' | 'hourlyToday' | 'solunarTimes'> = {
  temp: 14,
  feelsLike: 12,
  description: 'Partly Cloudy',
  icon: 'weather-partly-cloudy',
  wind: 12,
  windDirection: 225,
  humidity: 72,
  pressure: 1016,
  pressureTrend: 'rising',
  city: 'London',
};

const WEATHER_ICONS = ['☀️', '⛅', '🌥️', '☁️', '🌧️', '⛈️', '🌦️'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DESCRIPTIONS = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Cloudy', 'Clear', 'Scattered Showers'];

export function getMoonPhase(date: Date): { phase: string; emoji: string } {
  const known = new Date(2000, 0, 6);
  const diff = date.getTime() - known.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  const cycle = 29.53058867;
  const position = ((days % cycle) + cycle) % cycle;

  if (position < 1.85) return { phase: 'New Moon', emoji: '🌑' };
  if (position < 7.38) return { phase: 'Waxing Crescent', emoji: '🌒' };
  if (position < 9.22) return { phase: 'First Quarter', emoji: '🌓' };
  if (position < 14.77) return { phase: 'Waxing Gibbous', emoji: '🌔' };
  if (position < 16.61) return { phase: 'Full Moon', emoji: '🌕' };
  if (position < 22.15) return { phase: 'Waning Gibbous', emoji: '🌖' };
  if (position < 23.99) return { phase: 'Last Quarter', emoji: '🌗' };
  if (position < 29.53) return { phase: 'Waning Crescent', emoji: '🌘' };
  return { phase: 'New Moon', emoji: '🌑' };
}

export function calculateFishingScore(params: {
  pressure: number;
  pressureTrend: 'rising' | 'falling' | 'stable';
  wind: number;
  description: string;
  hour?: number;
  pressureDropped?: number;
}): number {
  const { pressure, pressureTrend, wind, description, hour, pressureDropped } = params;
  let score = 50;

  // Pressure
  if (pressureTrend === 'rising' || pressure > 1010) score += 20;
  if (pressureDropped && pressureDropped > 5) score -= 20;

  // Wind
  if (wind < 15) score += 15;
  if (wind > 25) score -= 15;

  // Overcast bonus
  const desc = description.toLowerCase();
  if (desc.includes('cloud') || desc.includes('overcast')) score += 10;

  // Dawn/dusk bonus
  if (hour !== undefined) {
    const isDawnOrDusk =
      (hour >= 5 && hour <= 7) || (hour >= 18 && hour <= 20);
    if (isDawnOrDusk) score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

function wmoDescription(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 9) return 'Fog';
  if (code <= 19) return 'Drizzle';
  if (code <= 29) return 'Rain';
  if (code <= 39) return 'Snow';
  if (code <= 49) return 'Fog';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 84) return 'Rain Showers';
  if (code <= 94) return 'Thunderstorm';
  return 'Storm';
}

function wmoIcon(code: number): string {
  if (code === 0) return 'weather-sunny';
  if (code <= 2) return 'weather-partly-cloudy';
  if (code === 3) return 'weather-cloudy';
  if (code <= 49) return 'weather-fog';
  if (code <= 69) return 'weather-rainy';
  if (code <= 79) return 'weather-snowy';
  if (code <= 84) return 'weather-pouring';
  return 'weather-lightning-rainy';
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generate7DayForecast(baseDate: Date): DailyForecast[] {
  const dayOfYear = Math.floor(
    (baseDate.getTime() - new Date(baseDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    const seed = dayOfYear + i * 7;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 1);
    const r3 = seededRandom(seed + 2);
    const r4 = seededRandom(seed + 3);

    const high = Math.round(10 + r1 * 12); // 10–22°C
    const low = Math.round(high - 4 - r2 * 4);
    const wind = Math.round(5 + r3 * 25);
    const pressure = Math.round(1005 + r4 * 20);
    const descIdx = Math.floor(r1 * DESCRIPTIONS.length);
    const iconIdx = Math.floor(r2 * WEATHER_ICONS.length);

    const trend: 'rising' | 'falling' | 'stable' =
      r3 < 0.33 ? 'rising' : r3 < 0.66 ? 'stable' : 'falling';

    const fishingScore = calculateFishingScore({
      pressure,
      pressureTrend: trend,
      wind,
      description: DESCRIPTIONS[descIdx],
    });

    return {
      date: day.toISOString(),
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[day.getDay()],
      icon: WEATHER_ICONS[iconIdx],
      high,
      low,
      description: DESCRIPTIONS[descIdx],
      wind,
      pressure,
      fishingScore,
    };
  });
}

function generate7DayForecastFromApi(
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    wind_speed_10m_max: number[];
    surface_pressure_mean: number[];
  },
  baseDate: Date
): DailyForecast[] {
  return daily.time.slice(0, 7).map((dateStr, i) => {
    const day = new Date(dateStr + 'T12:00:00');
    const code = daily.weather_code[i] ?? 0;
    const high = Math.round(daily.temperature_2m_max[i] ?? 15);
    const low = Math.round(daily.temperature_2m_min[i] ?? 10);
    const wind = Math.round(daily.wind_speed_10m_max[i] ?? 10);
    const pressure = Math.round(daily.surface_pressure_mean[i] ?? 1013);
    const description = wmoDescription(code);

    const fishingScore = calculateFishingScore({
      pressure,
      pressureTrend: 'stable',
      wind,
      description,
    });

    return {
      date: day.toISOString(),
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[day.getDay()],
      icon: WEATHER_ICONS[Math.min(Math.floor(code / 20), WEATHER_ICONS.length - 1)],
      high,
      low,
      description,
      wind,
      pressure,
      fishingScore,
    };
  });
}

function generateHourlyForecast(baseDate: Date): HourlyForecast[] {
  const baseTemp = 12 + Math.round(seededRandom(baseDate.getDate()) * 8);
  const now = baseDate.getHours();

  return Array.from({ length: 24 }, (_, h) => {
    const seed = baseDate.getDate() * 100 + h;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 50);

    const tempVariation = Math.sin((h - 6) * Math.PI / 12) * 4;
    const temp = Math.round(baseTemp + tempVariation + (r1 - 0.5) * 2);
    const wind = Math.round(5 + r2 * 20);
    const pressure = Math.round(1010 + seededRandom(seed + 30) * 15);
    const iconIdx = Math.floor(r1 * 4); // biased toward clearer icons

    const description = h >= 6 && h <= 20 ? DESCRIPTIONS[iconIdx] : 'Clear Night';
    const fishingScore = calculateFishingScore({
      pressure,
      pressureTrend: 'stable',
      wind,
      description,
      hour: h,
    });

    const label = h === 0 ? 'Midnight' : h === 12 ? 'Noon' : h < 12 ? `${h}am` : `${h - 12}pm`;

    return {
      hour: h,
      label,
      icon: h < 6 || h >= 21 ? '🌙' : WEATHER_ICONS[iconIdx],
      temp,
      wind,
      pressure,
      fishingScore,
    };
  });
}

function generateHourlyForecastFromApi(
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    surface_pressure: number[];
  },
  baseDate: Date
): HourlyForecast[] {
  // Find the start of today
  const todayStr = baseDate.toISOString().slice(0, 10);
  const todayEntries = hourly.time
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.startsWith(todayStr));

  const result: HourlyForecast[] = [];
  for (let h = 0; h < 24; h++) {
    const entry = todayEntries.find(({ t }) => t.endsWith(`T${String(h).padStart(2, '0')}:00`));
    const idx = entry?.i ?? -1;

    const temp = idx >= 0 ? Math.round(hourly.temperature_2m[idx]) : 15;
    const code = idx >= 0 ? (hourly.weather_code[idx] ?? 0) : 0;
    const wind = idx >= 0 ? Math.round(hourly.wind_speed_10m[idx]) : 10;
    const pressure = idx >= 0 ? Math.round(hourly.surface_pressure[idx]) : 1013;
    const description = wmoDescription(code);

    const fishingScore = calculateFishingScore({
      pressure,
      pressureTrend: 'stable',
      wind,
      description,
      hour: h,
    });

    const label = h === 0 ? 'Midnight' : h === 12 ? 'Noon' : h < 12 ? `${h}am` : `${h - 12}pm`;

    result.push({
      hour: h,
      label,
      icon: wmoIcon(code),
      temp,
      wind,
      pressure,
      fishingScore,
    });
  }
  return result;
}

function generateSolunarTimes(date: Date): SolunarTime[] {
  const moon = getMoonPhase(date);
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  const baseHour1 = 4 + Math.round(seededRandom(dayOfYear) * 4);
  const baseHour2 = baseHour1 + 12;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (h: number, m: number) => `${pad(h % 24)}:${pad(m)}`;
  const isFullOrNew = moon.phase === 'Full Moon' || moon.phase === 'New Moon';

  return [
    {
      type: 'major',
      start: fmt(baseHour1, 0),
      end: fmt(baseHour1 + 2, 0),
      rating: isFullOrNew ? 5 : 4,
    },
    {
      type: 'minor',
      start: fmt(baseHour1 + 6, 0),
      end: fmt(baseHour1 + 7, 0),
      rating: isFullOrNew ? 4 : 3,
    },
    {
      type: 'major',
      start: fmt(baseHour2, 0),
      end: fmt(baseHour2 + 2, 0),
      rating: isFullOrNew ? 5 : 4,
    },
    {
      type: 'minor',
      start: fmt(baseHour2 + 6, 0),
      end: fmt(baseHour2 + 7, 0),
      rating: isFullOrNew ? 3 : 2,
    },
  ];
}

function buildMockWeather(now: Date, latitude = 51.5, longitude = -0.1): WeatherData {
  const coordinateSeed = Math.round((latitude + 90) * 1000 + (longitude + 180) * 100);
  const variation = seededRandom(coordinateSeed + Math.floor(now.getTime() / 86400000));
  const temp = Math.round(7 + variation * 18);
  const wind = Math.round(4 + seededRandom(coordinateSeed + 11) * 24);
  const pressure = Math.round(995 + seededRandom(coordinateSeed + 29) * 35);
  const pressureTrend: WeatherData['pressureTrend'] = seededRandom(coordinateSeed + 41) < 0.33 ? 'falling' : seededRandom(coordinateSeed + 41) > 0.66 ? 'rising' : 'stable';
  const moon = getMoonPhase(now);
  const fishingScore = calculateFishingScore({
    pressure,
    pressureTrend,
    wind,
    description: MOCK_WEATHER.description,
    hour: now.getHours(),
  });
  return {
    ...MOCK_WEATHER,
    temp,
    feelsLike: temp - Math.round(wind / 12),
    wind,
    pressure,
    pressureTrend,
    city: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    moonPhase: moon.phase,
    moonEmoji: moon.emoji,
    fishingScore,
    forecast7day: generate7DayForecast(now),
    hourlyToday: generateHourlyForecast(now),
    solunarTimes: generateSolunarTimes(now),
  };
}

export function useWeather(lat?: number, lon?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const hasCoords = lat !== undefined && lon !== undefined;
  const cacheKey = hasCoords ? `cast_weather_${lat.toFixed(3)}_${lon.toFixed(3)}` : 'cast_weather_mock';

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(null);

      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (refreshToken === 0 && Date.now() - timestamp < 5 * 60 * 1000) {
            setWeather(data);
            setUpdatedAt(new Date(timestamp));
            setLoading(false);
            return;
          }
        }
      } catch {}

      const now = new Date();

      if (!hasCoords) {
        setWeather(buildMockWeather(now));
        setUpdatedAt(now);
        setLoading(false);
        return;
      }

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code,surface_pressure,relative_humidity_2m,wind_direction_10m` +
          `&hourly=temperature_2m,weather_code,wind_speed_10m,surface_pressure` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,surface_pressure_mean` +
          `&timezone=auto&forecast_days=7`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const current = data.current;
        const code = current.weather_code ?? 0;
        const description = wmoDescription(code);
        const icon = wmoIcon(code);
        const temp = Math.round(current.temperature_2m ?? 15);
        const feelsLike = Math.round(current.apparent_temperature ?? temp);
        const wind = Math.round(current.wind_speed_10m ?? 10);
        const windDirection = Math.round(current.wind_direction_10m ?? 0);
        const humidity = Math.round(current.relative_humidity_2m ?? 70);
        const pressure = Math.round(current.surface_pressure ?? 1013);
        const currentIndex = Math.max(0, data.hourly.time.findIndex((time: string) => time >= current.time));
        const previousPressure = Number(data.hourly.surface_pressure[Math.max(0, currentIndex - 3)] ?? pressure);
        const pressureDelta = pressure - previousPressure;
        const pressureTrend: WeatherData['pressureTrend'] = pressureDelta > 0.8 ? 'rising' : pressureDelta < -0.8 ? 'falling' : 'stable';

        const moon = getMoonPhase(now);

        const fishingScore = calculateFishingScore({
          pressure,
          pressureTrend,
          wind,
          description,
          hour: now.getHours(),
        });

        const weatherData: WeatherData = {
          temp,
          feelsLike,
          description,
          icon,
          wind,
          windDirection,
          humidity,
          pressure,
          pressureTrend,
          moonPhase: moon.phase,
          moonEmoji: moon.emoji,
          fishingScore,
          city: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          forecast7day: generate7DayForecastFromApi(data.daily, now),
          hourlyToday: generateHourlyForecastFromApi(data.hourly, now),
          solunarTimes: generateSolunarTimes(now),
        };

        try {
          await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: weatherData, timestamp: Date.now() }));
        } catch {}

        setWeather(weatherData);
        setUpdatedAt(now);
      } catch (e) {
        setWeather(buildMockWeather(now, lat, lon));
        setUpdatedAt(now);
        setError('Using offline data');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lon, refreshToken]);

  useEffect(() => {
    const interval = setInterval(() => setRefreshToken((token) => token + 1), 5 * 60 * 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setRefreshToken((token) => token + 1);
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  return { weather, loading, error, refresh, updatedAt };
}
