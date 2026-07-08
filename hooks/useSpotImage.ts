import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SpotImageResult {
  uri: string;
  sourcePage: string;
  attribution: string;
  match: 'named-location' | 'nearby';
}

const memoryCache = new Map<string, SpotImageResult | null>();

function plainText(value?: string) {
  return (value ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function normalise(value: string) {
  return value.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function useSpotImage(id: string, name: string, latitude: number, longitude: number) {
  const [image, setImage] = useState<SpotImageResult | null>(memoryCache.get(id) ?? null);
  const [loading, setLoading] = useState(!memoryCache.has(id));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (memoryCache.has(id)) {
        setImage(memoryCache.get(id) ?? null);
        setLoading(false);
        return;
      }

      const cacheKey = `cast_spot_image_v2_${id}`;
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
            memoryCache.set(id, parsed.data ?? null);
            if (!cancelled) setImage(parsed.data ?? null);
            if (!cancelled) setLoading(false);
            return;
          }
        }

        const params = new URLSearchParams({
          action: 'query', format: 'json', origin: '*', generator: 'geosearch',
          ggsprimary: 'all', ggsnamespace: '6', ggsradius: '2500', ggslimit: '12',
          ggscoord: `${latitude}|${longitude}`, prop: 'imageinfo|info|coordinates', inprop: 'url',
          iiprop: 'url|mime|extmetadata', iiurlwidth: '1000',
        });
        const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
        if (!response.ok) throw new Error(`Commons HTTP ${response.status}`);
        const payload = await response.json();
        const pages = (Object.values(payload.query?.pages ?? {}) as any[]).filter((candidate) => {
          const info = candidate.imageinfo?.[0];
          return info?.thumburl && String(info.mime ?? '').startsWith('image/') && info.mime !== 'image/svg+xml';
        });
        const nameWords = normalise(name).split(' ').filter((word) => word.length > 3);
        const namedLocationScore = Math.min(2, Math.max(1, nameWords.length));
        const score = (candidate: any) => {
            const title = normalise(candidate.title ?? '');
            return nameWords.reduce((total, word) => total + (title.includes(word) ? 1 : 0), 0);
        };
        const page = pages.sort((a, b) => {
          return score(b) - score(a);
        })[0];
        const info = page?.imageinfo?.[0];
        const artist = plainText(info?.extmetadata?.Artist?.value);
        const result: SpotImageResult | null = info?.thumburl ? {
          uri: info.thumburl,
          sourcePage: page.fullurl ?? info.descriptionurl,
          attribution: artist ? `${score(page) >= namedLocationScore ? 'Location' : 'Nearby'} photo · ${artist}` : `${score(page) >= namedLocationScore ? 'Location' : 'Nearby'} photo · Wikimedia Commons`,
          match: score(page) >= namedLocationScore ? 'named-location' : 'nearby',
        } : null;
        memoryCache.set(id, result);
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: result, timestamp: Date.now() }));
        if (!cancelled) setImage(result);
      } catch {
        memoryCache.set(id, null);
        if (!cancelled) setImage(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, name, latitude, longitude]);

  return { image, loading };
}
