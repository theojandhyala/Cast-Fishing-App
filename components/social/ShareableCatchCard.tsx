import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../ui/Icon';
import { Catch } from '../../store/catchStore';
import { colors, fonts, radius, spacing } from '../../constants/theme';

interface ShareableCatchCardProps {
  catchItem: Catch;
  anglerName: string;
  level: number;
  variant?: 'tide' | 'sunset';
}

const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, {
  day: 'numeric', month: 'short', year: 'numeric',
});

export const ShareableCatchCard = memo(function ShareableCatchCard({
  catchItem,
  anglerName,
  level,
  variant = 'tide',
}: ShareableCatchCardProps) {
  const gradient = variant === 'tide'
    ? ['#071B25', '#0A0E1A', '#0B2A26'] as const
    : ['#251428', '#101827', '#332111'] as const;

  return (
    <LinearGradient colors={gradient} style={styles.card} accessible accessibilityLabel={`Share card: ${catchItem.weight} kilograms ${catchItem.species}, caught by ${anglerName}`}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>CAST</Text>
        <Text style={styles.brandTag}>THE WATER REMEMBERS</Text>
      </View>
      <View style={styles.rule} />
      <View style={styles.hero}>
        <View style={styles.glow} />
        <Icon name="fish" size={92} color={colors.primary} />
        <Text style={styles.species}>{catchItem.species}</Text>
        <Text style={styles.weight}>{catchItem.weight.toFixed(1)} KG</Text>
      </View>
      <View style={styles.detailGrid}>
        <View style={styles.detail}><Icon name="map-marker-outline" size={16} color={colors.primary} /><Text style={styles.detailLabel}>WATER</Text><Text style={styles.detailValue} numberOfLines={1}>{catchItem.location || 'Secret spot'}</Text></View>
        <View style={styles.detail}><Icon name="hook" size={16} color={colors.primary} /><Text style={styles.detailLabel}>BAIT</Text><Text style={styles.detailValue} numberOfLines={1}>{catchItem.bait || 'Not logged'}</Text></View>
        <View style={styles.detail}><Icon name="calendar-blank-outline" size={16} color={colors.primary} /><Text style={styles.detailLabel}>DATE</Text><Text style={styles.detailValue}>{formatDate(catchItem.date)}</Text></View>
        <View style={styles.detail}><Icon name="ruler" size={16} color={colors.primary} /><Text style={styles.detailLabel}>LENGTH</Text><Text style={styles.detailValue}>{catchItem.length ? `${catchItem.length} cm` : '—'}</Text></View>
      </View>
      <View style={styles.footer}>
        <View>
          <Text style={styles.angler}>{anglerName}</Text>
          <Text style={styles.level}>LEVEL {level} ANGLER</Text>
        </View>
        <Text style={styles.hashtag}>#CAUGHTWITHCAST</Text>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 430, aspectRatio: 0.78, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)', overflow: 'hidden' },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: colors.primary, fontSize: 23, fontWeight: '900', letterSpacing: 5 },
  brandTag: { color: colors.textSecondary, fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  rule: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: spacing.md },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(0,212,170,0.06)' },
  species: { color: colors.textPrimary, fontSize: 29, fontWeight: '900', textAlign: 'center', marginTop: spacing.sm },
  weight: { color: colors.primary, fontFamily: fonts.monoBold, fontSize: 23, letterSpacing: 1.5, marginTop: 4 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: spacing.md },
  detail: { width: '50%', minHeight: 52, paddingRight: spacing.sm, marginBottom: spacing.sm },
  detailLabel: { color: colors.textTertiary, fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginTop: 3 },
  detailValue: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: spacing.md },
  angler: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  level: { color: colors.textSecondary, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  hashtag: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});
