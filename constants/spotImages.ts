import { WorldSpot } from '../data/worldSpots';

export const SPECIES_IMAGES: Record<string, string> = {
  carp:     'https://images.unsplash.com/photo-1597502655645-e9a5f38b5745?w=400&h=300&fit=crop&auto=format',
  pike:     'https://images.unsplash.com/photo-1612965110667-4175024b0dcc?w=400&h=300&fit=crop&auto=format',
  perch:    'https://images.unsplash.com/photo-1559827291-72fbe3c08592?w=400&h=300&fit=crop&auto=format',
  trout:    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&auto=format',
  salmon:   'https://images.unsplash.com/photo-1518379048481-48b8d1ea3fdb?w=400&h=300&fit=crop&auto=format',
  bass:     'https://images.unsplash.com/photo-1561043260-9b57558af9e3?w=400&h=300&fit=crop&auto=format',
  bream:    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&auto=format',
  tench:    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&auto=format',
  barbel:   'https://images.unsplash.com/photo-1597502655645-e9a5f38b5745?w=400&h=300&fit=crop&auto=format',
  zander:   'https://images.unsplash.com/photo-1612965110667-4175024b0dcc?w=400&h=300&fit=crop&auto=format',
  roach:    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&auto=format',
  default:  'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=300&fit=crop&auto=format',
};

export function getSpeciesImage(species: string): string {
  const key = species.toLowerCase().split(' ')[0];
  return SPECIES_IMAGES[key] || SPECIES_IMAGES.default;
}

