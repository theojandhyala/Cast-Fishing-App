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
}

const DEMO_RESULTS: FishIdentificationResult[] = [
  {
    species: 'Common Carp',
    confidence: 94,
    commonName: 'Common Carp',
    latinName: 'Cyprinus carpio',
    legalSize: 38,
    estimatedWeight: '4-7kg',
    estimatedLength: '55-70cm',
    isLegal: true,
    notes: 'A healthy-looking common carp. The large scales and distinctive body shape are characteristic of this species.',
    tips: 'Carp are highly intelligent - vary your rigs and baits to keep catching.',
    alternatives: ['Mirror Carp', 'Leather Carp', 'Crucian Carp'],
  },
  {
    species: 'Perch',
    confidence: 89,
    commonName: 'European Perch',
    latinName: 'Perca fluviatilis',
    legalSize: 25,
    estimatedWeight: '0.5-1.2kg',
    estimatedLength: '25-35cm',
    isLegal: true,
    notes: 'A fine perch with distinctive green striped markings and red-orange pectoral fins.',
    tips: 'Drop shotting small plastics is devastating for big perch. Look near structure.',
    alternatives: ['Largemouth Bass', 'Zander', 'Ruffe'],
  },
  {
    species: 'Pike',
    confidence: 97,
    commonName: 'Northern Pike',
    latinName: 'Esox lucius',
    legalSize: 45,
    estimatedWeight: '3-6kg',
    estimatedLength: '65-80cm',
    isLegal: true,
    notes: 'A substantial pike with classic green-gold torpedo body and large jaws.',
    tips: 'Always use forceps and a wire trace. Support the full body weight when handling.',
    alternatives: ['Chain Pickerel', 'Muskellunge'],
  },
];

export function useFishIdentifier() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FishIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const identify = async (base64Image: string): Promise<FishIdentificationResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    if (!CONFIG.ANTHROPIC_API_KEY) {
      // Demo mode
      await new Promise((r) => setTimeout(r, 2000));
      const demo = DEMO_RESULTS[Math.floor(Math.random() * DEMO_RESULTS.length)];
      setResult(demo);
      setLoading(false);
      return demo;
    }

    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic({ apiKey: CONFIG.ANTHROPIC_API_KEY });

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `Identify the fish species in this image. Provide your response as a JSON object with these exact fields:
{
  "species": "Common name of species",
  "confidence": 85,
  "commonName": "Full common name",
  "latinName": "Scientific name",
  "legalSize": 30,
  "estimatedWeight": "2-4kg",
  "estimatedLength": "40-55cm",
  "isLegal": true,
  "notes": "Brief description of identifying features visible",
  "tips": "One fishing tip for this species",
  "alternatives": ["Alternative species 1", "Alternative species 2"]
}
Only return the JSON, no other text. The legalSize is the UK minimum size in cm. If no fish is visible, set species to "No fish detected".`,
              },
            ],
          },
        ],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = JSON.parse(text) as FishIdentificationResult;
      setResult(parsed);
      setLoading(false);
      return parsed;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Identification failed';
      setError(errorMsg);
      // Fallback to demo on error
      const demo = DEMO_RESULTS[0];
      setResult(demo);
      setLoading(false);
      return demo;
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { identify, loading, result, error, reset };
}
