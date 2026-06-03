import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

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
  icon: '⛅',
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

export function useWeather(lat?: number, lon?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);

      try {
        const cached = await AsyncStorage.getItem('cast_weather');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            setWeather(data);
            setLoading(false);
            return;
          }
        }
      } catch {}

      const now = new Date();
      const moon = getMoonPhase(now);

      if (!CONFIG.OPENWEATHER_API_KEY || !lat || !lon) {
        const fishingScore = calculateFishingScore({
          pressure: MOCK_WEATHER.pressure,
          pressureTrend: MOCK_WEATHER.pressureTrend,
          wind: MOCK_WEATHER.wind,
          description: MOCK_WEATHER.description,
          hour: now.getHours(),
        });

        const mock: WeatherData = {
          ...MOCK_WEATHER,
          moonPhase: moon.phase,
          moonEmoji: moon.emoji,
          fishingScore,
          forecast7day: generate7DayForecast(now),
          hourlyToday: generateHourlyForecast(now),
          solunarTimes: generateSolunarTimes(now),
        };
        setWeather(mock);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`
        );
        const data = await res.json();

        const weatherData: WeatherData = {
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          description: data.weather[0].description,
          icon: '⛅',
          wind: Math.round(data.wind.speed * 3.6),
          windDirection: data.wind.deg,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          pressureTrend: 'stable',
          moonPhase: moon.phase,
          moonEmoji: moon.emoji,
          fishingScore: 50,
          city: data.name,
          forecast7day: generate7DayForecast(now),
          hourlyToday: generateHourlyForecast(now),
          solunarTimes: generateSolunarTimes(now),
        };
        weatherData.fishingScore = calculateFishingScore({
          pressure: weatherData.pressure,
          pressureTrend: weatherData.pressureTrend,
          wind: weatherData.wind,
          description: weatherData.description,
          hour: now.getHours(),
        });

        const cacheData = { data: weatherData, timestamp: Date.now() };
        await AsyncStorage.setItem('cast_weather', JSON.stringify(cacheData));
        setWeather(weatherData);
      } catch (e) {
        const fishingScore = calculateFishingScore({
          pressure: MOCK_WEATHER.pressure,
          pressureTrend: MOCK_WEATHER.pressureTrend,
          wind: MOCK_WEATHER.wind,
          description: MOCK_WEATHER.description,
          hour: now.getHours(),
        });
        const mock: WeatherData = {
          ...MOCK_WEATHER,
          moonPhase: moon.phase,
          moonEmoji: moon.emoji,
          fishingScore,
          forecast7day: generate7DayForecast(now),
          hourlyToday: generateHourlyForecast(now),
          solunarTimes: generateSolunarTimes(now),
        };
        setWeather(mock);
        setError('Using offline data');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lon]);

  return { weather, loading, error };
}
