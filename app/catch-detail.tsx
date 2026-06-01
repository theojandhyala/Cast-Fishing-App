import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { colors, radius, spacing } from '../constants/theme';

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
      {catchItem.photo ? (
        <Image source={{ uri: catchItem.photo }} style={styles.photo} />
      ) : (
        <View style={styles.emojiHero}>
          <Text style={styles.heroEmoji}>{catchItem.emoji || '🐟'}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.species}>{catchItem.species}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.weight}>{catchItem.weight}kg</Text>
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
  emojiHero: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 80,
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
