import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface CastLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export function CastLogo({ size = 'md', showWordmark = false }: CastLogoProps) {
  const dim = size === 'sm' ? 32 : size === 'md' ? 48 : 80;
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../assets/logo-mark.png')}
        style={{ width: dim, height: dim }}
        resizeMode="contain"
      />
      {showWordmark && <Text style={styles.wordmark}>CAST</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  wordmark: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00D4AA',
    letterSpacing: 4,
    marginTop: 6,
  },
});
