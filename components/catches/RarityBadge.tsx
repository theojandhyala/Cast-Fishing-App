import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { radius, spacing } from '../../constants/theme';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface RarityBadgeProps {
  rarity: Rarity;
  rarityColor: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'MYTHIC',
};

export function RarityBadge({ rarity, rarityColor, size = 'md', showLabel = true }: RarityBadgeProps) {
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (rarity === 'mythic') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [rarity]);

  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;
  const paddingH = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;
  const paddingV = size === 'sm' ? 2 : size === 'lg' ? 6 : 3;

  if (rarity === 'mythic') {
    return (
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor: rarityColor + '22',
            borderColor: rarityColor,
            paddingHorizontal: paddingH,
            paddingVertical: paddingV,
            opacity: glowAnim,
            shadowColor: rarityColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        {showLabel && (
          <Text style={[styles.badgeText, { color: rarityColor, fontSize, fontWeight: '900' }]}>
            ✦ {RARITY_LABELS[rarity]} ✦
          </Text>
        )}
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: rarityColor + '22',
          borderColor: rarityColor + '66',
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
      ]}
    >
      {showLabel && (
        <Text style={[styles.badgeText, { color: rarityColor, fontSize }]}>
          {RARITY_LABELS[rarity]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
