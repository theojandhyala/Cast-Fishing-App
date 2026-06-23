import { useEffect, useState } from 'react';
import { CONFIG } from '../constants/config';

export interface GFWActivityPoint {
  lat: number;
  lng: number;
  hours: number; // fishing hours in last 30 days
}

export interface GFWVesselEvent {
  id: string;
  lat: number;
  lng: number;
  start: string;
  end: string;
  vessel?: { name?: string; flag?: string };
}

export interface GFWData {
  activityPoints: GFWActivityPoint[];
  vesselCount: number;
  vessels: GFWVesselEvent[];
  loading: boolean;
  error: string | null;
}

export function useGFWActivity(
  minLat?: number, maxLat?: number, minLng?: number, maxLng?: number,
  enabled = true
): { activityPoints: GFWActivityPoint[]; loading: boolean; error: string | null } {
  const [activityPoints, setActivityPoints] = useState<GFWActivityPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || minLat == null || maxLat == null || minLng == null || maxLng == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const url = `${CONFIG.AI_WORKER_URL}/gfw/activity?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        // Parse GFW 4wings response into simple points
        const points: GFWActivityPoint[] = [];
        if (data.entries) {
          for (const entry of data.entries) {
            if (entry.coordinates && entry.values?.hours) {
              points.push({ lat: entry.coordinates[1], lng: entry.coordinates[0], hours: entry.values.hours });
            }
          }
        }
        setActivityPoints(points);
      })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [enabled, minLat, maxLat, minLng, maxLng]);

  return { activityPoints, loading, error };
}

export function useGFWVessels(lat?: number, lng?: number, enabled = true) {
  const [vessels, setVessels] = useState<GFWVesselEvent[]>([]);
  const [vesselCount, setVesselCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || lat == null || lng == null) return;
    let cancelled = false;
    setLoading(true);

    fetch(`${CONFIG.AI_WORKER_URL}/gfw/vessels?lat=${lat}&lng=${lng}&radius=25`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setVessels(data.vessels || []);
        setVesselCount(data.total || 0);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [enabled, lat, lng]);

  return { vessels, vesselCount, loading };
}
