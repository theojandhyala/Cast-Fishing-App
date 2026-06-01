import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

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
}

const MOCK_WEATHER: WeatherData = {
  temp: 14,
  feelsLike: 12,
  description: 'Partly Cloudy',
  icon: '⛅',
  wind: 12,
  windDirection: 225,
  humidity: 72,
  pressure: 1016,
  pressureTrend: 'rising',
  moonPhase: 'Waxing Crescent',
  moonEmoji: '🌒',
  fishingScore: 7,
  city: 'London',
};

function getMoonPhase(date: Date): { phase: string; emoji: string } {
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

function getFishingScore(weather: Partial<WeatherData>): number {
  let score = 5;
  const pressure = weather.pressure || 1013;
  const trend = weather.pressureTrend;
  if (trend === 'rising') score += 2;
  if (trend === 'falling') score += 1;
  if (pressure > 1020) score += 1;
  if ((weather.wind || 0) < 15) score += 1;
  if ((weather.wind || 0) > 25) score -= 2;
  return Math.max(1, Math.min(10, score));
}

export function useWeather(lat?: number, lon?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);

      // Check cache first
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

      if (!CONFIG.OPENWEATHER_API_KEY || !lat || !lon) {
        const moon = getMoonPhase(new Date());
        const mock = { ...MOCK_WEATHER, moonPhase: moon.phase, moonEmoji: moon.emoji };
        mock.fishingScore = getFishingScore(mock);
        setWeather(mock);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`
        );
        const data = await res.json();
        const moon = getMoonPhase(new Date());

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
          fishingScore: 7,
          city: data.name,
        };
        weatherData.fishingScore = getFishingScore(weatherData);

        const cacheData = { data: weatherData, timestamp: Date.now() };
        await AsyncStorage.setItem('cast_weather', JSON.stringify(cacheData));
        setWeather(weatherData);
      } catch (e) {
        const moon = getMoonPhase(new Date());
        const mock = { ...MOCK_WEATHER, moonPhase: moon.phase, moonEmoji: moon.emoji };
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
