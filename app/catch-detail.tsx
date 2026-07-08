import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Image,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { colors, radius, spacing } from '../constants/theme';
import { FishSpeciesPhoto } from '../components/fish/FishSpeciesPhoto';

export default function CatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catches, removeCatch } = useCatchStore();
  const router = useRouter();

  const catchItem = catches.find((c) => c.id === id);

  if (!catchItem) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Catch not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Catch', 'Are you sure you want to delete this catch?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeCatch(catchItem.id);
          router.back();
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photo or emoji hero */}
      <FishSpeciesPhoto species={catchItem.species} photo={catchItem.photo} style={styles.photo} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.species}>{catchItem.species}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.weight}>{catchItem.weight}kg</Text>
        </View>
      </View>

      {/* Photo section */}
      {catchItem.photo ? (
        <View style={styles.photoCard}>
          <Image source={{ uri: catchItem.photo }} style={styles.catchPhoto} resizeMode="cover" />
          <View style={styles.photoOverlay}>
            <View style={styles.locationChip}>
              <MaterialCommunityIcons name="map-marker" size={12} color="#fff" />
              <Text style={styles.locationChipText}>{catchItem.location || 'Unknown spot'}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noPhotoCard}>
          <MaterialCommunityIcons name="fish" size={32} color="rgba(0,212,170,0.3)" />
          <Text style={styles.noPhotoText}>No photo — scan your next catch to auto-capture</Text>
        </View>
      )}

      {/* Caption / share */}
      <View style={styles.shareRow}>
        <TouchableOpacity style={styles.shareBtn} onPress={() => {
          const msg = `Just caught a ${catchItem.species}${catchItem.weight ? ` (${catchItem.weight}kg)` : ''} at ${catchItem.location || 'a secret spot'} 🎣`;
          Share.share({ message: msg });
        }}>
          <MaterialCommunityIcons name="share-outline" size={16} color={colors.primary} />
          <Text style={styles.shareBtnText}>Share catch</Text>
        </TouchableOpacity>
        <View style={styles.catchMeta}>
          <MaterialCommunityIcons name="map-marker-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.catchMetaText}>{catchItem.location || 'Location not recorded'}</Text>
        </View>
      </View>

      {/* Details grid */}
      <View style={styles.grid}>
        {catchItem.length && (
          <DetailBox icon="ruler" label="Length" value={`${catchItem.length}cm`} />
        )}
        {catchItem.location && (
          <DetailBox icon="map-marker" label="Location" value={catchItem.location} />
        )}
        {catchItem.bait && (
          <DetailBox icon="hook" label="Bait" value={catchItem.bait} />
        )}
        <DetailBox icon="calendar" label="Date" value={formatDate(catchItem.date)} />
        <DetailBox icon="clock" label="Time" value={formatTime(catchItem.date)} />
      </View>

      {/* Notes */}
      {catchItem.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{catchItem.notes}</Text>
          </View>
        </View>
      )}

      {/* Weather if available */}
      {catchItem.weather && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather at Time of Catch</Text>
          <View style={styles.weatherCard}>
            <Text style={styles.weatherTemp}>{catchItem.weather.temp}°C</Text>
            <Text style={styles.weatherDesc}>{catchItem.weather.description}</Text>
            <Text style={styles.weatherWind}>Wind: {catchItem.weather.wind}km/h</Text>
          </View>
        </View>
      )}

      {/* Share Card */}
      <TouchableOpacity
        style={styles.shareCatchCardBtn}
        onPress={() => router.push({ pathname: '/catch-card-share' as any, params: { id: catchItem.id } })}
      >
        <MaterialCommunityIcons name="share-variant" size={18} color={colors.primary} />
        <Text style={styles.shareCatchCardBtnText}>Share Catch Card</Text>
      </TouchableOpacity>

      {/* Delete */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <MaterialCommunityIcons name="trash-can" size={18} color={colors.danger} />
        <Text style={styles.deleteBtnText}>Delete Catch</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function DetailBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailBox}>
      <MaterialCommunityIcons name={icon as any} size={16} color={colors.primary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  photo: {
    width: '100%',
    height: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  species: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  headerRight: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  weight: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  weatherCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  weatherDesc: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  weatherWind: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  shareCatchCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
  },
  shareCatchCardBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  photoCard: { marginHorizontal: spacing.lg, marginBottom: 16, borderRadius: radius.md, overflow: 'hidden', height: 220, position: 'relative' },
  catchPhoto: { width: '100%', height: '100%' },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.4)' },
  locationChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationChipText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  noPhotoCard: { marginHorizontal: spacing.lg, marginBottom: 16, height: 100, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 8 },
  noPhotoText: { fontSize: 12, color: colors.textSecondary },
  shareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: spacing.lg, marginBottom: 16 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)' },
  shareBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  catchMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  catchMetaText: { fontSize: 11, color: colors.textSecondary },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
});
