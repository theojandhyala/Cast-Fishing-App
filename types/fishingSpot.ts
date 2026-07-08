export type SpotWaterType = 'river' | 'lake' | 'sea' | 'reservoir' | 'ocean' | 'estuary' | 'private' | 'fishery';
export type SpotDifficulty = 'beginner' | 'intermediate' | 'expert' | 'unknown';
export type SpotVerification = 'verified' | 'partially_verified' | 'unverified_demo';
export type CoordinatePrecision = 'access_point' | 'named_feature' | 'waterbody_centroid' | 'regional_centroid';

export interface SpotSource {
  title: string;
  url: string;
  publisher: string;
  checkedAt: string;
  supports: Array<'identity' | 'coordinates' | 'species' | 'access' | 'regulations'>;
}

export interface SpotAccess {
  summary: string;
  permit: 'required' | 'not_required' | 'varies' | 'unknown';
  restrictions?: string[];
  officialUrl?: string;
}

export interface FishingSpotRecord {
  id: string;
  name: string;
  country: string;
  region: string;
  coverageRegion: 'uk_ireland' | 'europe' | 'north_america' | 'australia_nz' | 'south_africa' | 'japan' | 'brazil_amazon' | 'india' | 'oceans';
  continent: string;
  type: SpotWaterType;
  latitude: number;
  longitude: number;
  coordinatePrecision: CoordinatePrecision;
  species: string[];
  bestBait: string[];
  bestSeason: string[];
  difficulty: SpotDifficulty;
  access: SpotAccess;
  description: string;
  tips: string;
  facilities: string[];
  verification: SpotVerification;
  verificationNotes: string;
  sources: SpotSource[];
  dataset: 'curated_seed' | 'legacy_demo' | 'imported';
  updatedAt: string;
  /** Compatibility-only editorial score. It is not a live user rating. */
  rating: number;
  permitRequired: boolean;
}

export interface SpotCoverageRegion {
  id: FishingSpotRecord['coverageRegion'];
  label: string;
  target: number;
  curated: number;
  verified: number;
  partial: number;
  demo: number;
}

export interface SpotDatasetMetadata {
  version: string;
  releasedAt: string;
  targetCount: number;
  totalAvailable: number;
  curatedCount: number;
  verifiedCount: number;
  partiallyVerifiedCount: number;
  unverifiedDemoCount: number;
  disclaimer: string;
  coverage: SpotCoverageRegion[];
}
