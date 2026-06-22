import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { TACKLE_SHOPS } from '../data/tackleShopsData';
import { colors, radius, spacing } from '../constants/theme';

type SpecFilter = 'all' | 'carp' | 'sea' | 'fly' | 'general' | 'coarse';

const SPEC_COLORS: Record<string, string> = {
  carp: '#10B981',
  sea: '#3B82F6',
  fly: '#8B5CF6',
  general: colors.primary,
  coarse: '#F59E0B',
};

function stars(rating: number) {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

export default function TackleShopsScreen() {
  const [openOnly, setOpenOnly] = useState(false);
  const [specFilter, setSpecFilter] = useState<SpecFilter>('all');

  const filtered = TACKLE_SHOPS.filter(s => {
    if (openOnly && !s.isOpenNow) return false;
    if (specFilter !== 'all' && s.speciality !== specFilter) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Filters */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={[styles.toggleChip, openOnly && styles.toggleChipActive]} onPress={() => setOpenOnly(!openOnly)}>
          <MaterialCommunityIcons name="clock-check" size={14} color={openOnly ? '#0A0E1A' : colors.textSecondary} />
          <Text style={[styles.toggleChipText, openOnly && styles.toggleChipTextActive]}>Open Now</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specBar} contentContainerStyle={styles.specContent}>
        {(['all', 'carp', 'sea', 'fly', 'general', 'coarse'] as SpecFilter[]).map(s => (
          <TouchableOpacity key={s} style={[styles.specChip, specFilter === s && styles.specChipActive, specFilter === s && { borderColor: SPEC_COLORS[s] || colors.primary }]} onPress={() => setSpecFilter(s)}>
            <Text style={[styles.specText, specFilter === s && { color: SPEC_COLORS[s] || colors.primary }]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map(shop => (
          <View key={shop.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  {shop.isOpenNow ? (
                    <View style={styles.openBadge}><Text style={styles.openText}>Open</Text></View>
                  ) : (
                    <View style={styles.closedBadge}><Text style={styles.closedText}>Closed</Text></View>
                  )}
                </View>
                <Text style={styles.shopAddress}>{shop.address}, {shop.city}</Text>
              </View>
              <View style={[styles.specTag, { backgroundColor: (SPEC_COLORS[shop.speciality] || colors.primary) + '22' }]}>
                <Text style={[styles.specTagText, { color: SPEC_COLORS[shop.speciality] || colors.primary }]}>{shop.speciality}</Text>
              </View>
            </View>
            <Text style={styles.description}>{shop.description}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.ratingText, { color: colors.secondary }]}>{stars(shop.rating)}</Text>
              <Text style={styles.ratingCount}>{shop.rating} ({shop.reviewCount} reviews)</Text>
              <Text style={styles.distance}>{shop.distance}km away</Text>
            </View>
            <View style={styles.hoursRow}>
              <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.hoursText}>Mon-Fri: {shop.openingHours.weekday} • Wknd: {shop.openingHours.weekend}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Call', `Call ${shop.name} on ${shop.phone}?`)}>
                <MaterialCommunityIcons name="phone" size={14} color={colors.primary} />
                <Text style={styles.actionText}>{shop.phone}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Directions', `Open maps for ${shop.address}, ${shop.city}`)}>
                <MaterialCommunityIcons name="directions" size={14} color={colors.primary} />
                <Text style={styles.actionText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="store-off" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No shops match your filters</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterBar: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  toggleChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  toggleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  toggleChipTextActive: { color: '#0A0E1A' },
  specBar: { marginTop: spacing.sm },
  specContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  specChip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  specChipActive: { backgroundColor: 'rgba(0,212,170,0.08)' },
  specText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  affiliateBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,212,170,0.08)', borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)', padding: spacing.md, marginBottom: spacing.md },
  affiliateTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  affiliateSub: { fontSize: 12, color: colors.textSecondary },
  affiliateBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg },
  affiliateBtnText: { fontSize: 13, fontWeight: '700', color: '#0A0E1A' },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  shopName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  openBadge: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  openText: { fontSize: 10, color: colors.success, fontWeight: '700' },
  closedBadge: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  closedText: { fontSize: 10, color: colors.danger, fontWeight: '700' },
  shopAddress: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  specTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  specTagText: { fontSize: 11, fontWeight: '700' },
  description: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ratingText: { fontSize: 13 },
  ratingCount: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  distance: { fontSize: 12, color: colors.primary },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hoursText: { fontSize: 11, color: colors.textSecondary },
  cardActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.surface2, borderRadius: radius.md, paddingVertical: spacing.sm },
  actionText: { fontSize: 13, color: colors.primary },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
