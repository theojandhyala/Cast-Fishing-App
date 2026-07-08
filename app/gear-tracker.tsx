import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useGearStore } from '../store/gearStore';
import { GEAR_CATEGORIES } from '../data/gearCategories';
import { colors, spacing, radius } from '../constants/theme';

const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'];

const CATEGORY_ICONS: Record<string, string> = {
  rods: 'fishing',
  reels: 'cog',
  lines: 'thread',
  hooks: 'hook',
  lures: 'sparkles',
  bait: 'bug',
  terminal: 'anchor',
  clothing: 'tshirt-crew',
  electronics: 'satellite-uplink',
  accessories: 'bag-personal',
};

export default function GearTrackerScreen() {
  const router = useRouter();
  const { gear, removeItem, updateItem, toggleWishlist, getTotalValue, getWishlistValue } = useGearStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showWishlist, setShowWishlist] = useState(false);

  const filteredGear = gear.filter(g => {
    if (showWishlist) return g.isWishlist;
    if (activeCategory === 'all') return !g.isWishlist;
    return g.category === activeCategory && !g.isWishlist;
  });

  const totalValue = getTotalValue();
  const wishlistValue = getWishlistValue();

  const handleDelete = (id: string) => {
    Alert.alert('Remove Item', 'Delete this gear item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(0,212,170,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gear Tracker</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Value Summary */}
      <View style={styles.valueSummary}>
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Kit Value</Text>
          <Text style={styles.valueAmount}>£{totalValue.toLocaleString()}</Text>
          <Text style={styles.valueCount}>{gear.filter(g => !g.isWishlist).length} items</Text>
        </View>
        <View style={styles.valueDivider} />
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Wishlist</Text>
          <Text style={[styles.valueAmount, { color: colors.secondary }]}>£{wishlistValue.toLocaleString()}</Text>
          <Text style={styles.valueCount}>{gear.filter(g => g.isWishlist).length} items</Text>
        </View>
      </View>

      {/* Toggle wishlist */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, !showWishlist && styles.toggleBtnActive]}
          onPress={() => setShowWishlist(false)}
        >
          <Text style={[styles.toggleText, !showWishlist && styles.toggleTextActive]}>My Gear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, showWishlist && styles.toggleBtnActive]}
          onPress={() => setShowWishlist(true)}
        >
          <View style={styles.toggleContentRow}>
            <MaterialCommunityIcons name="star" size={14} color={showWishlist ? colors.primary : colors.textSecondary} />
            <Text style={[styles.toggleText, showWishlist && styles.toggleTextActive]}>Wishlist</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      {!showWishlist && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
          <TouchableOpacity
            style={[styles.catChip, activeCategory === 'all' && styles.catChipActive]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={[styles.catChipText, activeCategory === 'all' && styles.catChipTextActive]}>All</Text>
          </TouchableOpacity>
          {GEAR_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, activeCategory === cat.id && styles.catChipActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <View style={styles.catChipContentRow}>
                <MaterialCommunityIcons name={(CATEGORY_ICONS[cat.id] || 'tools') as any} size={14} color={activeCategory === cat.id ? colors.primary : colors.textSecondary} />
                <Text style={[styles.catChipText, activeCategory === cat.id && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.list}>
          {filteredGear.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="bag-personal-outline" size={48} color={colors.textSecondary} style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyTitle}>No gear here yet</Text>
              <Text style={styles.emptyText}>{showWishlist ? 'Mark items as wishlist from your gear' : 'Your tackle box is empty'}</Text>
            </View>
          ) : (
            filteredGear.map(item => {
              const cat = GEAR_CATEGORIES.find(c => c.id === item.category);
              return (
                <View key={item.id} style={styles.gearCard}>
                  <View style={[styles.catIcon, { backgroundColor: (cat?.color || colors.primary) + '22' }]}>
                    <MaterialCommunityIcons name={(CATEGORY_ICONS[cat?.id || ''] || 'toolbox') as any} size={22} color={cat?.color || colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.gearHeader}>
                      <Text style={styles.gearName}>{item.name}</Text>
                      {item.isWishlist && (
                        <View style={styles.wishlistBadgeRow}>
                          <MaterialCommunityIcons name="star" size={11} color={colors.secondary} />
                          <Text style={styles.wishlistBadge}>Wishlist</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.gearBrand}>{item.brand} — {item.model}</Text>
                    <View style={styles.gearFooter}>
                      <View style={styles.conditionDots}>
                        {[1,2,3,4,5].map(n => (
                          <View key={n} style={[styles.dot, { backgroundColor: n <= item.condition ? colors.primary : colors.border }]} />
                        ))}
                        <Text style={styles.conditionLabel}>{CONDITIONS[5 - item.condition] || 'Good'}</Text>
                      </View>
                      <Text style={styles.gearValue}>£{item.estimatedValue}</Text>
                    </View>
                    {item.notes ? <Text style={styles.gearNotes} numberOfLines={2}>{item.notes}</Text> : null}
                    {item.purchaseDate ? (
                      <Text style={styles.gearDate}>
                        Bought: {new Date(item.purchaseDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.gearActions}>
                    <TouchableOpacity onPress={() => toggleWishlist(item.id)} style={styles.actionBtn}>
                      <MaterialCommunityIcons name={item.isWishlist ? 'star' : 'star-outline'} size={18} color={colors.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Maintenance reminder */}
        {!showWishlist && (
          <View style={styles.maintenanceCard}>
            <MaterialCommunityIcons name="wrench" size={20} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.maintenanceTitle}>Maintenance Reminder</Text>
              <Text style={styles.maintenanceText}>Your Shimano Baitrunner was last serviced 5 months ago — consider an oil & grease service before the season.</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  valueSummary: { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  valueCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  valueDivider: { width: 1, backgroundColor: colors.border },
  valueLabel: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  valueAmount: { fontSize: 24, fontWeight: '800', color: colors.primary, marginTop: 2 },
  valueCount: { fontSize: 11, color: colors.textSecondary },
  toggleRow: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.sm },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  toggleBtnActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  toggleTextActive: { color: colors.primary },
  toggleContentRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoriesScroll: { marginBottom: spacing.sm },
  categoriesContent: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs },
  catChipActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  catChipContentRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  catChipText: { fontSize: 13, color: colors.textSecondary },
  catChipTextActive: { color: colors.primary, fontWeight: '600' },
  list: { paddingHorizontal: spacing.lg },
  gearCard: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  catIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  gearHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
  gearName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  wishlistBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.full },
  wishlistBadge: { fontSize: 11, color: colors.secondary },
  gearBrand: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  gearFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  conditionDots: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  conditionLabel: { fontSize: 11, color: colors.textSecondary, marginLeft: 4 },
  gearValue: { fontSize: 13, fontWeight: '700', color: colors.primary },
  gearNotes: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  gearDate: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  gearActions: { justifyContent: 'flex-start', gap: spacing.xs },
  actionBtn: { padding: 4 },
  maintenanceCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: radius.lg, margin: spacing.lg, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  maintenanceTitle: { fontSize: 14, fontWeight: '700', color: colors.warning, marginBottom: 4 },
  maintenanceText: { fontSize: 13, color: colors.textSecondary },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
