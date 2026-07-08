import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/theme';

interface SocialAvatarProps {
  name: string;
  color: string;
  size?: number;
  isOnline?: boolean;
}

const initialsFor = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export const SocialAvatar = memo(function SocialAvatar({
  name,
  color,
  size = 48,
  isOnline = false,
}: SocialAvatarProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${name}${isOnline ? ', online' : ''}`}
      style={{ width: size, height: size }}
    >
      <LinearGradient
        colors={[color, `${color}99`]}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.32 }]}>{initialsFor(name)}</Text>
      </LinearGradient>
      {isOnline ? <View style={styles.onlineDot} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '800' },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
