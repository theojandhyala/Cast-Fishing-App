/**
 * Geographic species enrichment.
 * Given a coordinate and water type, returns a realistic list of species.
 * If the spot already has species data, those are returned unchanged.
 */

type Region =
  | 'uk_ireland'
  | 'scandinavia'
  | 'western_europe'
  | 'eastern_europe'
  | 'russia_siberia'
  | 'north_america_north'
  | 'north_america_south'
  | 'central_america'
  | 'south_america_amazon'
  | 'south_america_south'
  | 'west_africa'
  | 'east_africa'
  | 'southern_africa'
  | 'middle_east'
  | 'south_asia'
  | 'southeast_asia'
  | 'east_asia'
  | 'japan'
  | 'australia'
  | 'new_zealand'
  | 'pacific_islands'
  | 'arctic'
  | 'worldwide';

export function getRegion(lat: number, lng: number): Region {
  if (lat > 68) return 'arctic';
  if (lat >= 49 && lat <= 61 && lng >= -11 && lng <= 2) return 'uk_ireland';
  if (lat >= 30 && lat <= 46 && lng >= 129 && lng <= 146) return 'japan';
  if (lat >= -47 && lat <= -34 && lng >= 166 && lng <= 178) return 'new_zealand';
  if (lat >= -45 && lat <= -10 && lng >= 110 && lng <= 155) return 'australia';
  if (lat >= 55 && lat <= 72 && lng >= 4 && lng <= 32) return 'scandinavia';
  if (lat >= 36 && lat <= 55 && lng >= -10 && lng <= 20) return 'western_europe';
  if (lat >= 44 && lat <= 55 && lng >= 20 && lng <= 40) return 'eastern_europe';
  if (lat >= 50 && lat <= 75 && lng >= 40 && lng <= 180) return 'russia_siberia';
  if (lat >= 50 && lat <= 72 && lng >= -170 && lng <= -50) return 'north_america_north';
  if (lat >= 25 && lat <= 50 && lng >= -130 && lng <= -50) return 'north_america_south';
  if (lat >= 8 && lat <= 25 && lng >= -120 && lng <= -60) return 'central_america';
  if (lat >= -10 && lat <= 10 && lng >= -80 && lng <= -44) return 'south_america_amazon';
  if (lat >= -55 && lat <= -10 && lng >= -80 && lng <= -34) return 'south_america_south';
  if (lat >= -5 && lat <= 20 && lng >= -20 && lng <= 10) return 'west_africa';
  if (lat >= -15 && lat <= 15 && lng >= 30 && lng <= 50) return 'east_africa';
  if (lat >= -35 && lat <= -15 && lng >= 10 && lng <= 40) return 'southern_africa';
  if (lat >= 15 && lat <= 40 && lng >= 35 && lng <= 65) return 'middle_east';
  if (lat >= 5 && lat <= 35 && lng >= 65 && lng <= 95) return 'south_asia';
  if (lat >= -10 && lat <= 25 && lng >= 95 && lng <= 145) return 'southeast_asia';
  if (lat >= 20 && lat <= 55 && lng >= 100 && lng <= 145) return 'east_asia';
  if (
    (lat >= -25 && lat <= 25 && lng >= 145 && lng <= 180) ||
    (lat >= -25 && lat <= 25 && lng >= -180 && lng <= -100)
  ) return 'pacific_islands';
  return 'worldwide';
}

