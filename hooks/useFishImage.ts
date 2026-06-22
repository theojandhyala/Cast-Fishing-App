import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FishImageResult {
  uri: string;
  sourcePage: string;
  attribution: string;
}

const memoryCache = new Map<string, FishImageResult | null>();

export function useFishImage(scientificName: string) {
  const key = scientificName.trim().toLocaleLowerCase();
  const [image, setImage] = useState<FishImageResult | null>(memoryCache.get(key) ?? null);
  const [loading, setLoading] = useState(!memoryCache.has(key));

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      if (memoryCache.has(key)) {
        setImage(memoryCache.get(key) ?? null);
        setLoading(false);
        return;
      }

      const storageKey = `cast_fish_image_${key.replace(/[^a-z0-9]+/g, '_')}`;
      try {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
            memoryCache.set(key, parsed.data ?? null);
            if (!cancelled) setImage(parsed.data ?? null);
            if (!cancelled) setLoading(false);
            return;
          }
        }

        const params = new URLSearchParams({
          action: 'query', format: 'json', origin: '*', redirects: '1',
          prop: 'pageimages|info', piprop: 'thumbnail|original', pithumbsize: '800', inprop: 'url',
          titles: scientificName,
        });
        const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`);
        if (!response.ok) throw new Error(`Wikipedia HTTP ${response.status}`);
        const payload = await response.json();
        const page = Object.values(payload.query?.pages ?? {}).find((item: any) => !item.missing) as any;
        const uri = page?.thumbnail?.source ?? page?.original?.source;
        const result: FishImageResult | null = uri ? {
          uri,
          sourcePage: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(scientificName.replaceAll(' ', '_'))}`,
          attribution: 'Wikipedia / Wikimedia Commons',
        } : null;
        memoryCache.set(key, result);
        await AsyncStorage.setItem(storageKey, JSON.stringify({ data: result, timestamp: Date.now() }));
        if (!cancelled) setImage(result);
      } catch {
        memoryCache.set(key, null);
        if (!cancelled) setImage(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [key, scientificName]);

  return { image, loading };
}
