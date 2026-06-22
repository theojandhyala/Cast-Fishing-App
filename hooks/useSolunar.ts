/**
 * Solunar theory: fish feeding times based on moon position.
 * Major windows → moon overhead (upper transit) or underfoot (lower transit)
 * Minor windows → moon on horizon (quarter points)
 *
 * Accuracy: ~10–20 minutes, sufficient for angling purposes.
 */

import { useMemo } from 'react';

export interface SolunarWindow {
  time: string;       // "HH:MM"
  endTime: string;    // "HH:MM"
  duration: string;   // "1h 30m"
  quality: 'major' | 'minor';
  label: string;
  isActive: boolean;  // currently within this window
  minutesUntil: number; // -1 if past, 0 if active, >0 if upcoming
}

export interface SolunarData {
  score: number;           // 0–100
  scoreLabel: string;      // 'Poor' | 'Fair' | 'Good' | 'Excellent'
  moonPhase: number;       // 0–1 (0=new, 0.5=full)
  moonPhaseName: string;
  moonIllumination: number; // 0–100%
  windows: SolunarWindow[];
  hourlyActivity: number[]; // 25 values, 0–100, for the chart
  nextWindow: SolunarWindow | null;
  lastUpdated: Date;
}

// ─── Moon phase ──────────────────────────────────────────────────────────────

const REF_NEW_MOON_MS = new Date('2000-01-06T18:14:00Z').getTime();
const SYNODIC_DAYS = 29.530589;
const SYNODIC_MS = SYNODIC_DAYS * 86400000;

function getMoonPhase(date: Date): number {
  // 0 = new moon, 0.5 = full moon
  return ((date.getTime() - REF_NEW_MOON_MS) % SYNODIC_MS + SYNODIC_MS) % SYNODIC_MS / SYNODIC_MS;
}

function getMoonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  return 'Waning Crescent';
}

function getMoonIllumination(phase: number): number {
  // illumination = (1 - cos(2π·phase)) / 2
  return Math.round((1 - Math.cos(2 * Math.PI * phase)) / 2 * 100);
}

// ─── Moon transit time ───────────────────────────────────────────────────────
// Returns upper-transit time in LOCAL hours (0–24).
// Uses simplified but adequate astronomical algorithm.

function deg2rad(d: number) { return d * Math.PI / 180; }
function rad2deg(r: number) { return r * 180 / Math.PI; }
function norm360(d: number) { return ((d % 360) + 360) % 360; }
function norm24(h: number)  { return ((h % 24) + 24) % 24; }

function moonTransitLocalHour(date: Date, lat: number, lng: number): number {
  // Julian Day Number
  const JD = date.getTime() / 86400000 + 2440587.5;
  const D = JD - 2451545.0; // days since J2000.0

  // Moon's orbital elements (simplified — accurate ~1°)
  const L = norm360(218.316 + 13.176396 * D);  // mean longitude
  const M = deg2rad(norm360(134.963 + 13.064993 * D)); // mean anomaly
  const F = deg2rad(norm360(93.272  + 13.229350 * D)); // arg of latitude

  // Ecliptic longitude (main correction terms only)
  const lambda = norm360(L + 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * deg2rad(L) - M)
    - 0.658 * Math.cos(deg2rad(L))
    - 0.214 * Math.sin(2 * F));

  // Convert ecliptic longitude to RA (obliquity ~23.43°)
  const eps = deg2rad(23.439 - 0.0000004 * D);
  const lambdaRad = deg2rad(lambda);
  const RA = rad2deg(Math.atan2(Math.cos(eps) * Math.sin(lambdaRad), Math.cos(lambdaRad)));

  // Greenwich Sidereal Time at 0h UT for this date
  const T = D / 36525;
  const GMST0 = norm360(100.4606184 + 36000.77004 * T + 0.000387933 * T * T);
  // GST at current UT
  const utHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const GST = norm360(GMST0 + 360.98564724 * (D % 1 + utHours / 24));

  // Local Hour Angle for transit (transit when HA=0, i.e. RA = LST)
  const LST = norm360(GST + lng);
  const HA = norm360(LST - RA); // in degrees

  // Hours until transit (positive = still to come today)
  let hoursUntilTransit = (360 - HA) / 15; // each 15° = 1 hour
  if (hoursUntilTransit > 12) hoursUntilTransit -= 24;

  const localOffsetHours = lng / 15; // crude timezone offset
  const localTransit = norm24(utHours + hoursUntilTransit + localOffsetHours);
  return localTransit;
}

// ─── Window builder ──────────────────────────────────────────────────────────

