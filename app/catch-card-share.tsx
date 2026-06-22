import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '../components/ui/Icon';
import { ShareableCatchCard } from '../components/social/ShareableCatchCard';
import { useCatchStore } from '../store/catchStore';
import { useAuthStore } from '../store/authStore';
import { colors, radius, spacing, typography } from '../constants/theme';

export default function CatchCardShareScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const catches = useCatchStore((state) => state.catches);
  const user = useAuthStore((state) => state.user);
  const [variant, setVariant] = useState<'tide' | 'sunset'>('tide');
  const catchItem = id ? catches.find((item) => item.id === id) : catches[0];

  if (!catchItem) {
    return (
      <SafeAreaView style={styles.empty}>
        <Icon name="fish-off" size={42} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No catch to share</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.backLink}>Go back</Text></Pressable>
      </SafeAreaView>
    );
  }

  const anglerName = user?.name || 'CAST Angler';
  const handleShare = async () => {
    try {
      await Share.share({
        title: `${catchItem.species} catch — CAST`,
        message: `${anglerName} caught a ${catchItem.weight.toFixed(1)} kg ${catchItem.species} at ${catchItem.location || 'a secret spot'}. #CaughtWithCAST`,
      });
    } catch {
      Alert.alert('Share unavailable', 'The share sheet could not be opened right now.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.headerButton}><Icon name="chevron-left" size={28} color={colors.textPrimary} /></Pressable>
        <View style={styles.titleBlock}><Text style={styles.title}>Share your catch</Text><Text style={styles.subtitle}>A clean card, ready for your crew</Text></View>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.variantRow}>
          {(['tide', 'sunset'] as const).map((item) => (
            <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: variant === item }} onPress={() => setVariant(item)} style={[styles.variantButton, variant === item && styles.variantActive]}>
              <Text style={[styles.variantText, variant === item && styles.variantTextActive]}>{item === 'tide' ? 'Deep tide' : 'Last light'}</Text>
            </Pressable>
          ))}
        </View>
        <ShareableCatchCard catchItem={catchItem} anglerName={anglerName} level={user?.level || 1} variant={variant} />
        <Pressable accessibilityRole="button" accessibilityLabel="Open share sheet" onPress={handleShare} style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
          <Icon name="share-variant" size={21} color={colors.background} />
          <Text style={styles.shareText}>Share catch</Text>
        </Pressable>
        <Text style={styles.privacyNote}>Only the catch details shown above are included in the share text.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1, alignItems: 'center' },
  title: { ...typography.h3 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  scroll: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  variantRow: { flexDirection: 'row', alignSelf: 'stretch', gap: spacing.sm, marginVertical: spacing.md },
  variantButton: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  variantActive: { borderColor: colors.primary, backgroundColor: 'rgba(0,212,170,0.1)' },
  variantText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  variantTextActive: { color: colors.primary },
  shareButton: { alignSelf: 'stretch', minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primary },
  pressed: { opacity: 0.75 },
  shareText: { color: colors.background, fontSize: 16, fontWeight: '900' },
  privacyNote: { color: colors.textTertiary, fontSize: 11, textAlign: 'center', marginTop: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.background },
  emptyTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  backLink: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
