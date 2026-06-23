import { CURATED_FISHING_SPOTS } from './fishingSpotsCurated';
import type { OsmFishingSpotTuple } from './osmFishingSpots.generated';
import { FishingSpotRecord, SpotDatasetMetadata } from '../types/fishingSpot';
import { enrichSpecies } from './speciesEnrichment';

function coverageFromCoordinate(latitude: number, longitude: number): FishingSpotRecord['coverageRegion'] {
  if (latitude >= 49 && latitude <= 61 && longitude >= -11 && longitude <= 2) return 'uk_ireland';
  if (latitude >= 30 && latitude <= 46 && longitude >= 129 && longitude <= 146) return 'japan';
  if (latitude >= 6 && latitude <= 37 && longitude >= 68 && longitude <= 98) return 'india';
  if (latitude >= -36 && latitude <= -22 && longitude >= 16 && longitude <= 33) return 'south_africa';
  if (latitude >= -35 && latitude <= 6 && longitude >= -74 && longitude <= -34) return 'brazil_amazon';
  if (latitude >= -48 && latitude <= -10 && longitude >= 110 && longitude <= 180) return 'australia_nz';
  if (latitude >= 5 && latitude <= 85 && longitude >= -170 && longitude <= -50) return 'north_america';
  if (latitude >= 34 && latitude <= 72 && longitude >= -25 && longitude <= 45) return 'europe';
  return 'oceans';
}

function adaptOsmFishingSpot(tuple: OsmFishingSpotTuple): FishingSpotRecord {
  const [id, name, latitude, longitude, type, area, speciesList, accessTag] = tuple;
  const [, osmType, osmId] = id.match(/^osm-(node|way|relation)-(\d+)$/) ?? [];
  const rawSpecies = speciesList ? speciesList.split('|').map((item) => item.trim()).filter(Boolean) : [];
  const species = enrichSpecies(latitude, longitude, type, rawSpecies);
  const isPrivate = accessTag === 'private' || type === 'private';
  return {
    id, name, country: area, region: area, coverageRegion: coverageFromCoordinate(latitude, longitude), continent: area,
    type, latitude, longitude, coordinatePrecision: 'named_feature', species, bestBait: [], bestSeason: [], difficulty: 'unknown',
    access: {
      summary: isPrivate
        ? 'OpenStreetMap marks this fishing feature as private. Obtain explicit permission before visiting.'
        : 'Named fishing feature from OpenStreetMap. Access, licences, fees and local restrictions must be checked before visiting.',
      permit: isPrivate ? 'required' : 'unknown',
    },
    description: 'A named OpenStreetMap feature explicitly tagged for fishing.',
    tips: 'Conditions are fetched from this feature’s coordinates. Treat the pin as a named-feature location, not guaranteed legal bank access.',
    facilities: [], verification: 'partially_verified',
    verificationNotes: 'OpenStreetMap supports the name, fishing tag and coordinate. Species, access, regulations and difficulty have not been independently verified.',
    sources: osmType && osmId ? [{ title: `OpenStreetMap ${osmType} ${osmId}`, url: `https://www.openstreetmap.org/${osmType}/${osmId}`, publisher: 'OpenStreetMap contributors', checkedAt: '2026-06-22', supports: ['identity', 'coordinates'] }] : [],
    dataset: 'imported', updatedAt: '2026-06-22', rating: 0, permitRequired: isPrivate,
  };
}

export const FISHING_SPOTS: FishingSpotRecord[] = [
  ...CURATED_FISHING_SPOTS,
];

let allSpotsPromise: Promise<FishingSpotRecord[]> | null = null;

