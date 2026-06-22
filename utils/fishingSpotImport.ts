import { FishingSpotRecord } from '../types/fishingSpot';

export interface SpotImportResult {
  accepted: FishingSpotRecord[];
  errors: Array<{ index: number; message: string }>;
}

/**
 * Strict ingestion gate for reviewed JSON exports. It deliberately rejects
 * source-free records claiming to be verified and invalid coordinates. This
 * does not geocode or invent rows; upstream research remains human-reviewed.
 */
export function validateFishingSpotImport(input: unknown): SpotImportResult {
  if (!Array.isArray(input)) return { accepted: [], errors: [{ index: -1, message: 'Import must be a JSON array.' }] };

  const accepted: FishingSpotRecord[] = [];
  const errors: SpotImportResult['errors'] = [];
  const ids = new Set<string>();

  input.forEach((candidate, index) => {
    if (!candidate || typeof candidate !== 'object') {
      errors.push({ index, message: 'Record must be an object.' });
      return;
    }
    const spot = candidate as Partial<FishingSpotRecord>;
    if (!spot.id || !spot.name || !spot.country) {
      errors.push({ index, message: 'id, name and country are required.' });
      return;
    }
    if (ids.has(spot.id)) {
      errors.push({ index, message: `Duplicate id: ${spot.id}` });
      return;
    }
    if (typeof spot.latitude !== 'number' || spot.latitude < -90 || spot.latitude > 90 || typeof spot.longitude !== 'number' || spot.longitude < -180 || spot.longitude > 180) {
      errors.push({ index, message: 'Coordinates are missing or outside valid latitude/longitude bounds.' });
      return;
    }
    if (spot.verification === 'verified' && (!spot.sources?.length || spot.sources.some((source) => !source.url || !source.checkedAt || !source.supports.length))) {
      errors.push({ index, message: 'Verified records require complete provenance sources.' });
      return;
    }
    if (!spot.species?.length || !spot.access || !spot.coordinatePrecision || !spot.verification) {
      errors.push({ index, message: 'species, access, coordinatePrecision and verification are required.' });
      return;
    }
    ids.add(spot.id);
    accepted.push(spot as FishingSpotRecord);
  });

  return { accepted, errors };
}
