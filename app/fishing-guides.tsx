import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { GUIDES, FishingGuide } from '../data/guidesData';
import { colors, radius, spacing } from '../constants/theme';

const SPECIALITIES = ['All', 'Carp', 'Pike', 'Salmon', 'Sea', 'Fly Fishing', 'Trout', 'Match Fishing'];
const PRICE_RANGES = [
  { label: 'Any', max: 999 },
  { label: '< £150', max: 150 },
  { label: '< £250', max: 250 },
  { label: '< £400', max: 400 },
];

export default function FishingGuidesScreen() {
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [maxPrice, setMaxPrice] = useState(999);
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    return GUIDES.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedSpec !== 'All' && !g.speciality.toLowerCase().includes(selectedSpec.toLowerCase())) return false;
      if (g.pricePerDay > maxPrice) return false;
      if (availableOnly && !g.available) return false;
      return true;
    });
  }, [search, selectedSpec, maxPrice, availableOnly]);

  const featured = filtered.find(g => g.featured);
  const rest = filtered.filter(g => !g.featured);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['rgba(0,212,170,0.12)', 'transparent']} style={styles.header}>
          <MaterialCommunityIcons name="account-tie" size={40} color={colors.primary} />
          <Text style={styles.headerTitle}>Find Your Guide</Text>
          <Text style={styles.headerSub}>Professional fishing guides across the UK, Ireland & beyond</Text>
        </LinearGradient>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or location..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Speciality filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specBar} contentContainerStyle={styles.specContent}>
          {SPECIALITIES.map(spec => (
            <TouchableOpacity
              key={spec}
              style={[styles.specChip, selectedSpec === spec && styles.specChipActive]}
              onPress={() => setSelectedSpec(spec)}
            >
              <Text style={[styles.specText, selectedSpec === spec && styles.specTextActive]}>{spec}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price & availability filters */}
        <View style={styles.filterRow}>
          {PRICE_RANGES.map(pr => (
            <TouchableOpacity
              key={pr.label}
              style={[styles.pricePill, maxPrice === pr.max && styles.pricePillActive]}
              onPress={() => setMaxPrice(pr.max)}
            >
              <Text style={[styles.pricePillText, maxPrice === pr.max && styles.pricePillTextActive]}>{pr.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.availPill, availableOnly && styles.availPillActive]}
            onPress={() => setAvailableOnly(!availableOnly)}
          >
            <Text style={[styles.availText, availableOnly && styles.availTextActive]}>Available</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.resultsText}>{filtered.length} guides found</Text>

        {/* Featured guide */}
        {featured && (
          <View style={styles.featuredSection}>
            <View style={styles.featuredLabel}>
              <MaterialCommunityIcons name="star" size={14} color={colors.secondary} />
              <Text style={styles.featuredLabelText}>FEATURED GUIDE</Text>
            </View>
            <GuideCard guide={featured} featured />
          </View>
        )}

        {/* Other guides */}
        <View style={styles.guidesList}>
          {rest.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function GuideCard({ guide, featured = false }: { guide: FishingGuide; featured?: boolean }) {
  return (
    <View style={[styles.card, featured && styles.featuredCard]}>
      <View style={styles.cardHeader}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: guide.avatarColor + '33', borderColor: guide.avatarColor + '66' }]}>
          <Text style={[styles.avatarText, { color: guide.avatarColor }]}>{guide.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.guideName}>{guide.name}</Text>
            <View style={[styles.statusBadge, guide.available ? styles.availBadge : styles.bookedBadge]}>
              <Text style={[styles.statusText, guide.available ? styles.availStatusText : styles.bookedStatusText]}>
                {guide.available ? 'Available' : 'Booked'}
              </Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={12} color={colors.textSecondary} />
            <Text style={styles.locationText}>{guide.location}, {guide.country}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="fish" size={12} color={colors.primary} />
            <Text style={styles.metaText}>{guide.speciality}</Text>
            <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{guide.yearsExperience}yrs exp</Text>
          </View>
        </View>
      </View>

      <Text style={styles.bio}>{guide.bio}</Text>

      <View style={styles.langRow}>
        <MaterialCommunityIcons name="translate" size={12} color={colors.textSecondary} />
        <Text style={styles.langText}>{guide.languages.join(', ')}</Text>
      </View>

      <View style={styles.ratingPriceRow}>
        <View style={styles.ratingGroup}>
          <MaterialCommunityIcons name="star" size={14} color={colors.secondary} />
          <Text style={styles.ratingText}>{guide.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({guide.reviewCount} reviews)</Text>
        </View>
        <Text style={styles.price}>£{guide.pricePerDay}<Text style={styles.perDay}>/day</Text></Text>
      </View>

      <TouchableOpacity
        style={[styles.bookBtn, !guide.available && styles.bookBtnDisabled]}
        onPress={() => {
          if (!guide.available) {
            Alert.alert('Guide Unavailable', `${guide.name} is currently fully booked. Check back soon or contact them directly.`);
          } else {
            Alert.alert(
              'Booking Request Sent',
              `Your booking request has been sent to ${guide.name}. They will contact you within 24 hours to confirm availability.`,
              [{ text: 'Great!', style: 'default' }]
            );
          }
        }}
      >
        <Text style={[styles.bookBtnText, !guide.available && styles.bookBtnTextDisabled]}>
          {guide.available ? 'Book Now' : 'Fully Booked'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.sm },
  headerSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  searchRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: colors.textPrimary },
  specBar: { marginBottom: spacing.md },
  specContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  specChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  specChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  specText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  specTextActive: { color: '#0A0E1A', fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' },
  pricePill: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  pricePillActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  pricePillText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  pricePillTextActive: { color: colors.primary },
  availPill: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  availPillActive: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: colors.success },
  availText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  availTextActive: { color: colors.success },
  resultsText: { fontSize: 12, color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  featuredSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  featuredLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  featuredLabelText: { fontSize: 11, fontWeight: '800', color: colors.secondary, letterSpacing: 1 },
  guidesList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  featuredCard: { borderColor: 'rgba(245,158,11,0.4)', backgroundColor: 'rgba(245,158,11,0.04)' },
  cardHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  avatarText: { fontSize: 18, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  guideName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  availBadge: { backgroundColor: 'rgba(16,185,129,0.15)' },
  bookedBadge: { backgroundColor: 'rgba(239,68,68,0.12)' },
  statusText: { fontSize: 11, fontWeight: '700' },
  availStatusText: { color: colors.success },
  bookedStatusText: { color: colors.danger },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  locationText: { fontSize: 12, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 12, color: colors.textSecondary, marginRight: 4 },
  bio: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langText: { fontSize: 12, color: colors.textSecondary },
  ratingPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingGroup: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  reviewCount: { fontSize: 12, color: colors.textSecondary },
  price: { fontSize: 22, fontWeight: '800', color: colors.primary },
  perDay: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  bookBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  bookBtnDisabled: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  bookBtnText: { fontSize: 15, fontWeight: '700', color: '#0A0E1A' },
  bookBtnTextDisabled: { color: colors.textSecondary },
});