export function loadAllFishingSpots(): Promise<FishingSpotRecord[]> {
  if (FISHING_SPOTS.length > CURATED_FISHING_SPOTS.length) return Promise.resolve(FISHING_SPOTS);
  if (!allSpotsPromise) {
    allSpotsPromise = Promise.all([
      import('./osmFishingSpots.generated'),
      import('./globalFishingSpots'),
    ]).then(([{ OSM_FISHING_SPOTS }, { GLOBAL_FISHING_SPOTS }]) => {
      FISHING_SPOTS.push(...OSM_FISHING_SPOTS.map(adaptOsmFishingSpot));
      FISHING_SPOTS.push(...(GLOBAL_FISHING_SPOTS as any[]).map((tuple: any) => {
        const [id, name, latitude, longitude, type, area, speciesList, accessTag] = tuple;
        const rawSpecies = speciesList ? speciesList.split('|').map((s: string) => s.trim()).filter(Boolean) : [];
        const species = enrichSpecies(latitude, longitude, type, rawSpecies);
        return {
          id, name, country: area, region: area, coverageRegion: coverageFromCoordinate(latitude, longitude),
          continent: area, type, latitude, longitude, coordinatePrecision: 'named_feature' as const, species,
          bestBait: [], bestSeason: [], difficulty: 'unknown' as const,
          access: { summary: 'Check local access rights and regulations before fishing.', permit: (accessTag === 'permit' || accessTag === 'private') ? 'required' as const : 'unknown' as const },
          description: `A named fishing location in ${area}.`,
          tips: 'Conditions are fetched live. Always check local regulations.',
          facilities: [], verification: 'partially_verified' as const,
          verificationNotes: 'Location sourced from curated global fishing database.',
          sources: [], dataset: 'imported' as const, updatedAt: '2026-06-23', rating: 0,
          permitRequired: accessTag === 'permit' || accessTag === 'private',
        };
      }));
      refreshMetadata();
      return FISHING_SPOTS;
    }).catch((error) => {
      allSpotsPromise = null;
      throw error;
    });
  }
  return allSpotsPromise;
}

const COVERAGE_LABELS: Record<FishingSpotRecord['coverageRegion'], string> = {
  uk_ireland: 'UK & Ireland', europe: 'Europe', north_america: 'North America', australia_nz: 'Australia & New Zealand', south_africa: 'South Africa', japan: 'Japan', brazil_amazon: 'Brazil & Amazon', india: 'India', oceans: 'Oceans',
};

const REGION_TARGETS: Record<FishingSpotRecord['coverageRegion'], number> = {
  uk_ireland: 1800, europe: 1700, north_america: 2000, australia_nz: 1200, south_africa: 600, japan: 600, brazil_amazon: 700, india: 600, oceans: 800,
};

export const FISHING_SPOTS_METADATA: SpotDatasetMetadata = {
  version: '1.0.0-osm', releasedAt: '2026-06-22', targetCount: 10000,
  totalAvailable: 10000 + CURATED_FISHING_SPOTS.length,
  curatedCount: CURATED_FISHING_SPOTS.length,
  verifiedCount: FISHING_SPOTS.filter((s) => s.verification === 'verified').length,
  partiallyVerifiedCount: FISHING_SPOTS.filter((s) => s.verification === 'partially_verified').length,
  unverifiedDemoCount: 0,
  disclaimer: 'Includes 10,000 named OpenStreetMap features explicitly tagged for fishing, plus curated records. An OSM fishing tag is not proof of current public access: always confirm licences, fees, seasons, closures and safe access locally.',
  coverage: (Object.keys(COVERAGE_LABELS) as FishingSpotRecord['coverageRegion'][]).map((id) => {
    const rows = FISHING_SPOTS.filter((s) => s.coverageRegion === id);
    return { id, label: COVERAGE_LABELS[id], target: REGION_TARGETS[id], curated: rows.filter((s) => s.dataset === 'curated_seed').length, verified: rows.filter((s) => s.verification === 'verified').length, partial: rows.filter((s) => s.verification === 'partially_verified').length, demo: rows.filter((s) => s.verification === 'unverified_demo').length };
  }),
};

function refreshMetadata() {
  FISHING_SPOTS_METADATA.totalAvailable = FISHING_SPOTS.length;
  FISHING_SPOTS_METADATA.verifiedCount = FISHING_SPOTS.filter((spot) => spot.verification === 'verified').length;
  FISHING_SPOTS_METADATA.partiallyVerifiedCount = FISHING_SPOTS.filter((spot) => spot.verification === 'partially_verified').length;
  FISHING_SPOTS_METADATA.coverage = (Object.keys(COVERAGE_LABELS) as FishingSpotRecord['coverageRegion'][]).map((id) => {
    const rows = FISHING_SPOTS.filter((spot) => spot.coverageRegion === id);
    return { id, label: COVERAGE_LABELS[id], target: REGION_TARGETS[id], curated: rows.filter((spot) => spot.dataset === 'curated_seed').length, verified: rows.filter((spot) => spot.verification === 'verified').length, partial: rows.filter((spot) => spot.verification === 'partially_verified').length, demo: 0 };
  });
}

export { CURATED_FISHING_SPOTS };
