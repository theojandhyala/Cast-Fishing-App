import type { SolunarTime } from '../hooks/useWeather';

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

export function selectPrimaryFishingWindow(windows: SolunarTime[], now = new Date()) {
  if (!windows.length) return null;
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const majors = windows.filter((window) => window.type === 'major');
  const candidates = majors.length ? majors : windows;
  return candidates.find((window) => currentMinute >= toMinutes(window.start) && currentMinute <= toMinutes(window.end))
    ?? candidates.find((window) => toMinutes(window.start) > currentMinute)
    ?? candidates[0];
}

export function fishingWindowLabel(window: SolunarTime) {
  return `${window.start} – ${window.end}`;
}

export function fishingWindowQuality(window: SolunarTime) {
  return window.rating >= 5 ? 'Excellent' : window.rating >= 4 ? 'Very good' : window.rating >= 3 ? 'Good' : 'Fair';
}
