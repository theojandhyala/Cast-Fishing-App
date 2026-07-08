/**
 * Personal Fishing Brain — derives natural-language insights from catch history.
 * Designed to surface genuinely useful patterns, not vanity stats.
 */

import { useMemo } from 'react';
import { Catch } from '../store/catchStore';

export interface FishingInsight {
  id: string;
  stat: string;             // large number/text shown prominently
  statUnit?: string;        // e.g. "×" or "am"
  text: string;             // natural language explanation
  icon: string;             // MaterialCommunityIcons name
  color: string;            // accent color
  confidence: 'low' | 'medium' | 'high';
  sampleSize: number;
}

function top<T extends string>(map: Record<T, number>): [T, number] | null {
  const entries = Object.entries(map) as [T, number][];
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0];
}

function hourLabel(h: number): string {
  if (h === 0) return 'midnight';
  if (h === 12) return 'noon';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function timeWindow(h: number): 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' {
  if (h >= 4 && h < 7) return 'dawn';
  if (h >= 7 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function computeInsights(catches: Catch[]): FishingInsight[] {
  if (catches.length === 0) return [];

  const insights: FishingInsight[] = [];

  // ── Best species ──────────────────────────────────────────────────────────
  const speciesCounts: Record<string, number> = {};
  const speciesWeights: Record<string, number[]> = {};
  for (const c of catches) {
    speciesCounts[c.species] = (speciesCounts[c.species] || 0) + 1;
    if (!speciesWeights[c.species]) speciesWeights[c.species] = [];
    speciesWeights[c.species].push(c.weight);
  }
  const topSpecies = top(speciesCounts);
  if (topSpecies) {
    const [sp, count] = topSpecies;
    const weights = speciesWeights[sp];
    const avg = weights.reduce((s, w) => s + w, 0) / weights.length;
    insights.push({
      id: 'top-species',
      stat: sp,
      text: `${count} catch${count !== 1 ? 'es' : ''}, averaging ${avg.toFixed(1)} kg. Your most consistent species.`,
      icon: 'fish',
      color: '#00D4AA',
      confidence: count >= 10 ? 'high' : count >= 5 ? 'medium' : 'low',
      sampleSize: count,
    });
  }

  // ── Best hour ─────────────────────────────────────────────────────────────
  const hourCounts: Record<number, number> = {};
  for (const c of catches) {
    const h = c.hourOfDay ?? new Date(c.date).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  }
  const topHour = top(hourCounts as Record<string, number>);
  if (topHour) {
    const [hStr, count] = topHour;
    const h = parseInt(hStr, 10);
    const label = hourLabel(h);
    const window = timeWindow(h);
    insights.push({
      id: 'best-hour',
      stat: label,
      text: `${count} of your catches were at ${label}. The ${window} is your golden window.`,
      icon: 'clock-time-four-outline',
      color: '#F59E0B',
      confidence: count >= 5 ? 'high' : count >= 3 ? 'medium' : 'low',
      sampleSize: count,
    });
  }

  // ── Top bait ──────────────────────────────────────────────────────────────
  const baitCounts: Record<string, number> = {};
  for (const c of catches) {
    if (c.bait) baitCounts[c.bait] = (baitCounts[c.bait] || 0) + 1;
  }
  const topBait = top(baitCounts);
  if (topBait) {
    const [bait, count] = topBait;
    const pct = Math.round((count / catches.length) * 100);
    insights.push({
      id: 'top-bait',
      stat: bait,
      text: `${pct}% of your catches used ${bait}. Try it first on new waters.`,
      icon: 'fish-off',
      color: '#2DD4FF',
      confidence: count >= 5 ? 'high' : count >= 3 ? 'medium' : 'low',
      sampleSize: count,
    });
  }

  // ── Morning vs evening ────────────────────────────────────────────────────
  if (catches.length >= 5) {
    const windowCounts = { dawn: 0, morning: 0, afternoon: 0, evening: 0, night: 0 };
    for (const c of catches) {
      const h = c.hourOfDay ?? new Date(c.date).getHours();
      windowCounts[timeWindow(h)]++;
    }
    const best = Object.entries(windowCounts).sort((a, b) => b[1] - a[1])[0];
    const worst = Object.entries(windowCounts).filter(([, v]) => v > 0).sort((a, b) => a[1] - b[1])[0];
    if (best && worst && worst[1] > 0 && best[0] !== worst[0]) {
      const ratio = (best[1] / worst[1]).toFixed(1);
      if (parseFloat(ratio) >= 1.5) {
        insights.push({
          id: 'time-ratio',
          stat: `${ratio}×`,
          text: `Your catch rate is ${ratio}× higher in the ${best[0]} vs ${worst[0]}. Plan sessions accordingly.`,
          icon: 'chart-line',
          color: '#8B5CF6',
          confidence: catches.length >= 15 ? 'high' : catches.length >= 8 ? 'medium' : 'low',
          sampleSize: catches.length,
        });
      }
    }
  }

  // ── Pressure insight ──────────────────────────────────────────────────────
  const withPressure = catches.filter((c) => c.pressureTrend);
  if (withPressure.length >= 4) {
    const trendCounts: Record<string, number> = {};
    for (const c of withPressure) {
      trendCounts[c.pressureTrend!] = (trendCounts[c.pressureTrend!] || 0) + 1;
    }
    const topTrend = top(trendCounts);
    if (topTrend) {
      const [trend, count] = topTrend;
      const pct = Math.round((count / withPressure.length) * 100);
      insights.push({
        id: 'pressure',
        stat: `${pct}%`,
        text: `${pct}% of your catches happened under ${trend} pressure — the most productive condition for you.`,
        icon: 'gauge',
        color: '#10B981',
        confidence: withPressure.length >= 10 ? 'high' : 'medium',
        sampleSize: withPressure.length,
      });
    }
  }

  // ── Best location ─────────────────────────────────────────────────────────
  const locationCounts: Record<string, number> = {};
  for (const c of catches) {
    if (c.location) locationCounts[c.location] = (locationCounts[c.location] || 0) + 1;
  }
  const topLocation = top(locationCounts);
  if (topLocation && topLocation[1] >= 2) {
    const [loc, count] = topLocation;
    insights.push({
      id: 'best-location',
      stat: String(count),
      statUnit: 'fish',
      text: `${loc} is your most productive water — ${count} catches logged there.`,
      icon: 'map-marker-check',
      color: '#F59E0B',
      confidence: count >= 8 ? 'high' : count >= 4 ? 'medium' : 'low',
      sampleSize: count,
    });
  }

  return insights;
}

export function usePersonalInsights(catches: Catch[]): FishingInsight[] {
  return useMemo(() => computeInsights(catches), [catches]);
}
