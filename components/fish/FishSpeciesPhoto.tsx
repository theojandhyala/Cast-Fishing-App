import React, { useState } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../constants/theme';
import { getFishByName } from '../../data/fishDatabase';
import { useFishImage } from '../../hooks/useFishImage';
import { Icon } from '../ui/Icon';

export function FishSpeciesPhoto({ species, photo, style }: {
  species: string;
  photo?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const fish = getFishByName(species);
  const { image, loading } = useFishImage(fish?.scientificName ?? species);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const speciesUri = image?.uri;
  const uri = photo && failedUri !== photo ? photo : speciesUri && failedUri !== speciesUri ? speciesUri : undefined;

  return (
    <View style={[styles.frame, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailedUri(uri)}
          accessibilityLabel={`Photo of ${species}`}
        />
      ) : (
        <Icon name={loading ? 'image-search-outline' : 'fish'} size={28} color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(0,212,170,0.10)' },
  image: { width: '100%', height: '100%' },
});
