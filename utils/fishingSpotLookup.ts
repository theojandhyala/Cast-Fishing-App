import { FISHING_SPOTS } from '../data/fishingSpots';
import { FishingSpotRecord, SpotDifficulty, SpotVerification, SpotWaterType } from '../types/fishingSpot';

export interface SpotQuery {
  text?: string;
  country?: string;
  coverageRegion?: FishingSpotRecord['coverageRegion'];
  type?: SpotWaterType;
  difficulty?: SpotDifficulty;
  verification?: SpotVerification;
  species?: string;
  limit?: number;
}

const normalise = (value: string) => value.trim().toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
const SPOTS_BY_ID = new Map(FISHING_SPOTS.map((spot) => [spot.id, spot]));

export function getFishingSpotById(id: string): FishingSpotRecord | undefined {
  return SPOTS_BY_ID.get(id);
}

export function queryFishingSpots(query: SpotQuery = {}): FishingSpotRecord[] {
  const text = query.text ? normalise(query.text) : '';
  const species = query.species ? normalise(query.species) : '';
  const matches = FISHING_SPOTS.filter((spot) => {
    if (query.country && spot.country !== query.country) return false;
    if (query.coverageRegion && spot.coverageRegion !== query.coverageRegion) return false;
    if (query.type && spot.type !== query.type) return false;
    if (query.difficulty && spot.difficulty !== query.difficulty) return false;
    if (query.verification && spot.verification !== query.verification) return false;
    if (species && !spot.species.some((item) => normalise(item).includes(species))) return false;
    if (!text) return true;
    return [spot.name, spot.country, spot.region, spot.type, spot.difficulty, ...spot.species].some((item) => normalise(item).includes(text));
  });
  return matches
    .sort((a, b) => {
      const rank = { verified: 0, partially_verified: 1, unverified_demo: 2 };
      return rank[a.verification] - rank[b.verification] || a.name.localeCompare(b.name);
    })
    .slice(0, query.limit ?? matches.length);
}

export function listSpotFilterValues() {
  return {
    countries: [...new Set(FISHING_SPOTS.map((spot) => spot.country))].sort(),
    species: [...new Set(FISHING_SPOTS.flatMap((spot) => spot.species))].sort(),
  };
}
