import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Species } from '../../data/species';
import { colors, radius, spacing } from '../../constants/theme';

interface FishTipCardProps {
  species: Species;
  onPress: () => void;
}

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

const typeLabels: Record<string, string> = {
  freshwater: 'Freshwater',
  saltwater: 'Saltwater',
  game: 'Game',
  coarse: 'Coarse',
  sea: 'Sea',
};

export function FishTipCard({ species, onPress }: FishTipCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{species.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{species.name}</Text>
        <Text style={styles.latin} numberOfLines={1}>{species.latinName}</Text>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: difficultyColors[species.difficulty] + '22' }]}>
            <Text style={[styles.tagText, { color: difficultyColors[species.difficulty] }]}>
              {species.difficulty}
            </Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{typeLabels[species.type]}</Text>
          </View>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

interface SpeciesCardProps {
  species: Species;
  onPress: () => void;
}

export function SpeciesCard({ species, onPress }: SpeciesCardProps) {
  return (
    <TouchableOpacity style={styles.speciesCard} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.speciesEmoji}>{species.emoji}</Text>
      <Text style={styles.speciesName} numberOfLines={2}>{species.name}</Text>
      <View style={[styles.dot, { backgroundColor: difficultyColors[species.difficulty] }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiContainer: {
    width: 52,
    height: 52,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 26,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  latin: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Grid card
  speciesCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    margin: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 110,
    justifyContent: 'center',
  },
  speciesEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  speciesName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: spacing.xs,
  },
});
