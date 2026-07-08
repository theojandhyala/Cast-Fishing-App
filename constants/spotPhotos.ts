import { WorldSpot } from '../data/worldSpots';

// Curated Unsplash photos mapped by spot ID
// Format: https://images.unsplash.com/photo-{ID}?w=600&h=400&fit=crop&auto=format&q=80
const SPOT_PHOTO_MAP: Record<string, string> = {
  // UK Rivers
  uk1:  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop&auto=format&q=80', // Thames London
  uk2:  'https://images.unsplash.com/photo-1527090526205-befd3719f1a8?w=600&h=400&fit=crop&auto=format&q=80', // River Wye
  uk3:  'https://images.unsplash.com/photo-1504567961807-48d31c80babb?w=600&h=400&fit=crop&auto=format&q=80', // Grafham Water reservoir
  uk4:  'https://images.unsplash.com/photo-1509375637-cb18a21d0b65?w=600&h=400&fit=crop&auto=format&q=80', // Loch Lomond
  uk5:  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&auto=format&q=80', // River Kennet chalk stream
  uk6:  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&auto=format&q=80', // Chesil Beach
  uk7:  'https://images.unsplash.com/photo-1544724996-8d2acaca0df5?w=600&h=400&fit=crop&auto=format&q=80', // River Trent
  uk8:  'https://images.unsplash.com/photo-1500534314209-a157d0e4f71d?w=600&h=400&fit=crop&auto=format&q=80', // Bewl Water
  uk9:  'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&h=400&fit=crop&auto=format&q=80', // River Avon Hampshire
  uk10: 'https://images.unsplash.com/photo-1518998053-8fe9bd14a3d1?w=600&h=400&fit=crop&auto=format&q=80', // Loch Awe
  uk11: 'https://images.unsplash.com/photo-1573395376568-bfe6bf7d1f42?w=600&h=400&fit=crop&auto=format&q=80', // Windermere
  uk12: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&auto=format&q=80', // River Dee Wales
  uk13: 'https://images.unsplash.com/photo-1547036967-3b461b8be7e7?w=600&h=400&fit=crop&auto=format&q=80', // River Severn
  uk14: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&h=400&fit=crop&auto=format&q=80', // Rutland Water
  uk15: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop&auto=format&q=80', // Cardigan Bay
  uk16: 'https://images.unsplash.com/photo-1551523342-c10bb9d9ab58?w=600&h=400&fit=crop&auto=format&q=80', // Lough Corrib Ireland
  uk17: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&auto=format&q=80', // River Test chalk stream
  uk18: 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?w=600&h=400&fit=crop&auto=format&q=80', // Norfolk Broads
  uk19: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&h=400&fit=crop&auto=format&q=80', // Kielder Water Northumberland
  uk20: 'https://images.unsplash.com/photo-1471958680802-1345a694ba6d?w=600&h=400&fit=crop&auto=format&q=80', // River Exe Devon

  // European Spots
  eu1:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format&q=80', // Rhine Germany
  eu2:  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format&q=80', // Bavaria lake
  eu3:  'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600&h=400&fit=crop&auto=format&q=80', // River Ebro Spain
  eu4:  'https://images.unsplash.com/photo-1558036117-3ed37ec7cde6?w=600&h=400&fit=crop&auto=format&q=80', // Norwegian fjord
  eu5:  'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=600&h=400&fit=crop&auto=format&q=80', // Alta River Norway
  eu6:  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop&auto=format&q=80', // River Allier France
  eu7:  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop&auto=format&q=80', // Lake Geneva
  eu8:  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&h=400&fit=crop&auto=format&q=80', // River Vltava Prague
  eu9:  'https://images.unsplash.com/photo-1568745163678-c4be0c9c67ed?w=600&h=400&fit=crop&auto=format&q=80', // River Soca Slovenia emerald
  eu10: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&h=400&fit=crop&auto=format&q=80', // Vanern Sweden
};

// Type + region fallbacks (used when no specific photo exists)
const TYPE_FALLBACKS: Record<string, string[]> = {
  river: [
    'https://images.unsplash.com/photo-1527090526205-befd3719f1a8?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1547036967-3b461b8be7e7?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1471958680802-1345a694ba6d?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1544724996-8d2acaca0df5?w=600&h=400&fit=crop&auto=format&q=80',
  ],
  lake: [
    'https://images.unsplash.com/photo-1509375637-cb18a21d0b65?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1518998053-8fe9bd14a3d1?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1573395376568-bfe6bf7d1f42?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop&auto=format&q=80',
  ],
  reservoir: [
    'https://images.unsplash.com/photo-1504567961807-48d31c80babb?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1500534314209-a157d0e4f71d?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&h=400&fit=crop&auto=format&q=80',
  ],
  sea: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format&q=80',
  ],
  ocean: [
    'https://images.unsplash.com/photo-1558036117-3ed37ec7cde6?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=400&fit=crop&auto=format&q=80',
  ],
  estuary: [
    'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?w=600&h=400&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&auto=format&q=80',
  ],
};

function hashSpotId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

export function getSpotPhoto(spot: Pick<WorldSpot, 'id' | 'type'>): string {
  if (SPOT_PHOTO_MAP[spot.id]) return SPOT_PHOTO_MAP[spot.id];
  const fallbacks = TYPE_FALLBACKS[spot.type] ?? TYPE_FALLBACKS.river;
  return fallbacks[hashSpotId(spot.id) % fallbacks.length];
}
