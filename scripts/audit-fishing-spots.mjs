import fs from 'node:fs';

const source = fs.readFileSync('data/osmFishingSpots.generated.ts', 'utf8');
const match = source.match(/export const OSM_FISHING_SPOTS = (\[.*\]) as const satisfies/s);
if (!match) throw new Error('Unable to read generated OSM tuple data');
const rows = JSON.parse(match[1]);

const errors = [];
const ids = new Set();
const locationKeys = new Set();

for (const [index, row] of rows.entries()) {
  const [id, name, latitude, longitude, type, area] = row;
  if (!id || !name || !type || !area) errors.push(`row ${index}: required text missing`);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) errors.push(`row ${index}: invalid latitude`);
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) errors.push(`row ${index}: invalid longitude`);
  if (ids.has(id)) errors.push(`row ${index}: duplicate id ${id}`);
  ids.add(id);
  const locationKey = `${String(name).toLowerCase()}|${latitude.toFixed(4)}|${longitude.toFixed(4)}`;
  if (locationKeys.has(locationKey)) errors.push(`row ${index}: duplicate named coordinate`);
  locationKeys.add(locationKey);
}

const curated = fs.readFileSync('data/fishingSpotsCurated.ts', 'utf8');
if (!curated.includes("id: 'curated-babbacombe-beach'")) errors.push('Babbacombe curated record missing');
if (!curated.includes('tor-bay-harbour.co.uk/leisure/angling')) errors.push('Babbacombe authority source missing');

const report = {
  passed: errors.length === 0 && rows.length === 10_000,
  osmFishingSpots: rows.length,
  uniqueIds: ids.size,
  uniqueNamedCoordinates: locationKeys.size,
  validCoordinates: rows.length - errors.filter((item) => item.includes('latitude') || item.includes('longitude')).length,
  babbacombePresent: curated.includes("id: 'curated-babbacombe-beach'"),
  sampleIds: rows.filter((_, index) => index % 1000 === 0).map((row) => row[0]),
  errors: errors.slice(0, 50),
};

console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
