import { useMemo } from 'react';
import { useLocationStore } from '../store/locationStore';
import { getRegionalFishingData, RegionalFishingData } from '../data/regionalFishingData';

export function useRegionalFishing(): RegionalFishingData {
  const { location } = useLocationStore();
  const month = new Date().getMonth() + 1; // 1-12

  // locationStore ManualLocation may have coords if geo-detected
  const lat = (location as any)?.coords?.latitude ?? 52.5;
  const lng = (location as any)?.coords?.longitude ?? -1.5;

  return useMemo(
    () => getRegionalFishingData(lat, lng, month),
    [lat, lng, month]
  );
}
