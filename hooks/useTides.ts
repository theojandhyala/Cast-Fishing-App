import { useState, useEffect, useCallback, useRef } from 'react';

export interface TidePoint {
  time: string;
  height: number;
  timestamp: number;
}

export interface TideData {
  stationName: string;
  source: 'uk_ea' | 'noaa' | 'computed';
  currentHeight: number;
  trend: 'rising' | 'falling' | 'slack';
  trendRate: number; // m/hr
  nextHigh: { time: string; height: number };
  nextLow: { time: string; height: number };
  points: TidePoint[]; // 25 points covering 00:00–24:00 today
  range: { min: number; max: number };
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function harmonicTide(t: number, lat: number): number {
  const M2 = Math.cos((2 * Math.PI * t) / 12.4206);
  const S2 = Math.cos((2 * Math.PI * t) / 12.0);
  const K1 = Math.cos((2 * Math.PI * t) / 23.93);
  const O1 = Math.cos((2 * Math.PI * t) / 25.82);
  const amp = 0.8 + (Math.abs(lat) / 90) * 1.2;
  return amp * (0.5 * M2 + 0.2 * S2 + 0.15 * K1 + 0.15 * O1);
}

function generateComputedPoints(lat: number): TidePoint[] {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  return Array.from({ length: 25 }, (_, i) => {
    const ts = midnight.getTime() + i * 60 * 60 * 1000;
    const date = new Date(ts);
    // t = hours since midnight UTC
    const t = (date.getUTCHours() + date.getUTCMinutes() / 60);
    const height = harmonicTide(t, lat);
    const hour = i;
    const timeStr = `${String(hour).padStart(2, '0')}:00`;
    return { time: timeStr, height, timestamp: ts };
  });
}

function isUkRegion(lat: number, lng: number): boolean {
  return lat >= 49 && lat <= 61 && lng >= -8 && lng <= 2;
}

function isNoaaRegion(lat: number, lng: number): boolean {
  return lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66;
}

function formatTime(dateStr: string): string {
  // dateStr can be ISO string or "YYYY-MM-DD HH:MM"
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Try parsing "YYYY-MM-DD HH:MM" as local
    const parts = dateStr.match(/(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})/);
    if (parts) {
      return `${parts[2]}:${parts[3]}`;
    }
    return dateStr;
  }
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function deriveTrend(
  points: TidePoint[],
  currentTs: number
): { trend: 'rising' | 'falling' | 'slack'; trendRate: number; currentHeight: number } {
  if (points.length === 0) {
    return { trend: 'slack', trendRate: 0, currentHeight: 0 };
  }

  // Find current position by interpolating between points
  let currentHeight = points[0].height;
  let heightNow = points[0].height;
  let height30mAgo = points[0].height;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    if (currentTs >= p0.timestamp && currentTs <= p1.timestamp) {
      const frac = (currentTs - p0.timestamp) / (p1.timestamp - p0.timestamp);
      currentHeight = p0.height + (p1.height - p0.height) * frac;
      heightNow = currentHeight;
      break;
    }
  }

  // 30 min ago
  const ts30ago = currentTs - 30 * 60 * 1000;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    if (ts30ago >= p0.timestamp && ts30ago <= p1.timestamp) {
      const frac = (ts30ago - p0.timestamp) / (p1.timestamp - p0.timestamp);
      height30mAgo = p0.height + (p1.height - p0.height) * frac;
      break;
    }
  }

  const trendRate = (heightNow - height30mAgo) / 0.5; // m/hr
  let trend: 'rising' | 'falling' | 'slack';
  if (Math.abs(trendRate) < 0.05) {
    trend = 'slack';
  } else if (trendRate > 0) {
    trend = 'rising';
  } else {
    trend = 'falling';
  }

  return { trend, trendRate, currentHeight };
}

function findNextHighLow(
  points: TidePoint[],
  currentTs: number
): {
  nextHigh: { time: string; height: number };
  nextLow: { time: string; height: number };
} {
  // Find points after current time
  const futurePoints = points.filter((p) => p.timestamp >= currentTs);

  let nextHigh = { time: '12:00', height: 1.0 };
  let nextLow = { time: '06:00', height: 0.1 };
  let foundHigh = false;
  let foundLow = false;

  for (let i = 1; i < futurePoints.length - 1; i++) {
    const prev = futurePoints[i - 1];
    const curr = futurePoints[i];
    const next = futurePoints[i + 1];

    if (!foundHigh && curr.height >= prev.height && curr.height >= next.height) {
      nextHigh = { time: curr.time, height: Math.round(curr.height * 100) / 100 };
      foundHigh = true;
    }
    if (!foundLow && curr.height <= prev.height && curr.height <= next.height) {
      nextLow = { time: curr.time, height: Math.round(curr.height * 100) / 100 };
      foundLow = true;
    }
    if (foundHigh && foundLow) break;
  }

  // If not found in future points, search all points
  if (!foundHigh || !foundLow) {
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      if (!foundHigh && curr.height >= prev.height && curr.height >= next.height) {
        nextHigh = { time: curr.time, height: Math.round(curr.height * 100) / 100 };
        foundHigh = true;
      }
      if (!foundLow && curr.height <= prev.height && curr.height <= next.height) {
        nextLow = { time: curr.time, height: Math.round(curr.height * 100) / 100 };
        foundLow = true;
      }
      if (foundHigh && foundLow) break;
    }
  }

  return { nextHigh, nextLow };
}

