import { useState } from 'react';
import { CONFIG } from '../constants/config';

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
  isDemo?: boolean; // true when returned from demo/offline mode
}

// Required fields that must be present for a valid response
const REQUIRED_FIELDS: (keyof FishIdentificationResult)[] = [
  'species', 'confidence', 'commonName', 'latinName',
  'estimatedWeight', 'estimatedLength', 'notes', 'alternatives',
];

function isValidResult(obj: unknown): obj is FishIdentificationResult {
  if (!obj || typeof obj !== 'object') return false;
  const r = obj as Record<string, unknown>;
  return REQUIRED_FIELDS.every((f) => f in r) &&
    typeof r.species === 'string' && r.species.length > 0 &&
    typeof r.confidence === 'number' &&
    Array.isArray(r.alternatives);
}

function sanitiseResult(r: FishIdentificationResult): FishIdentificationResult {
  return {
    ...r,
    confidence: Math.max(0, Math.min(100, Math.round(r.confidence))),
    legalSize: typeof r.legalSize === 'number' ? r.legalSize : 0,
    isLegal: typeof r.isLegal === 'boolean' ? r.isLegal : true,
    tips: r.tips ?? '',
    alternatives: Array.isArray(r.alternatives) ? r.alternatives.slice(0, 5) : [],
  };
}

async function fetchWithRetry(url: string, body: string, maxRetries = 2): Promise<Response> {
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); // 1s, 2s backoff
      }
    }
  }
  throw lastError;
}

export function useFishIdentifier() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FishIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const identify = async (base64Image: string): Promise<FishIdentificationResult | null> => {
    if (!base64Image || base64Image.length < 100) {
      setError('Image data is missing or too small. Please try again.');
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setIsDemo(false);

    const workerUrl = CONFIG.AI_WORKER_URL;

    if (!workerUrl) {
      // Demo mode — no worker URL configured
      await new Promise((r) => setTimeout(r, 1500));
      const demos = getDemoResults();
      const demo = { ...demos[Math.floor(Math.random() * demos.length)], isDemo: true };
      setResult(demo);
      setIsDemo(true);
      setLoading(false);
      return demo;
    }

    try {
      const res = await fetchWithRetry(
        `${workerUrl}/identify`,
        JSON.stringify({ image: base64Image }),
        2 // up to 2 retries = 3 total attempts
      );

      const text = await res.text();

      if (!res.ok) {
        // Surface the actual server error — don't hide it behind demo data
        const serverMsg = text?.slice(0, 200) || `HTTP ${res.status}`;
        throw new Error(`Identification service error: ${serverMsg}`);
      }

      // Strip markdown code fences if model returned them
      let clean = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();

      // Handle cases where the model wrapped results in an outer key
      if (clean.startsWith('{"result"')) {
        try {
          const wrapper = JSON.parse(clean);
          clean = JSON.stringify(wrapper.result ?? wrapper);
        } catch {}
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(clean);
      } catch {
        throw new Error('Response was not valid JSON. The identification service may be misconfigured.');
      }

      if (!isValidResult(parsed)) {
        throw new Error('Response was missing required fields. Got: ' + Object.keys(parsed as object).join(', '));
      }

      const final = sanitiseResult(parsed);
      setResult(final);
      setIsDemo(false);
      setLoading(false);
      return final;

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Identification failed';
      setError(msg);
      setResult(null); // Do NOT silently return demo data — show the error
      setLoading(false);
      return null;
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsDemo(false);
  };

  return { identify, loading, result, error, isDemo, reset };
}

// Demo results shown only when no worker URL is configured (dev/offline mode)
function getDemoResults(): FishIdentificationResult[] {
  return [
    {
      species: 'Common Carp',
      confidence: 94,
      commonName: 'Common Carp',
      latinName: 'Cyprinus carpio',
      legalSize: 38,
      estimatedWeight: '4–7 kg',
      estimatedLength: '55–70 cm',
      isLegal: true,
      notes: 'A healthy common carp. The large scales and distinctive deep body profile are characteristic. Demo result — configure AI_WORKER_URL for real identification.',
      tips: 'Carp are highly intelligent — vary your rigs and baits to keep catching.',
      alternatives: ['Mirror Carp', 'Leather Carp', 'Crucian Carp'],
      isDemo: true,
    },
    {
      species: 'European Perch',
      confidence: 89,
      commonName: 'European Perch',
      latinName: 'Perca fluviatilis',
      legalSize: 25,
      estimatedWeight: '0.5–1.2 kg',
      estimatedLength: '25–35 cm',
      isLegal: true,
      notes: 'A fine perch with distinctive green vertical bars and red-orange pectoral fins. Demo result.',
      tips: 'Drop shotting small plastics is devastating for big perch. Target structure.',
      alternatives: ['Zander', 'Ruffe', 'Largemouth Bass'],
      isDemo: true,
    },
    {
      species: 'Northern Pike',
      confidence: 97,
      commonName: 'Northern Pike',
      latinName: 'Esox lucius',
      legalSize: 45,
      estimatedWeight: '3–6 kg',
      estimatedLength: '65–80 cm',
      isLegal: true,
      notes: 'A substantial pike with classic green-gold torpedo body and large jaws. Demo result.',
      tips: 'Always use forceps and a wire trace. Support the full body weight when handling.',
      alternatives: ['Chain Pickerel', 'Muskellunge'],
      isDemo: true,
    },
  ];
}
