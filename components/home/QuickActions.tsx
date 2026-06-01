import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing } from '../../constants/theme';

const actions = [
  { label: 'Log Catch', icon: 'fish', route: '/add-catch', color: colors.primary },
  { label: 'Find Spots', icon: 'map-marker-multiple', route: '/(tabs)/map', color: colors.success },
  { label: 'ID Fish', icon: 'camera', route: '/identifier', color: colors.secondary },
  { label: 'Tides', icon: 'waves', route: '/conditions', color: '#A78BFA' },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={styles.action}
          onPress={() => router.push(action.route as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.iconContainer, { borderColor: action.color + '44' }]}>
            <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
