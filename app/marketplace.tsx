import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PRODUCTS, Product } from '../data/productsData';
import { colors, radius, spacing } from '../constants/theme';

const CATEGORIES = ['All', 'Rods', 'Reels', 'Lines', 'Lures', 'Bait', 'Clothing', 'Electronics'];
const SORT_OPTIONS = ['Featured', 'Price Low-High', 'Price High-Low', 'Best Rated'];

export default function MarketplaceScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  const [maxPrice, setMaxPrice] = useState(300);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    if (sortBy === 'Price Low-High') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'Price High-Low') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'Best Rated') list = [...list].sort((a, b) => b.rating - a.rating);
    else list = [...list].sort((a, b) => (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0));
    return list;
  }, [selectedCategory, sortBy, maxPrice]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const priceSteps = [50, 100, 150, 200, 300];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['rgba(0,212,170,0.15)', 'transparent']} style={styles.hero}>
          <MaterialCommunityIcons name="store" size={40} color={colors.primary} />
          <Text style={styles.heroTitle}>Gear Up for the Season</Text>
          <Text style={styles.heroSub}>Best deals from top fishing brands</Text>
        </LinearGradient>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catBar} contentContainerStyle={styles.catContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters row */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortMenu(!showSortMenu)}>
            <MaterialCommunityIcons name="sort" size={16} color={colors.primary} />
            <Text style={styles.sortText}>{sortBy}</Text>
            <MaterialCommunityIcons name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Max £</Text>
            {priceSteps.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.pricePill, maxPrice === p && styles.pricePillActive]}
                onPress={() => setMaxPrice(p)}
              >
                <Text style={[styles.pricePillText, maxPrice === p && styles.pricePillTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {showSortMenu && (
          <View style={styles.sortMenu}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity key={opt} style={styles.sortOption} onPress={() => { setSortBy(opt); setShowSortMenu(false); }}>
                <Text style={[styles.sortOptionText, sortBy === opt && { color: colors.primary }]}>{opt}</Text>
                {sortBy === opt && <MaterialCommunityIcons name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results count */}
        <Text style={styles.resultsText}>{filtered.length} products</Text>

        {/* Products */}
        <View style={styles.productsGrid}>
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              wishlisted={wishlist.includes(product.id)}
              onWishlist={() => toggleWishlist(product.id)}
            />
          ))}
        </View>

        {/* Affiliate disclaimer */}
        <View style={styles.disclaimer}>
          <MaterialCommunityIcons name="information-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.disclaimerText}>
            CAST earns a small commission when you shop through our links. This helps keep the app free.
            All prices shown are indicative — check Angling Direct for current pricing.
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
      <Text style={{ fontSize: 12, color: colors.secondary, fontWeight: '700' }}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function ProductCard({ product, wishlisted, onWishlist }: { product: Product; wishlisted: boolean; onWishlist: () => void }) {
  return (
    <View style={styles.card}>
      {product.sponsored && (
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>SPONSORED</Text>
        </View>
      )}
      {product.discountPct && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{product.discountPct}% OFF</Text>
        </View>
      )}
      {/* Image placeholder */}
      <View style={styles.productImage}>
        <MaterialCommunityIcons name="shopping" size={36} color={colors.textSecondary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.brandText}>{product.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={product.rating} />
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.currentPrice}>£{product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>£{product.originalPrice.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => Alert.alert('Opening Angling Direct...', `Redirecting to Angling Direct for ${product.brand} ${product.name}`)}
          >
            <Text style={styles.shopBtnText}>Shop on Angling Direct</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heartBtn} onPress={onWishlist}>
            <MaterialCommunityIcons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={wishlisted ? '#EF4444' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.sm },
  heroSub: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  catBar: { marginBottom: spacing.md },
  catContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  catTextActive: { color: '#0A0E1A', fontWeight: '700' },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.sm, flexWrap: 'wrap' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: colors.border },
  sortText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, flexWrap: 'wrap' },
  priceLabel: { fontSize: 12, color: colors.textSecondary },
  pricePill: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  pricePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pricePillText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  pricePillTextActive: { color: '#0A0E1A' },
  sortMenu: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  sortOptionText: { fontSize: 14, color: colors.textPrimary },
  resultsText: { fontSize: 12, color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  productsGrid: { paddingHorizontal: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  sponsoredBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, zIndex: 1, backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' },
  sponsoredText: { fontSize: 9, color: colors.secondary, fontWeight: '800', letterSpacing: 0.5 },
  discountBadge: { position: 'absolute', top: spacing.sm, right: spacing.xl + spacing.md, zIndex: 1, backgroundColor: '#EF4444', borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  discountText: { fontSize: 10, color: '#fff', fontWeight: '800' },
  productImage: { height: 140, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: spacing.md, gap: 4 },
  brandText: { fontSize: 11, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  productDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewCount: { fontSize: 11, color: colors.textSecondary },
  priceBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  currentPrice: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  originalPrice: { fontSize: 14, color: colors.textSecondary, textDecorationLine: 'line-through' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  shopBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 10, alignItems: 'center' },
  shopBtnText: { fontSize: 13, fontWeight: '700', color: '#0A0E1A' },
  heartBtn: { width: 42, height: 42, backgroundColor: colors.surface2, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  disclaimerText: { flex: 1, fontSize: 11, color: colors.textSecondary, lineHeight: 17 },
});
