import React, { ReactNode, useState } from 'react';
import { Image, Linking, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FishingSpotRecord } from '../../types/fishingSpot';
import { useSpotImage } from '../../hooks/useSpotImage';
import { Icon } from '../ui/Icon';
import { radius } from '../../constants/theme';

const GRADIENTS: Record<string, [string, string]> = {
  river: ['#1a3a2a', '#0d1f16'], lake: ['#1a2a3a', '#0d1620'], sea: ['#123553', '#071827'],
  reservoir: ['#1a2535', '#0f1928'], ocean: ['#0f3150', '#071525'], estuary: ['#1a382f', '#0c1e19'],
  private: ['#30263b', '#15101c'], fishery: ['#163c31', '#092019'],
};

export function SpotPhoto({ spot, variant = 'card', style, children }: {
  spot: FishingSpotRecord;
  variant?: 'card' | 'featured' | 'hero';
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const { image, loading } = useSpotImage(spot.id, spot.name, spot.latitude, spot.longitude);
  const [failed, setFailed] = useState(false);
  const showImage = !!image && !failed;

  return (
    <View style={[styles.base, styles[variant], style]}>
      {showImage ? <Image source={{ uri: image.uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" onError={() => setFailed(true)} accessibilityLabel={`${image.match === 'named-location' ? 'Location' : 'Nearby geo-tagged'} photo for ${spot.name}`} /> : (
        <LinearGradient colors={GRADIENTS[spot.type] ?? GRADIENTS.fishery} style={styles.fallback}>
          <View style={styles.mapGridHorizontal} />
          <View style={styles.mapGridVertical} />
          <Icon name={loading ? 'image-search-outline' : 'map-marker'} size={variant === 'card' ? 25 : 48} color="rgba(255,255,255,0.72)" />
          {loading ? null : <Text style={[styles.coordinateText, variant === 'card' && styles.coordinateTextCard]} numberOfLines={1}>
            {spot.latitude.toFixed(3)}, {spot.longitude.toFixed(3)}
          </Text>}
        </LinearGradient>
      )}
      {variant !== 'card' && showImage ? <TouchableOpacity style={styles.attribution} onPress={() => Linking.openURL(image.sourcePage)} accessibilityRole="link">
        <Text style={styles.attributionText} numberOfLines={1}>{image.attribution}</Text>
      </TouchableOpacity> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', backgroundColor: '#10251f' },
  card: { width: 88, minHeight: 96 },
  featured: { ...StyleSheet.absoluteFillObject },
  hero: { width: '100%', height: 220 },
  fallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  mapGridHorizontal: { position: 'absolute', left: 0, right: 0, top: '38%', height: 1, backgroundColor: 'rgba(255,255,255,0.10)', transform: [{ rotate: '-8deg' }] },
  mapGridVertical: { position: 'absolute', top: 0, bottom: 0, left: '58%', width: 1, backgroundColor: 'rgba(255,255,255,0.10)', transform: [{ rotate: '12deg' }] },
  coordinateText: { marginTop: 6, color: 'rgba(255,255,255,0.76)', fontSize: 10, fontWeight: '700' },
  coordinateTextCard: { fontSize: 7, maxWidth: 72 },
  attribution: { position: 'absolute', left: 9, bottom: 9, maxWidth: '70%', backgroundColor: 'rgba(0,0,0,0.68)', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4, zIndex: 5 },
  attributionText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
