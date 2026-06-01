import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ukSpots, FishingSpot } from '../../data/ukSpots';
import { SpotCard } from '../../components/map/SpotCard';
import { colors, radius, spacing } from '../../constants/theme';

const { height } = Dimensions.get('window');

const TYPES = ['All', 'River', 'Lake', 'Sea', 'Reservoir', 'Private'];

const typeIcons: Record<string, string> = {
  river: 'waves',
  lake: 'water',
  sea: 'anchor',
  reservoir: 'water-pump',
  private: 'lock',
};

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.secondary,
  expert: colors.danger,
};

export default function MapScreen() {
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);

  const filtered = ukSpots.filter((s) => {
    if (selectedType === 'All') return true;
    return s.type === selectedType.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fishing Spots</Text>
        <Text style={styles.subtitle}>{filtered.length} UK spots</Text>
      </View>

      {/* Map placeholder with styled grid */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapTitle}>🗺️ UK Fishing Spots</Text>
          <Text style={styles.mapSubtitle}>
            {filtered.length} spots across England, Scotland & Wales
          </Text>
          <View style={styles.mapGrid}>
            {filtered.slice(0, 6).map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={styles.mapPin}
                onPress={() => setSelectedSpot(spot)}
              >
                <View style={[styles.pinDot, { backgroundColor: spot.permitRequired ? colors.secondary : colors.primary }]} />
                <Text style={styles.pinLabel} numberOfLines={1}>{spot.name.split(',')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.mapNote}>Tap a spot below to view details</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}
      >
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, selectedType === t && styles.chipActive]}
            onPress={() => setSelectedType(t)}
          >
            <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Spot list */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filtered.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.spotRow}
            onPress={() => setSelectedSpot(spot)}
            activeOpacity={0.85}
          >
            <View style={[styles.spotTypeIcon, { borderColor: difficultyColors[spot.difficulty] + '44' }]}>
              <MaterialCommunityIcons
                name={typeIcons[spot.type] as any}
                size={20}
                color={difficultyColors[spot.difficulty]}
              />
            </View>
            <View style={styles.spotInfo}>
              <Text style={styles.spotName} numberOfLines={1}>{spot.name}</Text>
              <Text style={styles.spotSpecies} numberOfLines={1}>
                {spot.species.slice(0, 3).join(' · ')}
              </Text>
            </View>
            <View style={styles.spotMeta}>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
                <Text style={styles.rating}>{spot.rating}</Text>
              </View>
              {spot.permitRequired && (
                <Text style={styles.permit}>Permit</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Spot detail bottom sheet */}
      <Modal
        visible={!!selectedSpot}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSpot(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedSpot(null)}
        />
        {selectedSpot && (
          <SpotCard
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mapContainer: {
    margin: spacing.lg,
    marginTop: spacing.sm,
  },
  mapPlaceholder: {
    backgroundColor: 'rgba(0,212,170,0.06)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    padding: spacing.lg,
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  mapSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  mapPin: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pinLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    maxWidth: 80,
    textAlign: 'center',
  },
  mapNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  spotTypeIcon: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  spotSpecies: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  spotMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  permit: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
