import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Catch } from '../../store/catchStore';
import { colors, radius, spacing, fonts } from '../../constants/theme';

interface CatchCardProps {
  item: Catch;
  mode?: 'grid' | 'list';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CatchCard({ item, mode = 'grid' }: CatchCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({ pathname: '/catch-detail', params: { id: item.id } });
  };

  if (mode === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={handlePress} activeOpacity={0.85}>
        <View style={styles.listEmoji}>
          <MaterialCommunityIcons name="fish" size={22} color={colors.primary} />
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.species}>{item.species}</Text>
          <Text style={styles.weight}>{item.weight}kg</Text>
          {item.location && (
            <View style={styles.row}>
              <MaterialCommunityIcons name="map-marker" size={12} color={colors.textSecondary} />
              <Text style={styles.detail}>{item.location}</Text>
            </View>
          )}
          {item.bait && (
            <View style={styles.row}>
              <MaterialCommunityIcons name="hook" size={12} color={colors.textSecondary} />
              <Text style={styles.detail}>{item.bait}</Text>
            </View>
          )}
        </View>
        <View style={styles.listRight}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={handlePress} activeOpacity={0.85}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <MaterialCommunityIcons name="fish" size={36} color={colors.primary} />
        </View>
      )}
      <View style={styles.gridInfo}>
        <Text style={styles.species} numberOfLines={1}>{item.species}</Text>
        <Text style={styles.weight}>{item.weight}kg</Text>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    margin: spacing.xs,
  },
  photo: {
    width: '100%',
    height: 120,
  },
  photoPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    padding: spacing.sm,
  },
  species: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  weight: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.primary,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // List styles
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  listEmoji: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  listInfo: {
    flex: 1,
  },
  listRight: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 3,
  },
});
