export const FISH_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;

export type FishRarity = (typeof FISH_RARITIES)[number];

export type FishRegion =
  | 'UK & Ireland'
  | 'Europe'
  | 'North America'
  | 'Australia'
  | 'New Zealand'
  | 'South Africa'
  | 'Japan'
  | 'Amazon'
  | 'India'
  | 'Atlantic Ocean'
  | 'Pacific Ocean'
  | 'Indian Ocean'
  | 'Arctic Ocean'
  | 'Southern Ocean'
  | 'Worldwide';

export type WaterType = 'freshwater' | 'saltwater' | 'brackish' | 'anadromous';

export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered'
  | 'Extinct in the Wild'
  | 'Data Deficient'
  | 'Not Evaluated'
  | 'Unknown';

export type RecordVerificationStatus = 'verified' | 'provisional' | 'unverified' | 'no-record';

export interface FishSource {
  label: string;
  url?: string;
  accessedAt?: string;
  scope: 'taxonomy' | 'distribution' | 'conservation' | 'record' | 'general';
}

export interface FishRecord {
  weightKg: number | null;
  lengthCm: number | null;
  angler: string | null;
  location: string | null;
  date: string | null;
  authority: string | null;
  sourceUrl: string | null;
  status: RecordVerificationStatus;
  note?: string;
}

export interface FishSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  alternateNames: string[];
  regions: FishRegion[];
  waterType: WaterType;
  habitats: string[];
  bestBaits: string[];
  seasons: string[];
  conservationStatus: ConservationStatus;
  conservationAssessment: {
    authority: string | null;
    assessmentUrl: string | null;
    assessedAt: string | null;
  };
  rarity: FishRarity;
  xp: number;
  record: FishRecord;
  sources: FishSource[];
  dataQuality: 'verified' | 'partial' | 'catalogue-only';
  notes?: string;
}

export interface FishFilters {
  query?: string;
  region?: FishRegion | 'all';
  waterType?: WaterType | 'all';
  rarity?: FishRarity | 'all';
  conservationStatus?: ConservationStatus | 'all';
  recordStatus?: RecordVerificationStatus | 'all';
}