const FRESHWATER_SPECIES: Record<string, string[]> = {
  uk_ireland: ['Carp', 'Pike', 'Perch', 'Bream', 'Roach', 'Tench', 'Barbel', 'Chub', 'Dace', 'Rudd', 'Eel', 'Bleak', 'Gudgeon'],
  uk_ireland_salmon: ['Atlantic Salmon', 'Sea Trout', 'Brown Trout', 'Rainbow Trout', 'Grayling', 'Arctic Char'],
  scandinavia: ['Atlantic Salmon', 'Sea Trout', 'Brown Trout', 'Grayling', 'Arctic Char', 'Pike', 'Perch', 'Zander', 'Burbot', 'Ide'],
  scandinavia_salmon: ['Atlantic Salmon', 'Sea Trout', 'Brown Trout', 'Arctic Char', 'Grayling'],
  western_europe: ['Carp', 'Pike', 'Perch', 'Bream', 'Roach', 'Zander', 'Barbel', 'Chub', 'Tench', 'Brown Trout', 'Grayling'],
  eastern_europe: ['Carp', 'Pike', 'Zander', 'Perch', 'Bream', 'Roach', 'Wels Catfish', 'Asp', 'Nase', 'Tench', 'Bleak'],
  russia_siberia: ['Taimen', 'Lenok', 'Grayling', 'Pike', 'Perch', 'Burbot', 'Ide', 'Chub', 'Bream', 'Zander', 'Sterlet', 'Siberian Salmon'],
  north_america_north: ['Walleye', 'Northern Pike', 'Muskellunge', 'Lake Trout', 'Brook Trout', 'Brown Trout', 'Smallmouth Bass', 'Largemouth Bass', 'Yellow Perch', 'Crappie', 'Bluegill', 'Channel Catfish', 'Chinook Salmon', 'Coho Salmon', 'Steelhead'],
  north_america_north_salmon: ['Chinook Salmon', 'Coho Salmon', 'Steelhead', 'Brook Trout', 'Lake Trout'],
  north_america_south: ['Largemouth Bass', 'Smallmouth Bass', 'Striped Bass', 'Walleye', 'Catfish', 'Crappie', 'Bluegill', 'Sunfish', 'Carp', 'Trout', 'Muskellunge', 'Redfish'],
  central_america: ['Tarpon', 'Snook', 'Machaca', 'Guapote', 'Mojarra', 'Catfish', 'Peacock Bass'],
  south_america_amazon: ['Peacock Bass', 'Payara', 'Piranha', 'Arapaima', 'Dorado', 'Catfish', 'Tambaqui', 'Golden Dorado', 'Surubi'],
  south_america_south: ['Golden Dorado', 'Brown Trout', 'Rainbow Trout', 'Pejerrey', 'Boga', 'Dorado', 'Tararira', 'Pacú'],
  south_asia: ['Mahseer', 'Catla', 'Rohu', 'Mrigal', 'Giant Snakehead', 'Catfish', 'Murrel', 'Goonch', 'Hilsa', 'Trout'],
  southeast_asia: ['Giant Snakehead', 'Giant Gourami', 'Mekong Giant Catfish', 'Barb', 'Tilapia', 'Snakehead', 'Featherback', 'Hampala Barb'],
  east_asia: ['Grass Carp', 'Silver Carp', 'Bighead Carp', 'Common Carp', 'Crucian Carp', 'Mandarin Fish', 'Snakehead', 'Yellow Catfish', 'Ayu'],
  japan: ['Ayu', 'Yamame', 'Iwana', 'Amago', 'Rainbow Trout', 'Carp', 'Crucian Carp', 'Catfish', 'Eel', 'Landlocked Salmon'],
  australia: ['Murray Cod', 'Golden Perch', 'Silver Perch', 'Barramundi', 'Flathead', 'Bream', 'Australian Bass', 'Redfin', 'Trout', 'Carp', 'Catfish', 'Saratoga'],
  new_zealand: ['Brown Trout', 'Rainbow Trout', 'Chinook Salmon', 'Perch', 'Tench', 'Rudd', 'Eel', 'Smelt'],
  west_africa: ['Nile Tilapia', 'African Catfish', 'Nile Perch', 'Clarias Catfish', 'Tigerfish', 'Bream', 'Labeo'],
  east_africa: ['Nile Perch', 'Tilapia', 'Tigerfish', 'Vundu', 'Yellow-Belly', 'Barbus', 'Squeaker Catfish'],
  southern_africa: ['Tigerfish', 'Vundu', 'Bream', 'Catfish', 'Yellow-Belly', 'Sharptooth Catfish', 'Rainbow Trout', 'Yellowfish'],
  middle_east: ['Carp', 'Catfish', 'Barbel', 'Tilapia', 'Binni', 'Himri'],
  arctic: ['Arctic Char', 'Grayling', 'Lake Trout', 'Burbot', 'Pike', 'Brown Trout'],
  worldwide: ['Carp', 'Perch', 'Pike', 'Bream', 'Trout'],
};

