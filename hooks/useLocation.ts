import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    async function getLocation() {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLocation({ latitude: 51.5074, longitude: -0.1278, city: 'London', region: 'England' });
          setLoading(false);
          return;
        }
        setPermissionGranted(true);

        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = position.coords;

        let city = 'Unknown';
        let region = 'UK';

        try {
          const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (geocode.length > 0) {
            city = geocode[0].city || geocode[0].district || 'Unknown';
            region = geocode[0].region || 'UK';
          }
        } catch {}

        setLocation({ latitude, longitude, city, region });
      } catch (e) {
        setError('Could not get location');
        setLocation({ latitude: 51.5074, longitude: -0.1278, city: 'London', region: 'England' });
      } finally {
        setLoading(false);
      }
    }

    getLocation();
  }, []);

  return { location, loading, error, permissionGranted };
}
