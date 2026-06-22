import React, { useState } from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius } from '../../constants/theme';
import { useFishImage } from '../../hooks/useFishImage';
import { Icon } from '../ui/Icon';

export function FishPhoto({ scientificName, commonName, accent, variant = 'thumbnail' }: {
  scientificName: string;
  commonName: string;
  accent: string;
  variant?: 'thumbnail' | 'hero';
}) {
  const { image, loading } = useFishImage(scientificName);
  const [failed, setFailed] = useState(false);
  const isHero = variant === 'hero';

  return (
    <View style={[isHero ? styles.hero : styles.thumbnail, { backgroundColor: `${accent}1F` }]}>
      {image && !failed ? (
        <Image
          source={{ uri: image.uri }}
          style={styles.image}
          resizeMode={isHero ? 'cover' : 'contain'}
          onError={() => setFailed(true)}
          accessibilityLabel={`Photo of ${commonName}`}
        />
      ) : (
        <Icon name={loading ? 'image-search-outline' : 'fish'} size={isHero ? 52 : 27} color={accent} />
      )}
      {isHero && image && !failed ? (
        <TouchableOpacity style={styles.attribution} onPress={() => Linking.openURL(image.sourcePage)} accessibilityRole="link">
          <Text style={styles.attributionText}>{image.attribution}</Text>
          <Icon name="open-in-new" size={11} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnail: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  hero: { width: '100%', height: 230, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', height: '100%' },
  attribution: { position: 'absolute', right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.68)', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  attributionText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
