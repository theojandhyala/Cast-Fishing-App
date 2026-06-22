import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { useUserStore } from '../../store/userStore';
import { colors, fonts, spacing, radius } from '../../constants/theme';
import { pendingUsername, pendingDisplayName, pendingBio } from './username';
import { pendingAvatarUri } from './avatar';
import { pendingRegion } from './region';

const SPECIES_CATEGORIES = [
  { id: 'coarse', label: 'Coarse Fishing', icon: 'fish' as const, color: '#10B981' },
  { id: 'game', label: 'Game Fishing', icon: 'hook' as const, color: '#3B82F6' },
  { id: 'sea', label: 'Sea Fishing', icon: 'waves' as const, color: '#0EA5E9' },
  { id: 'bass', label: 'Bass Fishing', icon: 'lightning-bolt' as const, color: '#F59E0B' },
  { id: 'carp', label: 'Carp Fishing', icon: 'leaf' as const, color: '#84CC16' },
  { id: 'pike', label: 'Pike Fishing', icon: 'sword' as const, color: '#EF4444' },
  { id: 'fly', label: 'Fly Fishing', icon: 'feather' as const, color: '#8B5CF6' },
  { id: 'big_game', label: 'Big Game', icon: 'anchor' as const, color: '#F97316' },
  { id: 'tropical', label: 'Tropical', icon: 'white-balance-sunny' as const, color: '#EC4899' },
  { id: 'all', label: 'All Species', icon: 'earth' as const, color: '#00D4AA' },
];

export default function SpeciesScreen() {
  const router = useRouter();
  const { initUser } = useUserStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    if (id === 'all') {
      // All species — select only this one or deselect
      setSelected((prev) => (prev.includes('all') ? [] : ['all']));
      return;
    }
    setSelected((prev) => {
      const withoutAll = prev.filter((s) => s !== 'all');
      if (withoutAll.includes(id)) {
        return withoutAll.filter((s) => s !== id);
      }
      return [...withoutAll, id];
    });
  };

  const handleStart = async () => {
    if (selected.length === 0 || loading) return;
    setLoading(true);
    try {
      await initUser(
        pendingUsername,
        pendingDisplayName,
        pendingRegion,
        selected,
        pendingAvatarUri
      );
      router.replace('/(tabs)');
    } catch {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Icon name="arrow-left" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.step}>Step 4 of 4</Text>
        <Text style={styles.title}>What do you target?</Text>
        <Text style={styles.subtitle}>
          Select all that apply. We'll tailor your experience.
        </Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {SPECIES_CATEGORIES.map((cat) => {
              const isSelected = selected.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => toggle(cat.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.card,
                    isSelected && { borderColor: cat.color, backgroundColor: cat.color + '18' },
                  ]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: cat.color + '22' }]}>
                    <Icon name={cat.icon} size={24} color={isSelected ? cat.color : colors.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.cardText,
                      isSelected && { color: cat.color, fontFamily: fonts.bodySemi },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: cat.color }]}>
                      <Icon name="check" size={12} color="#0A0E1A" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.85}
          style={[styles.btn, (selected.length === 0 || loading) && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>
            {loading ? 'Setting up...' : 'Start Fishing'}
          </Text>
          {!loading && <Icon name="arrow-right" size={18} color="#0A0E1A" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: 40 },
  back: { marginTop: spacing.md, marginBottom: spacing.lg },
  step: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.textPrimary,
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  scroll: { flex: 1, marginBottom: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    position: 'relative',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#0A0E1A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
