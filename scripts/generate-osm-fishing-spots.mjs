import fs from 'node:fs';

const [inputPath = '/tmp/osm-fishing.json', outputPath = 'data/osmFishingSpots.generated.ts'] = process.argv.slice(2);
const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function areaFor(lat, lon, tags) {
  const tagged = tags['addr:country'] || tags['is_in:country'] || tags.country || tags['addr:state'];
  if (tagged) return tagged;
  if (lat >= 35 && lat <= 72 && lon >= -25 && lon <= 45) return 'Europe';
  if (lat >= 5 && lat <= 85 && lon >= -170 && lon <= -50) return 'North America';
  if (lat >= -60 && lat <= 15 && lon >= -90 && lon <= -30) return 'South America';
  if (lat >= -37 && lat <= 38 && lon >= -20 && lon <= 55) return 'Africa';
  if (lat >= -50 && lat <= 0 && lon >= 110 && lon <= 180) return 'Oceania';
  if (lat >= -10 && lat <= 80 && lon >= 45 && lon <= 180) return 'Asia';
  return 'Worldwide';
}

function waterType(tags) {
  if (tags.access === 'private' || tags.private === 'yes') return 'private';
  if (tags.water === 'reservoir') return 'reservoir';
  if (tags.water === 'lake' || tags.water === 'pond' || tags.natural === 'water') return 'lake';
  if (tags.waterway === 'river' || tags.waterway === 'stream') return 'river';
  if (tags.natural === 'bay' || tags.natural === 'beach' || tags.fishing === 'saltwater') return 'sea';
  if (tags.estuary === 'yes') return 'estuary';
  return 'fishery';
}

function speciesFrom(tags) {
  // `fishing=*` usually describes access or permit rules (for example
  // `fishing=licence`), not stocked species. Only dedicated species tags are
  // safe to surface as fish names.
  const value = tags.fish || tags.species;
  if (!value) return '';
  return value.replaceAll('_', ' ').replaceAll(';', '|');
}

const seen = new Set();
const tuples = [];

for (const element of payload.elements || []) {
  const tags = element.tags || {};
  const name = String(tags.name || '').trim();
  const lat = Number(element.lat ?? element.center?.lat);
  const lon = Number(element.lon ?? element.center?.lon);
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  if (tags.fishing === 'no' || tags.access === 'no') continue;

  const roundedLat = Number(lat.toFixed(6));
  const roundedLon = Number(lon.toFixed(6));
  const key = `${name.toLowerCase()}|${roundedLat.toFixed(4)}|${roundedLon.toFixed(4)}`;
  if (seen.has(key)) continue;
  seen.add(key);

  tuples.push([
    `osm-${element.type}-${element.id}`,
    name,
    roundedLat,
    roundedLon,
    waterType(tags),
    areaFor(lat, lon, tags),
    speciesFrom(tags),
    String(tags.access || ''),
  ]);
  if (tuples.length === 10_000) break;
}

if (tuples.length < 10_000) throw new Error(`Only ${tuples.length} usable fishing features were found`);

const output = `// Generated from named OpenStreetMap elements explicitly tagged for fishing.\n` +
  `// Source snapshot generated ${new Date().toISOString()}; regenerate with scripts/generate-osm-fishing-spots.mjs.\n` +
  `export type OsmFishingSpotTuple = readonly [id: string, name: string, latitude: number, longitude: number, type: 'fishery' | 'river' | 'lake' | 'reservoir' | 'sea' | 'ocean' | 'estuary' | 'private', area: string, species: string, access: string];\n` +
  `export const OSM_FISHING_SPOTS = ${JSON.stringify(tuples)} as const satisfies readonly OsmFishingSpotTuple[];\n`;

fs.writeFileSync(outputPath, output);
console.log(`Wrote ${tuples.length} OSM fishing spots to ${outputPath}`);
