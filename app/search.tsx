import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORLD_SPOTS } from '../data/worldSpots';
import { species as speciesData } from '../data/species';
import { knots as KNOTS } from '../data/knots';
import { BAITS as BAIT_DATA } from '../data/baitData';
import { colors, radius, spacing } from '../constants/theme';

const RECENT_KEY = 'cast_recent_searches';
const MAX_RECENT = 8;

const SUGGESTIONS = ['Carp', 'River Thames', 'Bowline Knot', 'Boilies', 'Pike', 'Loch Lomond'];

function highlight(text: string, query: string): string {
  return text; // plain text — bold done via component
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  useEffect(() => {
    loadRecent();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const loadRecent = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  };

  const saveRecent = async (q: string) => {
    const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const clearRecent = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_KEY);
  };

  const q = query.toLowerCase().trim();

  const spotResults = q
    ? WORLD_SPOTS.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.species.some((sp) => sp.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const speciesResults = q
    ? speciesData.filter(
        (s) =>
          s.commonName.toLowerCase().includes(q) ||
          s.latinName.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const knotResults = q
    ? KNOTS.filter(
        (k) =>
          k.name.toLowerCase().includes(q) ||
          k.useCase?.toLowerCase().includes(q) ||
          k.tags?.some((t: string) => t.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const baitResults = q
    ? BAIT_DATA.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.bestSpecies?.some((sp: string) => sp.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const hasResults =
    spotResults.length > 0 ||
    speciesResults.length > 0 ||
    knotResults.length > 0 ||
    baitResults.length > 0;

  const handleSearchSubmit = () => {
    if (query.trim()) saveRecent(query.trim());
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    saveRecent(s);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search spots, species, knots, baits..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Empty state / suggestions */}
        {!q && (
          <View style={styles.emptyState}>
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecent}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((r) => (
                  <TouchableOpacity key={r} style={styles.recentRow} onPress={() => setQuery(r)}>
                    <MaterialCommunityIcons name="history" size={16} color={colors.textSecondary} />
                    <Text style={styles.recentText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Try Searching For</Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSuggestion(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Results */}
        {q && (
          <View style={styles.results}>
            {!hasResults && (
              <View style={styles.noResults}>
                <MaterialCommunityIcons name="magnify" size={48} color={colors.textSecondary} style={styles.noResultsEmoji} />
                <Text style={styles.noResultsTitle}>No results for "{query}"</Text>
                <Text style={styles.noResultsSub}>Try a different search term</Text>
              </View>
            )}

            {spotResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Spots ({spotResults.length})</Text>
                {spotResults.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.resultRow}
                    onPress={() => {
                      saveRecent(query.trim());
                      router.push('/(tabs)/map' as any);
                    }}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: 'rgba(0,212,170,0.1)' }]}>
                      <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{s.name}</Text>
                      <Text style={styles.resultSub}>{s.country} · {s.type} · {s.rating}★</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {speciesResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Species ({speciesResults.length})</Text>
                {speciesResults.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.resultRow}
                    onPress={() => {
                      saveRecent(query.trim());
                      router.push({ pathname: '/species-detail', params: { id: s.id } });
                    }}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                      <MaterialCommunityIcons name="fish" size={16} color="#F59E0B" />
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{s.commonName}</Text>
                      <Text style={styles.resultSub}>{s.latinName} · {s.difficulty}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {knotResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Knots ({knotResults.length})</Text>
                {knotResults.map((k) => (
                  <TouchableOpacity
                    key={k.id}
                    style={styles.resultRow}
                    onPress={() => {
                      saveRecent(query.trim());
                      router.push({ pathname: '/knot-detail', params: { id: k.id } });
                    }}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: 'rgba(139,92,246,0.1)' }]}>
                      <MaterialCommunityIcons name="link" size={16} color="#8B5CF6" />
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{k.name}</Text>
                      <Text style={styles.resultSub}>{k.useCase || 'Knot tutorial'}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {baitResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Baits ({baitResults.length})</Text>
                {baitResults.map((b) => (
                  <TouchableOpacity
                    key={b.name}
                    style={styles.resultRow}
                    onPress={() => {
                      saveRecent(query.trim());
                      router.push('/bait-guide' as any);
                    }}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                      <MaterialCommunityIcons name="food-drumstick" size={16} color={colors.success} />
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{b.name}</Text>
                      <Text style={styles.resultSub}>{b.category || 'Bait'}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyState: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  clearText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  results: {
    paddingTop: spacing.sm,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  noResultsEmoji: {
    marginBottom: spacing.md,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  noResultsSub: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  resultSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