const SALTWATER_SPECIES: Record<string, string[]> = {
  uk_ireland: ['Cod', 'Bass', 'Mackerel', 'Pollock', 'Wrasse', 'Flounder', 'Plaice', 'Dab', 'Whiting', 'Conger Eel', 'Tope', 'Smoothhound', 'Thornback Ray', 'Mullet'],
  scandinavia: ['Cod', 'Haddock', 'Pollock', 'Coalfish', 'Sea Trout', 'Atlantic Salmon', 'Halibut', 'Wolffish', 'Mackerel', 'Herring'],
  western_europe: ['Sea Bass', 'Sea Bream', 'Mackerel', 'Tuna', 'Bonito', 'Mullet', 'Flounder', 'Sole', 'Turbot', 'Conger Eel'],
  eastern_europe: ['Black Sea Bass', 'Mullet', 'Bluefish', 'Turbot', 'Whiting', 'Garfish'],
  russia_siberia: ['Cod', 'Halibut', 'Arctic Char', 'Wolffish'],
  north_america_north: ['Striped Bass', 'Bluefish', 'Flounder', 'Black Sea Bass', 'Tautog', 'Atlantic Cod', 'Pollock', 'Halibut', 'Pacific Salmon'],
  north_america_south: ['Red Drum', 'Snook', 'Spotted Sea Trout', 'Flounder', 'Tarpon', 'Permit', 'Bonefish', 'Mahi-Mahi', 'Wahoo', 'Kingfish', 'Grouper', 'Snapper'],
  central_america: ['Tarpon', 'Snook', 'Permit', 'Bonefish', 'Mahi-Mahi', 'Sailfish', 'Marlin', 'Roosterfish'],
  south_america_amazon: ['Tarpon', 'Snook', 'Sawfish'],
  south_america_south: ['Patagonian Toothfish', 'Sea Trout', 'Kingclip', 'Robalo', 'Corvina', 'Pejerrey'],
  south_asia: ['Indian Mackerel', 'Pomfret', 'Grouper', 'Snapper', 'Barracuda', 'Kingfish', 'Tuna', 'Sailfish', 'Marlin'],
  southeast_asia: ['Grouper', 'Snapper', 'Barracuda', 'Trevally', 'Queenfish', 'Giant Trevally', 'Cobia', 'Mahi-Mahi', 'Wahoo'],
  east_asia: ['Yellowtail', 'Sea Bream', 'Flatfish', 'Rockfish', 'Mackerel', 'Tuna', 'Grouper', 'Snapper'],
  japan: ['Yellowtail', 'Amberjack', 'Sea Bream', 'Flatfish', 'Rockfish', 'Mackerel', 'Tuna', 'Bonito'],
  australia: ['Barramundi', 'Mangrove Jack', 'Golden Trevally', 'Giant Trevally', 'Coral Trout', 'Snapper', 'Bream', 'Whiting', 'Flathead', 'Mackerel', 'Mahi-Mahi', 'Marlin', 'Tuna'],
  new_zealand: ['Snapper', 'Kingfish', 'John Dory', 'Kahawai', 'Trevally', 'Blue Cod', 'Groper', 'Bluefin Tuna'],
  west_africa: ['Barracuda', 'Trevally', 'Snapper', 'Grouper', 'Bonefish', 'Permit'],
  east_africa: ['Sailfish', 'Marlin', 'Yellowfin Tuna', 'Mahi-Mahi', 'Wahoo', 'Giant Trevally', 'Bonefish', 'Barracuda'],
  southern_africa: ['Yellowfin Tuna', 'Dorado', 'Marlin', 'Sailfish', 'Yellowtail', 'Kob', 'Cob', 'Garrick', 'Shad'],
  middle_east: ['Grouper', 'Snapper', 'Barracuda', 'Kingfish', 'Cobia', 'Queenfish'],
  pacific_islands: ['Giant Trevally', 'Bonefish', 'Permit', 'Mahi-Mahi', 'Marlin', 'Sailfish', 'Wahoo', 'Bluefin Trevally'],
  arctic: ['Arctic Char', 'Cod', 'Halibut', 'Wolffish'],
  worldwide: ['Bass', 'Mackerel', 'Snapper', 'Grouper', 'Tuna'],
};

const SALMON_RIVER_REGIONS = new Set<Region>(['uk_ireland', 'scandinavia', 'north_america_north']);

export function enrichSpecies(lat: number, lng: number, waterType: string, existing: string[]): string[] {
  if (existing.length > 0) return existing;
  const region = getRegion(lat, lng);
  const isSalt = ['sea', 'ocean', 'estuary'].includes(waterType);
  const base = isSalt
    ? (SALTWATER_SPECIES[region] ?? SALTWATER_SPECIES.worldwide)
    : (FRESHWATER_SPECIES[region] ?? FRESHWATER_SPECIES.worldwide);

  if (waterType === 'river' && SALMON_RIVER_REGIONS.has(region)) {
    const salmonKey = `${region}_salmon`;
    const salmonSpecies: string[] = FRESHWATER_SPECIES[salmonKey] ?? [];
    return [...new Set([...salmonSpecies.slice(0, 3), ...base])].slice(0, 8);
  }

  return base.slice(0, 8);
}