async function fetchUkEa(lat: number, lng: number): Promise<{
  stationName: string;
  points: TidePoint[];
}> {
  const stationsUrl = `https://environment.data.gov.uk/flood-monitoring/id/stations?type=TideGauge&lat=${lat}&long=${lng}&dist=50`;
  const stationsRes = await fetch(stationsUrl);
  if (!stationsRes.ok) throw new Error(`EA stations HTTP ${stationsRes.status}`);
  const stationsData = await stationsRes.json();

  const items = stationsData.items;
  if (!items || items.length === 0) throw new Error('No UK EA tide gauge stations found nearby');

  const station = items[0];
  const stationRef = station.stationReference;
  const stationName = station.label || stationRef;

  const readingsUrl = `https://environment.data.gov.uk/flood-monitoring/id/stations/${stationRef}/readings?parameter=tidal-level&_sorted&_limit=96`;
  const readingsRes = await fetch(readingsUrl);
  if (!readingsRes.ok) throw new Error(`EA readings HTTP ${readingsRes.status}`);
  const readingsData = await readingsRes.json();

  const readings = readingsData.items;
  if (!readings || readings.length === 0) throw new Error('No EA readings available');

  // Sort readings by dateTime ascending
  const sorted = [...readings].sort(
    (a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  // Build points — map readings to hourly slots for today
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const midnight = new Date(`${todayStr}T00:00:00`);

  // Build a map from hour -> readings for today
  const hourlyMap: { [hour: number]: number[] } = {};
  for (const r of sorted) {
    const d = new Date(r.dateTime);
    const rDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (rDateStr === todayStr) {
      const h = d.getHours();
      if (!hourlyMap[h]) hourlyMap[h] = [];
      hourlyMap[h].push(r.value);
    }
  }

  // Interpolate to fill 25 hourly points
  // First collect all readings for today as (ts, value) pairs
  const pairs: { ts: number; value: number }[] = sorted
    .filter((r: any) => {
      const d = new Date(r.dateTime);
      const rDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return rDateStr === todayStr;
    })
    .map((r: any) => ({ ts: new Date(r.dateTime).getTime(), value: r.value }));

  if (pairs.length === 0) throw new Error('No EA readings for today');

  const points: TidePoint[] = Array.from({ length: 25 }, (_, i) => {
    const ts = midnight.getTime() + i * 60 * 60 * 1000;
    const timeStr = `${String(i).padStart(2, '0')}:00`;

    // Interpolate
    let height = pairs[0].value;
    if (ts <= pairs[0].ts) {
      height = pairs[0].value;
    } else if (ts >= pairs[pairs.length - 1].ts) {
      height = pairs[pairs.length - 1].value;
    } else {
      for (let j = 0; j < pairs.length - 1; j++) {
        if (ts >= pairs[j].ts && ts <= pairs[j + 1].ts) {
          const frac = (ts - pairs[j].ts) / (pairs[j + 1].ts - pairs[j].ts);
          height = pairs[j].value + (pairs[j + 1].value - pairs[j].value) * frac;
          break;
        }
      }
    }

    return { time: timeStr, height: Math.round(height * 1000) / 1000, timestamp: ts };
  });

  return { stationName, points };
}

async function fetchNoaa(lat: number, lng: number): Promise<{
  stationName: string;
  points: TidePoint[];
}> {
  const stationsUrl = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/tidepredstations.json?lat=${lat}&lon=${lng}&radius=50&units=metric`;
  const stationsRes = await fetch(stationsUrl);
  if (!stationsRes.ok) throw new Error(`NOAA stations HTTP ${stationsRes.status}`);
  const stationsData = await stationsRes.json();

  const stationList = stationsData.stationList;
  if (!stationList || stationList.length === 0) throw new Error('No NOAA tide stations found nearby');

  const station = stationList[0];
  const stationId = station.stationId;
  const stationName = station.etidesStnName || stationId;

  const now = new Date();
  const ymd =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, '0')}` +
    `${String(now.getDate()).padStart(2, '0')}`;

  const predictionsUrl =
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` +
    `?station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt` +
    `&interval=h&units=metric&application=cast_fishing&format=json` +
    `&begin_date=${ymd}&end_date=${ymd}`;

  const predictionsRes = await fetch(predictionsUrl);
  if (!predictionsRes.ok) throw new Error(`NOAA predictions HTTP ${predictionsRes.status}`);
  const predictionsData = await predictionsRes.json();

  const predictions = predictionsData.predictions;
  if (!predictions || predictions.length === 0) throw new Error('No NOAA predictions available');

  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Map predictions (they come in as hourly, 24 entries)
  const predMap: { [hour: number]: number } = {};
  for (const p of predictions) {
    // t format: "YYYY-MM-DD HH:MM"
    const match = p.t.match(/(\d{2}):(\d{2})$/);
    if (match) {
      const h = parseInt(match[1], 10);
      predMap[h] = parseFloat(p.v);
    }
  }

  const points: TidePoint[] = Array.from({ length: 25 }, (_, i) => {
    const hour = i === 24 ? 23 : i;
    const ts = midnight.getTime() + i * 60 * 60 * 1000;
    const timeStr = `${String(i).padStart(2, '0')}:00`;
    // Use hour 23 data for the 24:00 slot
    const height = predMap[hour] ?? 0;
    return { time: timeStr, height: Math.round(height * 1000) / 1000, timestamp: ts };
  });

  return { stationName, points };
}

const DEFAULT_LAT = 51.5;
const DEFAULT_LNG = -0.1;

export function useTides(lat?: number, lng?: number): TideData {
  const effectiveLat = lat ?? DEFAULT_LAT;
  const effectiveLng = lng ?? DEFAULT_LNG;

  const [data, setData] = useState<Omit<TideData, 'refresh'>>({
    stationName: 'Computing...',
    source: 'computed',
    currentHeight: 0,
    trend: 'slack',
    trendRate: 0,
    nextHigh: { time: '12:00', height: 1.0 },
    nextLow: { time: '06:00', height: 0.1 },
    points: [],
    range: { min: 0, max: 2 },
    loading: true,
    error: null,
  });

  const refreshCountRef = useRef(0);

  const fetchTides = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    const now = new Date();
    const nowTs = now.getTime();

    try {
      let stationName = 'Computed (Harmonic Model)';
      let source: 'uk_ea' | 'noaa' | 'computed' = 'computed';
      let points: TidePoint[] = [];

      if (isUkRegion(effectiveLat, effectiveLng)) {
        try {
          const result = await fetchUkEa(effectiveLat, effectiveLng);
          stationName = result.stationName;
          points = result.points;
          source = 'uk_ea';
        } catch (err) {
          // Fall back to computed
          points = generateComputedPoints(effectiveLat);
          stationName = 'Computed (Harmonic Model)';
          source = 'computed';
        }
      } else if (isNoaaRegion(effectiveLat, effectiveLng)) {
        try {
          const result = await fetchNoaa(effectiveLat, effectiveLng);
          stationName = result.stationName;
          points = result.points;
          source = 'noaa';
        } catch (err) {
          points = generateComputedPoints(effectiveLat);
          stationName = 'Computed (Harmonic Model)';
          source = 'computed';
        }
      } else {
        points = generateComputedPoints(effectiveLat);
        stationName = 'Computed (Harmonic Model)';
        source = 'computed';
      }

      const allHeights = points.map((p) => p.height);
      const minH = Math.min(...allHeights);
      const maxH = Math.max(...allHeights);

      const { trend, trendRate, currentHeight } = deriveTrend(points, nowTs);
      const { nextHigh, nextLow } = findNextHighLow(points, nowTs);

      setData({
        stationName,
        source,
        currentHeight: Math.round(currentHeight * 100) / 100,
        trend,
        trendRate: Math.round(trendRate * 100) / 100,
        nextHigh,
        nextLow,
        points,
        range: { min: Math.round(minH * 100) / 100, max: Math.round(maxH * 100) / 100 },
        loading: false,
        error: null,
      });
    } catch (err: any) {
      // Total fallback
      const points = generateComputedPoints(effectiveLat);
      const allHeights = points.map((p) => p.height);
      const minH = Math.min(...allHeights);
      const maxH = Math.max(...allHeights);
      const { trend, trendRate, currentHeight } = deriveTrend(points, nowTs);
      const { nextHigh, nextLow } = findNextHighLow(points, nowTs);

      setData({
        stationName: 'Computed (Harmonic Model)',
        source: 'computed',
        currentHeight: Math.round(currentHeight * 100) / 100,
        trend,
        trendRate: Math.round(trendRate * 100) / 100,
        nextHigh,
        nextLow,
        points,
        range: { min: Math.round(minH * 100) / 100, max: Math.round(maxH * 100) / 100 },
        loading: false,
        error: err?.message ?? 'Failed to fetch tide data',
      });
    }
  }, [effectiveLat, effectiveLng]);

  const refresh = useCallback(() => {
    refreshCountRef.current += 1;
    fetchTides();
  }, [fetchTides]);

  useEffect(() => {
    fetchTides();

    const interval = setInterval(() => {
      fetchTides();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchTides]);

  return { ...data, refresh };
}