function formatHM(decimalHours: number): string {
  const h = norm24(decimalHours);
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function durationStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function buildWindow(
  centerHour: number,
  quality: 'major' | 'minor',
  now: Date
): SolunarWindow {
  const durationMins = quality === 'major' ? 90 : 45;
  const halfDur = durationMins / 2 / 60;
  const startH = norm24(centerHour - halfDur);
  const endH   = norm24(centerHour + halfDur);

  const nowH = now.getHours() + now.getMinutes() / 60;
  const isActive = nowH >= startH && nowH <= endH;
  const minutesUntil = isActive ? 0
    : startH > nowH ? Math.round((startH - nowH) * 60)
    : Math.round((startH + 24 - nowH) * 60); // tomorrow

  return {
    time: formatHM(startH),
    endTime: formatHM(endH),
    duration: durationStr(durationMins),
    quality,
    label: quality === 'major' ? 'Major Feeding' : 'Minor Feeding',
    isActive,
    minutesUntil: isActive ? 0 : minutesUntil,
  };
}

// ─── Hourly activity curve ───────────────────────────────────────────────────

function buildActivityCurve(upperTransit: number, moonPhase: number): number[] {
  // Base amplitude: boosted near new/full moon, reduced near quarters
  const phaseEffect = Math.abs(Math.cos(2 * Math.PI * moonPhase)); // 1 at new/full, 0 at quarters
  const baseAmp = 50 + phaseEffect * 35; // 50–85%

  const lowerTransit = norm24(upperTransit + 12.4206);
  const minor1 = norm24(upperTransit + 6.2103);
  const minor2 = norm24(upperTransit + 18.6309);

  return Array.from({ length: 25 }, (_, i) => {
    const h = i;
    // Sum of gaussian peaks at transit points
    function gaussian(center: number, sigma: number, amp: number): number {
      const diff = Math.min(Math.abs(h - center), 24 - Math.abs(h - center));
      return amp * Math.exp(-(diff * diff) / (2 * sigma * sigma));
    }
    const activity =
      gaussian(upperTransit, 1.0, baseAmp) +
      gaussian(lowerTransit, 1.0, baseAmp) +
      gaussian(minor1, 0.7, baseAmp * 0.55) +
      gaussian(minor2, 0.7, baseAmp * 0.55);

    return Math.min(100, Math.round(activity));
  });
}

// ─── Overall score ───────────────────────────────────────────────────────────

function calcScore(moonPhase: number, now: Date, windows: SolunarWindow[]): number {
  // Phase factor: highest at new/full moon
  const phaseFactor = (Math.abs(Math.cos(2 * Math.PI * moonPhase)) + 0.4) / 1.4; // 0.4–1.0

  // Time factor: are we near a window?
  const nowH = now.getHours() + now.getMinutes() / 60;
  let timeFactor = 0.3; // baseline
  for (const w of windows) {
    const startH = parseInt(w.time.split(':')[0]) + parseInt(w.time.split(':')[1]) / 60;
    const endH   = parseInt(w.endTime.split(':')[0]) + parseInt(w.endTime.split(':')[1]) / 60;
    const durationH = parseInt(w.duration) + (w.duration.includes('h') ? 0 : 0);
    if (nowH >= startH && nowH <= endH) {
      timeFactor = w.quality === 'major' ? 1.0 : 0.7;
      break;
    }
    const dist = Math.min(Math.abs(nowH - startH), Math.abs(nowH - endH));
    if (dist < 2) timeFactor = Math.max(timeFactor, (1 - dist / 2) * (w.quality === 'major' ? 0.85 : 0.6));
  }

  const raw = phaseFactor * timeFactor * 100;
  return Math.max(10, Math.min(100, Math.round(raw)));
}

// ─── Main hook ───────────────────────────────────────────────────────────────

export function useSolunar(lat: number = 52.5, lng: number = -1.5): SolunarData {
  return useMemo(() => {
    const now = new Date();
    const phase = getMoonPhase(now);
    const upperTransit = moonTransitLocalHour(now, lat, lng);
    const lowerTransit = norm24(upperTransit + 12.4206);
    const minor1       = norm24(upperTransit + 6.2103);
    const minor2       = norm24(upperTransit + 18.6309);

    const windows: SolunarWindow[] = [
      buildWindow(upperTransit, 'major', now),
      buildWindow(lowerTransit, 'major', now),
      buildWindow(minor1,       'minor', now),
      buildWindow(minor2,       'minor', now),
    ].sort((a, b) => {
      // Sort: active first, then by minutesUntil ascending
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.minutesUntil - b.minutesUntil;
    });

    const score = calcScore(phase, now, windows);
    const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';
    const hourlyActivity = buildActivityCurve(upperTransit, phase);

    const nextWindow = windows.find((w) => !w.isActive && w.minutesUntil > 0) ?? null;

    return {
      score,
      scoreLabel,
      moonPhase: phase,
      moonPhaseName: getMoonPhaseName(phase),
      moonIllumination: getMoonIllumination(phase),
      windows,
      hourlyActivity,
      nextWindow,
      lastUpdated: now,
    };
  }, [lat, lng, Math.floor(Date.now() / 300000)]); // recompute every 5 minutes
}
