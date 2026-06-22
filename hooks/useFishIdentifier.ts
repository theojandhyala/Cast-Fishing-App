import { useState } from 'react';
import { CONFIG } from '../constants/config';
import { GLOBAL_FISH_DATABASE } from '../data/globalFishDatabase';

export interface FishIdentificationResult {
  species: string;
  confidence: number;
  commonName: string;
  latinName: string;
  legalSize: number;
  estimatedWeight: string;
  estimatedLength: string;
  isLegal: boolean;
  notes: string;
  tips: string;
  alternatives: string[];
}

export function useFishIdentifier() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FishIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const identify = async (base64Image: string, mediaType = 'image/jpeg'): Promise<FishIdentificationResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!base64Image) throw new Error('The selected photo could not be read. Please try another image.');
      if (base64Image.length > 9_000_000) throw new Error('That photo is too large to scan. Try a closer crop or a lower-resolution photo.');
      if (!CONFIG.AI_WORKER_URL) throw new Error('Fish scanning is not configured.');
      let res: Response | null = null;
      let lastRequestError: unknown;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25_000);
        try {
          res = await fetch(`${CONFIG.AI_WORKER_URL}/identify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, mediaType }),
            signal: controller.signal,
          });
          if (res.ok || res.status < 500) break;
        } catch (requestError) {
          lastRequestError = requestError;
        } finally {
          clearTimeout(timeout);
        }
      }
      if (!res) throw lastRequestError instanceof Error ? lastRequestError : new Error('The scanner could not connect. Please try again.');

      const text = await res.text();
      if (!res.ok) {
        let message = 'Identification failed. Please try again.';
        try { message = JSON.parse(text)?.error || message; } catch { if (text && text.length < 180) message = text; }
        throw new Error(message);
      }

      // Worker returns the model's raw JSON; strip any stray markdown fences.
      const clean = text.replace(/```json\s*|```/gi, '').trim();
      const objectStart = clean.indexOf('{');
      const objectEnd = clean.lastIndexOf('}');
      if (objectStart < 0 || objectEnd < objectStart) throw new Error('The scanner returned an unreadable result.');
      const raw = JSON.parse(clean.slice(objectStart, objectEnd + 1));
      if (String(raw.species || '').toLowerCase().includes('no fish')) {
        throw new Error('No fish was detected. Try a clear, well-lit photo showing the whole fish.');
      }
      if (!raw.commonName && !raw.species) throw new Error('The fish species could not be identified.');
      const rawName = String(raw.commonName || raw.species).trim();
      const normalized = rawName.toLowerCase();
      const databaseFish = GLOBAL_FISH_DATABASE.find((fish) => {
        const names = [fish.name, fish.commonName, fish.latinName].map((name) => name.toLowerCase());
        return names.some((name) => name === normalized || name.includes(normalized) || normalized.includes(name));
      });
      const confidence = Math.max(0, Math.min(100, Number(raw.confidence) || 0));
      if (confidence < 45) throw new Error('The photo is too ambiguous for a reliable identification. Try a clear side-on photo showing the whole fish and its fins.');
      const legalSize = databaseFish?.legalSize ?? Math.max(0, Number(raw.legalSize) || 0);
      const lengthNumbers = String(raw.estimatedLength || '').match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
      const estimatedMinimumLength = lengthNumbers.length ? Math.min(...lengthNumbers) : 0;
      const parsed: FishIdentificationResult = {
        species: databaseFish?.name ?? rawName,
        commonName: databaseFish?.commonName ?? rawName,
        latinName: databaseFish?.latinName ?? String(raw.latinName || 'Scientific name unavailable'),
        confidence,
        legalSize,
        estimatedWeight: String(raw.estimatedWeight || 'Not estimated'),
        estimatedLength: String(raw.estimatedLength || 'Not estimated'),
        isLegal: legalSize > 0 && estimatedMinimumLength >= legalSize,
        notes: databaseFish?.description ?? String(raw.notes || 'Check the visible markings against a local identification guide.'),
        tips: databaseFish?.tip ?? String(raw.tips || 'Check local regulations before keeping any fish.'),
        alternatives: Array.isArray(raw.alternatives) ? raw.alternatives.map(String).slice(0, 4) : [],
      };
      setResult(parsed);
      return parsed;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Identification failed';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { identify, loading, result, error, reset };
}
