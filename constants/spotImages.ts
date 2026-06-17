import { WorldSpot } from '../data/worldSpots';

export const SPOT_IMAGES: Record<string, string[]> = {
  river: [
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1497290756760-23ac55edf36f?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1548484088-a0b80bc52c47?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504221507732-5d217f9e5e63?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1543269665-7eef42226a21?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=600&h=300&fit=crop&auto=format',
  ],
  lake: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1471513671800-b09c87e1497c?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1562769084-28ab1e70f36e?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1439118702823-09ec1c4543d4?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504208434309-184d53ef5d8e?w=600&h=300&fit=crop&auto=format',
  ],
  sea: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1455264745730-cb3b76250de8?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600&h=300&fit=crop&auto=format',
  ],
  reservoir: [
    'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1439918079498-71dc47a0ea13?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=300&fit=crop&auto=format',
  ],
  ocean: [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop&auto=format',
  ],
  estuary: [
    'https://images.unsplash.com/photo-1449182325215-d517de72c42d?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1500043788826-2e6d08ce4dc0?w=600&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=300&fit=crop&auto=format',
  ],
};

export function getSpotImage(spot: WorldSpot): string {
  const images = SPOT_IMAGES[spot.type] || SPOT_IMAGES.lake;
  const hash = spot.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return images[hash % images.length];
}