// Images keyed by continent_type — actual photos of rivers, lakes, coastlines
const REGIONAL_IMAGES: Record<string, string[]> = {
  // ── European rivers (chalk streams, spate rivers, lowland rivers)
  Europe_river: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=400&fit=crop&auto=format', // chalk stream
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format', // clear stony river
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format', // wooded river
    'https://images.unsplash.com/photo-1548484088-a0b80bc52c47?w=700&h=400&fit=crop&auto=format', // river through forest
    'https://images.unsplash.com/photo-1497290756760-23ac55edf36f?w=700&h=400&fit=crop&auto=format', // river landscape
    'https://images.unsplash.com/photo-1543269665-7eef42226a21?w=700&h=400&fit=crop&auto=format', // valley river
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&h=400&fit=crop&auto=format', // mountain stream
    'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=700&h=400&fit=crop&auto=format', // river bend
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=700&h=400&fit=crop&auto=format', // river bank willows
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=700&h=400&fit=crop&auto=format', // misty morning river
  ],
  // ── European lakes (alpine, lowland, Scottish lochs)
  Europe_lake: [
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&h=400&fit=crop&auto=format', // Norwegian lake fjord
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format', // alpine lake
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=700&h=400&fit=crop&auto=format', // mountain reflection lake
    'https://images.unsplash.com/photo-1471513671800-b09c87e1497c?w=700&h=400&fit=crop&auto=format', // calm lake morning
    'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=700&h=400&fit=crop&auto=format', // forest lake
    'https://images.unsplash.com/photo-1562769084-28ab1e70f36e?w=700&h=400&fit=crop&auto=format', // loch with mountains
    'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=700&h=400&fit=crop&auto=format', // Scottish loch
    'https://images.unsplash.com/photo-1504208434309-184d53ef5d8e?w=700&h=400&fit=crop&auto=format', // misty lake dawn
    'https://images.unsplash.com/photo-1439118702823-09ec1c4543d4?w=700&h=400&fit=crop&auto=format', // lake trees
    'https://images.unsplash.com/photo-1509600110300-21b9d5bf15ce?w=700&h=400&fit=crop&auto=format', // misty forest lake
  ],
  // ── European sea/coast (rocky, North Sea, Mediterranean)
  Europe_sea: [
    'https://images.unsplash.com/photo-1455264745730-cb3b76250de8?w=700&h=400&fit=crop&auto=format', // rocky coastline
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&h=400&fit=crop&auto=format', // ocean waves
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format', // sea horizon
    'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=700&h=400&fit=crop&auto=format', // Mediterranean blue
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format', // clear sea
    'https://images.unsplash.com/photo-1526491109672-74740652b963?w=700&h=400&fit=crop&auto=format', // rocky sea shore
    'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=700&h=400&fit=crop&auto=format', // coastal cliffs
  ],
  Europe_reservoir: [
    'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1439918079498-71dc47a0ea13?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&h=400&fit=crop&auto=format',
  ],
  Europe_ocean: [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format',
  ],
  Europe_estuary: [
    'https://images.unsplash.com/photo-1449182325215-d517de72c42d?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=400&fit=crop&auto=format',
  ],

  // ── North American rivers (big western, southern bayou, eastern freestone)
  'North America_river': [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format', // mountain river USA
    'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=700&h=400&fit=crop&auto=format', // wilderness river
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format', // clear stony river
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&h=400&fit=crop&auto=format', // canyon river
    'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=700&h=400&fit=crop&auto=format', // wide river
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format', // forested river
    'https://images.unsplash.com/photo-1497290756760-23ac55edf36f?w=700&h=400&fit=crop&auto=format', // river landscape
    'https://images.unsplash.com/photo-1548484088-a0b80bc52c47?w=700&h=400&fit=crop&auto=format', // wild river
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=700&h=400&fit=crop&auto=format', // river bank
  ],
  'North America_lake': [
    'https://images.unsplash.com/photo-1528569937393-ee892b994548?w=700&h=400&fit=crop&auto=format', // North American lake
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format', // mountain lake
    'https://images.unsplash.com/photo-1504208434309-184d53ef5d8e?w=700&h=400&fit=crop&auto=format', // lake dawn
    'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=700&h=400&fit=crop&auto=format', // forest lake
    'https://images.unsplash.com/photo-1471513671800-b09c87e1497c?w=700&h=400&fit=crop&auto=format', // calm lake
    'https://images.unsplash.com/photo-1562769084-28ab1e70f36e?w=700&h=400&fit=crop&auto=format', // lake mountains
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=700&h=400&fit=crop&auto=format', // reflection lake
    'https://images.unsplash.com/photo-1439118702823-09ec1c4543d4?w=700&h=400&fit=crop&auto=format', // wooded lake
  ],
  'North America_sea': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format', // beach
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&h=400&fit=crop&auto=format', // waves
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format', // ocean
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format', // tropical
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&h=400&fit=crop&auto=format', // surf
    'https://images.unsplash.com/photo-1455264745730-cb3b76250de8?w=700&h=400&fit=crop&auto=format', // rocky coast
  ],
  'North America_ocean': [
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&h=400&fit=crop&auto=format',
  ],
  'North America_reservoir': [
    'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1528569937393-ee892b994548?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1439918079498-71dc47a0ea13?w=700&h=400&fit=crop&auto=format',
  ],
  'North America_estuary': [
    'https://images.unsplash.com/photo-1449182325215-d517de72c42d?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format',
  ],

  // ── Asian rivers (tropical, Himalayan, SE Asian)
  Asia_river: [
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&h=400&fit=crop&auto=format', // tropical river
    'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?w=700&h=400&fit=crop&auto=format', // jungle river
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format', // river stones
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&h=400&fit=crop&auto=format', // mountain river
    'https://images.unsplash.com/photo-1548484088-a0b80bc52c47?w=700&h=400&fit=crop&auto=format', // forest river
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format', // lush river
    'https://images.unsplash.com/photo-1497290756760-23ac55edf36f?w=700&h=400&fit=crop&auto=format', // river valley
  ],
  Asia_lake: [
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&h=400&fit=crop&auto=format', // Asian mountain lake
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format', // mountain lake
    'https://images.unsplash.com/photo-1471513671800-b09c87e1497c?w=700&h=400&fit=crop&auto=format', // calm lake
    'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=700&h=400&fit=crop&auto=format', // forest lake
    'https://images.unsplash.com/photo-1504208434309-184d53ef5d8e?w=700&h=400&fit=crop&auto=format', // misty lake
  ],
  Asia_sea: [
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format', // tropical clear
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format', // tropical beach
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format', // ocean
    'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=700&h=400&fit=crop&auto=format', // blue water
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&h=400&fit=crop&auto=format', // waves
    'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=700&h=400&fit=crop&auto=format', // turquoise sea
  ],
  Asia_ocean: [
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=700&h=400&fit=crop&auto=format',
  ],
  Asia_estuary: [
    'https://images.unsplash.com/photo-1449182325215-d517de72c42d?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format',
  ],
  Asia_reservoir: [
    'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&h=400&fit=crop&auto=format',
  ],

  // ── African rivers & lakes (wild, tropical)
  Africa_river: [
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&h=400&fit=crop&auto=format', // tropical river
    'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?w=700&h=400&fit=crop&auto=format', // jungle waterway
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format', // river
    'https://images.unsplash.com/photo-1548484088-a0b80bc52c47?w=700&h=400&fit=crop&auto=format', // river trees
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format', // lush river
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&h=400&fit=crop&auto=format', // wide river
  ],
  Africa_lake: [
    'https://images.unsplash.com/photo-1529686342540-1b43aec0df75?w=700&h=400&fit=crop&auto=format', // African lake
    'https://images.unsplash.com/photo-1471513671800-b09c87e1497c?w=700&h=400&fit=crop&auto=format', // calm lake
    'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=700&h=400&fit=crop&auto=format', // lake
    'https://images.unsplash.com/photo-1504208434309-184d53ef5d8e?w=700&h=400&fit=crop&auto=format', // lake dawn
    'https://images.unsplash.com/photo-1562769084-28ab1e70f36e?w=700&h=400&fit=crop&auto=format', // wide lake
  ],
  Africa_ocean: [
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format', // Indian Ocean
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format', // tropical beach
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format', // ocean
    'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=700&h=400&fit=crop&auto=format', // turquoise
  ],
  Africa_sea: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=700&h=400&fit=crop&auto=format',
  ],
  Africa_reservoir: [
    'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1529686342540-1b43aec0df75?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=700&h=400&fit=crop&auto=format',
  ],
  Africa_estuary: [
    'https://images.unsplash.com/photo-1449182325215-d517de72c42d?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format',
  ],

  // ── Oceania rivers & lakes (Australia, NZ)
  Oceania_river: [
    'https://images.unsplash.com/photo-1546268060-2592ff93ee24?w=700&h=400&fit=crop&auto=format', // Australian river
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format', // clear river
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format', // river trees
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&h=400&fit=crop&auto=format', // river gorge
    'https://images.unsplash.com/photo-1548484088-a0b80bc52c47?w=700&h=400&fit=crop&auto=format', // forest river
    'https://images.unsplash.com/photo-1497290756760-23ac55edf36f?w=700&h=400&fit=crop&auto=format', // river valley
  ],
  Oceania_lake: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=400&fit=crop&auto=format', // NZ lake
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format', // mountain lake
    'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=700&h=400&fit=crop&auto=format', // lake
    'https://images.unsplash.com/photo-1471513671800-b09c87e1497c?w=700&h=400&fit=crop&auto=format', // calm lake
    'https://images.unsplash.com/photo-1562769084-28ab1e70f36e?w=700&h=400&fit=crop&auto=format', // lake mountains
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=700&h=400&fit=crop&auto=format', // reflection lake
  ],
  Oceania_ocean: [
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format', // tropical
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&h=400&fit=crop&auto=format', // surf
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format', // beach
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format', // ocean
    'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=700&h=400&fit=crop&auto=format', // turquoise
  ],
  Oceania_sea: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format',
  ],
  Oceania_reservoir: [
    'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1546268060-2592ff93ee24?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=700&h=400&fit=crop&auto=format',
  ],
  Oceania_estuary: [
    'https://images.unsplash.com/photo-1449182325215-d517de72c42d?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1546268060-2592ff93ee24?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format',
  ],

  // ── South American rivers & lakes (Amazon, Patagonia)
  'South America_river': [
    'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?w=700&h=400&fit=crop&auto=format', // jungle river
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&h=400&fit=crop&auto=format', // tropical river
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&h=400&fit=crop&auto=format', // mountain river
    'https://images.unsplash.com/photo-1548484088-a0b80bc52c47?w=700&h=400&fit=crop&auto=format', // forested river
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=700&h=400&fit=crop&auto=format', // river
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=700&h=400&fit=crop&auto=format', // river landscape
  ],
  'South America_lake': [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format', // mountain lake
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=700&h=400&fit=crop&auto=format', // reflection lake
    'https://images.unsplash.com/photo-1562769084-28ab1e70f36e?w=700&h=400&fit=crop&auto=format', // mountain lake
    'https://images.unsplash.com/photo-1471513671800-b09c87e1497c?w=700&h=400&fit=crop&auto=format', // calm lake
    'https://images.unsplash.com/photo-1504208434309-184d53ef5d8e?w=700&h=400&fit=crop&auto=format', // lake dawn
  ],
  'South America_ocean': [
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format',
  ],
  'South America_sea': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&h=400&fit=crop&auto=format',
  ],
  'South America_reservoir': [
    'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&auto=format',
  ],
  'South America_estuary': [
    'https://images.unsplash.com/photo-1449182325215-d517de72c42d?w=700&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?w=700&h=400&fit=crop&auto=format',
  ],
};

// Fallback arrays by type
const TYPE_FALLBACK: Record<string, string[]> = {
  river:     REGIONAL_IMAGES['Europe_river'],
  lake:      REGIONAL_IMAGES['Europe_lake'],
  sea:       REGIONAL_IMAGES['Europe_sea'],
  reservoir: REGIONAL_IMAGES['Europe_reservoir'],
  ocean:     REGIONAL_IMAGES['Asia_ocean'],
  estuary:   REGIONAL_IMAGES['Europe_estuary'],
};

export function getSpotImage(spot: WorldSpot): string {
  const key = `${spot.continent}_${spot.type}`;
  const images = REGIONAL_IMAGES[key] || TYPE_FALLBACK[spot.type] || REGIONAL_IMAGES['Europe_river'];
  const hash = spot.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return images[hash % images.length];
}
