import { CoordinatePrecision, FishingSpotRecord } from '../types/fishingSpot';

const CHECKED = '2026-06-22';

/**
 * Human-curated seed records. Coordinates identify the named feature (or a
 * documented public facility), never a secret swim. A `verified` record has an
 * authoritative fishing/access source; `partially_verified` records must be
 * rechecked before the app makes access or regulation claims.
 */
export const CURATED_FISHING_SPOTS: FishingSpotRecord[] = [
  {
    id: 'curated-babbacombe-beach', name: 'Babbacombe Beach', country: 'United Kingdom', region: 'Torquay, Devon', coverageRegion: 'uk_ireland', continent: 'Europe', type: 'sea',
    latitude: 50.479351, longitude: -3.509555, coordinatePrecision: 'named_feature', species: ['Mackerel', 'Whiting', 'Red Mullet', 'Black Bream'], bestBait: ['Feathers', 'Fish strips', 'Ragworm'], bestSeason: ['Spring', 'Summer', 'Autumn'], difficulty: 'intermediate',
    access: { summary: 'Beach and breakwater access via a very steep road; parking near the beach is limited. Confirm safe and permitted fishing positions locally.', permit: 'varies', restrictions: ['Do not obstruct beach, diving or boat access', 'Check current local notices and sea conditions'], officialUrl: 'https://www.tor-bay-harbour.co.uk/leisure/angling/' },
    description: 'Small shingle beach below Babbacombe Downs, listed by Tor Bay Harbour as one of Torbay’s top onshore fishing sites.', tips: 'The harbour authority lists Mackerel, Whiting, Red Mullet and Black Bream as the main catches. The road is steep and coastal conditions can change quickly.', facilities: ['Seasonal toilets', 'Cafe', 'Slipway', 'Limited nearby parking'], verification: 'verified', verificationNotes: 'Fishing status and catches checked against Tor Bay Harbour; access and facilities checked against Torbay Council. Coordinates identify Babbacombe Beach in OpenStreetMap.',
    sources: [
      { title: 'Angling in Tor Bay', url: 'https://www.tor-bay-harbour.co.uk/leisure/angling/', publisher: 'Tor Bay Harbour Authority', checkedAt: CHECKED, supports: ['identity', 'species', 'access'] },
      { title: 'Babbacombe Beach', url: 'https://www.torbay.gov.uk/leisure-sports-and-community/beaches/find-a-beach/babbacombe-beach/', publisher: 'Torbay Council', checkedAt: CHECKED, supports: ['identity', 'access'] },
      { title: 'OpenStreetMap feature 167071023', url: 'https://www.openstreetmap.org/way/167071023', publisher: 'OpenStreetMap contributors', checkedAt: CHECKED, supports: ['identity', 'coordinates'] },
    ], dataset: 'curated_seed', updatedAt: CHECKED, rating: 4.7, permitRequired: false,
  },
  {
    id: 'curated-grafham-water', name: 'Grafham Water', country: 'United Kingdom', region: 'Cambridgeshire', coverageRegion: 'uk_ireland', continent: 'Europe', type: 'reservoir',
    latitude: 52.2902, longitude: -0.3192, coordinatePrecision: 'named_feature', species: ['Rainbow Trout', 'Brown Trout'], bestBait: ['Artificial flies'], bestSeason: ['Spring', 'Summer', 'Autumn', 'Winter'], difficulty: 'intermediate',
    access: { summary: 'Bank and boat fly fishing; buy the required fishery permit from the operator.', permit: 'required', officialUrl: 'https://anglianwaterparks.co.uk/grafham-water-park/trout-fishing' },
    description: 'Large managed trout reservoir with bank and boat fishing.', tips: 'Check current season dates, wind limits and permit options before travel.', facilities: ['Fishing lodge', 'Tackle shop', 'Boat hire', 'Cafe'], verification: 'verified', verificationNotes: 'Fishing methods, permit sales and facilities checked against the operator page. Coordinate marks the named reservoir, not a swim.',
    sources: [{ title: 'Grafham Water Trout Fishing', url: 'https://anglianwaterparks.co.uk/grafham-water-park/trout-fishing', publisher: 'Anglian Water Parks', checkedAt: CHECKED, supports: ['identity', 'species', 'access', 'regulations'] }], dataset: 'curated_seed', updatedAt: CHECKED, rating: 4.5, permitRequired: true,
  },
  {
    id: 'curated-kielder-water', name: 'Kielder Water', country: 'United Kingdom', region: 'Northumberland', coverageRegion: 'uk_ireland', continent: 'Europe', type: 'reservoir',
    latitude: 55.1837, longitude: -2.4916, coordinatePrecision: 'waterbody_centroid', species: ['Rainbow Trout', 'Brown Trout'], bestBait: ['Artificial flies', 'Lures'], bestSeason: ['Spring', 'Summer', 'Autumn'], difficulty: 'intermediate',
    access: { summary: 'Managed boat fishery; permits are required and available online or at visitor centres.', permit: 'required', officialUrl: 'https://www.visitkielder.com/See-and-do/fishing/' }, description: 'Large Northumberland reservoir operated as a boat fishery.', tips: 'Read boat age, occupancy and weather restrictions before booking.', facilities: ['Visitor centre', 'Permit sales', 'Boat hire'], verification: 'verified', verificationNotes: 'Access and permit details checked against the destination operator page.',
    sources: [{ title: 'Fishing at Kielder', url: 'https://www.visitkielder.com/See-and-do/fishing/', publisher: 'Visit Kielder', checkedAt: CHECKED, supports: ['identity', 'access', 'regulations'] }], dataset: 'curated_seed', updatedAt: CHECKED, rating: 4.3, permitRequired: true,
  },
  {
    id: 'curated-lake-taupo', name: 'Lake Taupo', country: 'New Zealand', region: 'Waikato', coverageRegion: 'australia_nz', continent: 'Oceania', type: 'lake',
    latitude: -38.7850, longitude: 175.8960, coordinatePrecision: 'waterbody_centroid', species: ['Rainbow Trout', 'Brown Trout'], bestBait: ['Artificial flies', 'Lures'], bestSeason: ['Year-round'], difficulty: 'intermediate',
    access: { summary: 'A dedicated Taupo fishing licence is required; ordinary New Zealand Fish & Game licences are not valid here.', permit: 'required', officialUrl: 'https://www.lovetaupo.com/en/see-do/outdoor-adventure/fishing/how-to-get-a-lake-taupo-fishing-licence/' }, description: 'New Zealand’s largest lake and a renowned wild trout fishery.', tips: 'Check the Taupo district regulations and method restrictions for the exact water before fishing.', facilities: ['Shore access areas', 'Boat ramps', 'Charters'], verification: 'verified', verificationNotes: 'Fishery, species and special licence requirement checked against Taupo official visitor information.',
    sources: [{ title: 'Lake Taupo fishing licence', url: 'https://www.lovetaupo.com/en/see-do/outdoor-adventure/fishing/how-to-get-a-lake-taupo-fishing-licence/', publisher: 'Destination Great Lake Taupo', checkedAt: CHECKED, supports: ['identity', 'species', 'access', 'regulations'] }], dataset: 'curated_seed', updatedAt: CHECKED, rating: 4.9, permitRequired: true,
  },
  {
    id: 'curated-yellowstone-lake', name: 'Yellowstone Lake', country: 'United States', region: 'Wyoming', coverageRegion: 'north_america', continent: 'North America', type: 'lake',
    latitude: 44.4280, longitude: -110.3650, coordinatePrecision: 'waterbody_centroid', species: ['Yellowstone Cutthroat Trout', 'Lake Trout'], bestBait: ['Lead-free artificial lures', 'Artificial flies'], bestSeason: ['Summer', 'Autumn'], difficulty: 'expert',
    access: { summary: 'A Yellowstone National Park fishing permit is required for anglers aged 16 and over; park-specific tackle and watercraft rules apply.', permit: 'required', officialUrl: 'https://www.nps.gov/yell/planyourvisit/fishing.htm' }, description: 'High-elevation lake within Yellowstone National Park with native-fish conservation rules.', tips: 'Use only allowed lead-free tackle and check closures and native-fish rules.', facilities: ['Seasonal visitor services', 'Boat launches'], verification: 'verified', verificationNotes: 'Permit, tackle and conservation requirements checked against National Park Service guidance.',
    sources: [{ title: 'Fishing in Yellowstone National Park', url: 'https://www.nps.gov/yell/planyourvisit/fishing.htm', publisher: 'U.S. National Park Service', checkedAt: CHECKED, supports: ['identity', 'species', 'access', 'regulations'] }], dataset: 'curated_seed', updatedAt: CHECKED, rating: 4.8, permitRequired: true,
  },
  {
    id: 'curated-everglades-florida-bay', name: 'Florida Bay, Everglades National Park', country: 'United States', region: 'Florida', coverageRegion: 'north_america', continent: 'North America', type: 'estuary',
    latitude: 25.1200, longitude: -80.8200, coordinatePrecision: 'regional_centroid', species: ['Snook', 'Redfish', 'Tarpon', 'Spotted Seatrout'], bestBait: ['Artificial lures', 'Flies'], bestSeason: ['Varies'], difficulty: 'expert',
    access: { summary: 'Florida licensing rules and National Park Service closures and gear restrictions apply.', permit: 'required', restrictions: ['Some visitor-centre waters, road sections and public-use areas are closed to fishing'], officialUrl: 'https://www.nps.gov/ever/planyourvisit/fishing.htm' }, description: 'Shallow estuarine waters within Everglades National Park.', tips: 'Consult current park closures and Florida saltwater seasons immediately before fishing.', facilities: ['Public docks in designated areas', 'Boat ramps outside some zones'], verification: 'verified', verificationNotes: 'Access, licensing and closure caveats checked against National Park Service guidance; point is a regional centroid.',
    sources: [{ title: 'Fishing in Everglades National Park', url: 'https://www.nps.gov/ever/planyourvisit/fishing.htm', publisher: 'U.S. National Park Service', checkedAt: CHECKED, supports: ['identity', 'access', 'regulations'] }], dataset: 'curated_seed', updatedAt: CHECKED, rating: 4.8, permitRequired: true,
  },
  {
    id: 'curated-avon-fishing-pier', name: 'Avon Fishing Pier', country: 'United States', region: 'North Carolina', coverageRegion: 'north_america', continent: 'North America', type: 'sea',
    latitude: 35.3475, longitude: -75.5009, coordinatePrecision: 'access_point', species: ['Red Drum'], bestBait: ['Check local operator guidance'], bestSeason: ['Summer', 'Autumn'], difficulty: 'beginner',
    access: { summary: 'Concession-operated fishing pier with seasonal opening; confirm current hours and fees with the operator.', permit: 'varies', officialUrl: 'https://www.nps.gov/places/000/avon-fishing-pier.htm' }, description: 'Named fishing pier within Cape Hatteras National Seashore.', tips: 'Confirm seasonal opening and storm-related closures before travel.', facilities: ['Pier', 'Parking', 'Restrooms', 'Fish-cleaning station'], verification: 'verified', verificationNotes: 'Identity, target species and listed amenities checked against the National Park Service place record.',
    sources: [{ title: 'Avon Fishing Pier', url: 'https://www.nps.gov/places/000/avon-fishing-pier.htm', publisher: 'U.S. National Park Service', checkedAt: CHECKED, supports: ['identity', 'species', 'access'] }], dataset: 'curated_seed', updatedAt: CHECKED, rating: 4.5, permitRequired: false,
  },
  ...([
    ['curated-lough-corrib', 'Lough Corrib', 'Ireland', 'County Galway', 'uk_ireland', 'Europe', 'lake', 53.4667, -9.2833, ['Brown Trout', 'Pike']],
    ['curated-river-ebro-mequinenza', 'River Ebro at Mequinenza', 'Spain', 'Aragon', 'europe', 'Europe', 'river', 41.3721, 0.3014, ['Wels Catfish', 'Carp']],
    ['curated-lake-jindabyne', 'Lake Jindabyne', 'Australia', 'New South Wales', 'australia_nz', 'Oceania', 'lake', -36.4140, 148.6180, ['Rainbow Trout', 'Brown Trout']],
    ['curated-vaal-river-parys', 'Vaal River at Parys', 'South Africa', 'Free State', 'south_africa', 'Africa', 'river', -26.9033, 27.4573, ['Largemouth Yellowfish', 'Smallmouth Yellowfish']],
    ['curated-lake-biwa', 'Lake Biwa', 'Japan', 'Shiga Prefecture', 'japan', 'Asia', 'lake', 35.2500, 136.0833, ['Black Bass', 'Bluegill']],
    ['curated-rio-negro-manaus', 'Rio Negro at Manaus', 'Brazil', 'Amazonas', 'brazil_amazon', 'South America', 'river', -3.1190, -60.0217, ['Peacock Bass', 'Piranha']],
    ['curated-cauvery-bheemeshwari', 'Cauvery River at Bheemeshwari', 'India', 'Karnataka', 'india', 'Asia', 'river', 12.3048, 77.2994, ['Mahseer']],
    ['curated-tokyo-bay', 'Tokyo Bay', 'Japan', 'Kanto', 'japan', 'Asia', 'sea', 35.4500, 139.8000, ['Japanese Sea Bass']],
    ['curated-durban-harbour', 'Durban Harbour', 'South Africa', 'KwaZulu-Natal', 'south_africa', 'Africa', 'sea', -29.8720, 31.0350, ['Grunter', 'Kob']],
    ['curated-goa-mandovi-estuary', 'Mandovi Estuary', 'India', 'Goa', 'india', 'Asia', 'estuary', 15.5000, 73.8000, ['Barramundi', 'Mangrove Jack']],
    ['curated-great-barrier-reef-cairns', 'Great Barrier Reef off Cairns', 'Australia', 'Queensland', 'oceans', 'Oceania', 'ocean', -16.5000, 146.0000, ['Coral Trout', 'Spanish Mackerel']],
    ['curated-abrolhos-bank', 'Abrolhos Bank', 'Brazil', 'Bahia', 'oceans', 'South America', 'ocean', -17.9500, -38.7000, ['Wahoo', 'Tuna']],
  ] as const).map(([id, name, country, region, coverageRegion, continent, type, latitude, longitude, species]) => ({
    id, name, country, region, coverageRegion, continent, type, latitude, longitude, coordinatePrecision: (type === 'ocean' ? 'regional_centroid' : 'named_feature') as CoordinatePrecision, species: [...species], bestBait: ['Check local guidance'], bestSeason: ['Varies'], difficulty: 'intermediate' as const,
    access: { summary: 'Access, licences, seasons and local restrictions have not yet completed authoritative review.', permit: 'unknown' as const }, description: `Curated named-location seed for ${name}.`, tips: 'Do not rely on this record for legal or access decisions; check the relevant authority before travel.', facilities: [], verification: 'partially_verified' as const, verificationNotes: 'Name and approximate named-feature coordinate curated; species, access and regulations still require authoritative source review.', sources: [], dataset: 'curated_seed' as const, updatedAt: CHECKED, rating: 4.0, permitRequired: false,
  })),
];
