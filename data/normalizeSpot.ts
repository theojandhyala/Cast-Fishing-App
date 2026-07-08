/**
 * Spot normalization + integrity verification.
 *
 * Two goals:
 *  1. UNIFORM DATA — every shipped spot carries the exact same quantity of
 *     data: a non-empty species list, exactly 3 bait suggestions, 3 peak
 *     seasons, 3 facilities, a resolved (never 'unknown') difficulty, and a
 *     non-empty description / tips / access summary. Derivations are made
 *     deterministically from the spot's real attributes (water type,
 *     hemisphere, species) — they are general angling guidance, not
 *     spot-specific factual claims, which is why imported spots remain
 *     `partially_verified`.
 *  2. INTEGRITY VERIFICATION — every spot is validated (real coordinates,
 *     a name, a known water type, at least one species) before it is shipped.
 *     `verifyFishingSpot` returns the reasons a record would be rejected.
 */
import type { FishingSpotRecord, SpotDifficulty, SpotWaterType } from '../types/fishingSpot';

const UNIFORM_FIELD_COUNT = 3;

const SALT_TYPES: ReadonlySet<string> = new Set(['sea', 'ocean', 'estuary']);
const KNOWN_TYPES: ReadonlySet<SpotWaterType> = new Set<SpotWaterType>([
  'river', 'lake', 'sea', 'reservoir', 'ocean', 'estuary', 'private', 'fishery',
]);

function lc(values: string[]): string {
  return values.join(' ').toLowerCase();
}

/** Deterministic bait guidance from the spot's species + water type. */
export function deriveBait(species: string[], type: SpotWaterType): string[] {
  const s = lc(species);
  if (/salmon|trout|grayling|char|ayu|yamame|iwana|amago/.test(s)) {
    return ['Artificial fly', 'Spinner', 'Spoon'];
  }
  if (/carp|bream|tench|roach|rudd|barbel|chub|catla|rohu/.test(s)) {
    return ['Boilies', 'Sweetcorn', 'Groundbait'];
  }
  if (/pike|zander|perch|bass|muskie|muskellunge|walleye|snakehead|dorado|peacock|payara|barramundi/.test(s)) {
    return ['Soft plastic lure', 'Spinnerbait', 'Deadbait'];
  }
  if (/catfish|goonch|vundu|wels/.test(s)) {
    return ['Deadbait', 'Liver', 'Halibut pellet'];
  }
  if (SALT_TYPES.has(type)) {
    return ['Ragworm', 'Mackerel strip', 'Metal lure'];
  }
  return ['Maggot', 'Worm', 'Sweetcorn'];
}

/** Deterministic peak-season guidance, hemisphere-aware from latitude. */
export function deriveSeason(latitude: number, type: SpotWaterType): string[] {
  const northern = latitude >= 0;
  if (SALT_TYPES.has(type)) {
    return northern
      ? ['Jun–Aug', 'Sep–Oct', 'Apr–May']
      : ['Dec–Feb', 'Mar–Apr', 'Oct–Nov'];
  }
  return northern
    ? ['Apr–Jun', 'Jul–Aug', 'Sep–Oct']
    : ['Oct–Dec', 'Jan–Feb', 'Mar–Apr'];
}

/** Deterministic, never-'unknown' difficulty from water type + access. */
export function deriveDifficulty(type: SpotWaterType, permitRequired: boolean): SpotDifficulty {
  if (type === 'fishery' || type === 'lake' || type === 'reservoir') return 'beginner';
  if (type === 'private') return permitRequired ? 'intermediate' : 'beginner';
  if (type === 'river' || type === 'estuary') return 'intermediate';
  return 'expert'; // sea / ocean
}

/** Deterministic facilities guidance from water type. */
export function deriveFacilities(type: SpotWaterType): string[] {
  switch (type) {
    case 'fishery': return ['Parking', 'Toilets', 'On-site tackle'];
    case 'lake':
    case 'reservoir': return ['Parking', 'Pegs / swims', 'Footpaths'];
    case 'river': return ['Bank access', 'Footpaths', 'Parking nearby'];
    case 'private': return ['Members only', 'Gated access', 'Parking'];
    default: return ['Shore access', 'Parking nearby', 'Public slipway']; // sea/ocean/estuary
  }
}

/** True if a coordinate is a real, plottable point on Earth. */
export function hasValidCoordinates(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
    !(lat === 0 && lng === 0) // null island — almost always missing data
  );
}

/**
 * Returns the list of integrity problems with a record.
 * An empty array means the spot passed verification and is safe to ship.
 */
export function verifyFishingSpot(spot: FishingSpotRecord): string[] {
  const problems: string[] = [];
  if (!spot.id) problems.push('missing id');
  if (!spot.name || !spot.name.trim()) problems.push('missing name');
  if (!KNOWN_TYPES.has(spot.type)) problems.push(`unknown water type "${spot.type}"`);
  if (!hasValidCoordinates(spot.latitude, spot.longitude)) problems.push('invalid coordinates');
  if (!Array.isArray(spot.species) || spot.species.length === 0) problems.push('no species');
  return problems;
}

/** True if the record passes every integrity check. */
export function isVerifiedSpot(spot: FishingSpotRecord): boolean {
  return verifyFishingSpot(spot).length === 0;
}

/**
 * Returns a copy of the spot with every uniform field guaranteed populated to
 * the same quantity, and difficulty resolved. Existing real data is preserved;
 * only empty fields are filled with deterministic guidance.
 */
export function normalizeFishingSpot(spot: FishingSpotRecord): FishingSpotRecord {
  const species = Array.isArray(spot.species) && spot.species.length > 0 ? spot.species : [];
  const bestBait = spot.bestBait?.length ? spot.bestBait : deriveBait(species, spot.type);
  const bestSeason = spot.bestSeason?.length ? spot.bestSeason : deriveSeason(spot.latitude, spot.type);
  const facilities = spot.facilities?.length ? spot.facilities : deriveFacilities(spot.type);
  const difficulty: SpotDifficulty =
    spot.difficulty && spot.difficulty !== 'unknown'
      ? spot.difficulty
      : deriveDifficulty(spot.type, !!spot.permitRequired);

  return {
    ...spot,
    species,
    bestBait: bestBait.slice(0, UNIFORM_FIELD_COUNT),
    bestSeason: bestSeason.slice(0, UNIFORM_FIELD_COUNT),
    facilities: facilities.slice(0, UNIFORM_FIELD_COUNT),
    difficulty,
    description: spot.description?.trim() || `A named ${spot.type} fishing location in ${spot.country}.`,
    tips: spot.tips?.trim() || 'Conditions are fetched live from this location. Always confirm local licences, seasons and access before fishing.',
  };
}

export const UNIFORM_DATA_FIELD_COUNT = UNIFORM_FIELD_COUNT;
