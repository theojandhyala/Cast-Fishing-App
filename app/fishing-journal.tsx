import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SAMPLE_JOURNAL_ENTRIES, JournalEntry } from '../data/journalData';
import { colors, radius, spacing } from '../constants/theme';

const MOODS = ['😄', '🙂', '😌', '😔', '🤩'];
const STORAGE_KEY = '@cast_journal_entries';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function FishingJournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);

  // New entry form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newMood, setNewMood] = useState('😄');
  const [newSpecies, setNewSpecies] = useState('');
  const [newSpot, setNewSpot] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        setEntries(SAMPLE_JOURNAL_ENTRIES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_JOURNAL_ENTRIES));
      }
    } catch {
      setEntries(SAMPLE_JOURNAL_ENTRIES);
    }
  };

  const saveEntry = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Title required', 'Please enter a title for your journal entry.');
      return;
    }
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: todayStr(),
      title: newTitle.trim(),
      body: newBody.trim(),
      mood: newMood,
      spot: newSpot.trim() || undefined,
      species: newSpecies.trim() ? [newSpecies.trim()] : [],
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    setModalOpen(false);
    setNewTitle(''); setNewBody(''); setNewMood('😄'); setNewSpecies(''); setNewSpot('');
  };

  const clearAll = () => {
    Alert.alert('Clear Journal', 'This will delete all journal entries. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          setEntries([]);
          try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
        }
      },
    ]);
  };

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.body.toLowerCase().includes(search.toLowerCase()) ||
    (e.spot || '').toLowerCase().includes(search.toLowerCase())
  );

  const hasToday = entries.some(e => e.date === todayStr());

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['rgba(16,185,129,0.12)', 'transparent']} style={styles.hero}>
          <MaterialCommunityIcons name="book-open" size={40} color={colors.success} />
          <Text style={styles.heroTitle}>Fishing Journal</Text>
          <Text style={styles.heroSub}>Record your sessions, moments and memories</Text>
        </LinearGradient>

        {/* Today's entry shortcut */}
        {!hasToday && (
          <TouchableOpacity style={styles.todayBanner} onPress={() => setModalOpen(true)}>
            <MaterialCommunityIcons name="pencil-plus" size={20} color={colors.success} />
            <Text style={styles.todayBannerText}>Add today's session notes</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.success} />
          </TouchableOpacity>
        )}

        {/* Search + actions */}
        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search entries..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
            <MaterialCommunityIcons name="plus" size={20} color="#0A0E1A" />
          </TouchableOpacity>
        </View>

        {/* Entries */}
        <View style={styles.entriesList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📔</Text>
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptyText}>Tap the + button to write your first journal entry.</Text>
            </View>
          ) : (
            filtered.map(entry => (
              <TouchableOpacity key={entry.id} style={styles.entryCard} onPress={() => setViewEntry(entry)}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMood}>{entry.mood}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryTitle} numberOfLines={1}>{entry.title}</Text>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  </View>
                  {entry.spot && (
                    <View style={styles.spotBadge}>
                      <MaterialCommunityIcons name="map-marker" size={10} color={colors.primary} />
                      <Text style={styles.spotBadgeText} numberOfLines={1}>{entry.spot}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.entryPreview} numberOfLines={2}>{entry.body}</Text>
                {entry.species && entry.species.length > 0 && (
                  <View style={styles.tagsRow}>
                    {entry.species.map(s => (
                      <View key={s} style={styles.tagChip}>
                        <Text style={styles.tagText}>🐟 {s}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {entries.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
            <MaterialCommunityIcons name="delete-outline" size={16} color={colors.danger} />
            <Text style={styles.clearBtnText}>Clear all entries</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Add entry modal */}
      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Entry</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.fieldLabel}>MOOD</Text>
              <View style={styles.moodRow}>
                {MOODS.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.moodBtn, newMood === m && styles.moodBtnActive]}
                    onPress={() => setNewMood(m)}
                  >
                    <Text style={styles.moodEmoji}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>TITLE *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Give your session a title..."
                placeholderTextColor={colors.textSecondary}
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <Text style={styles.fieldLabel}>SESSION NOTES</Text>
              <TextInput
                style={[styles.fieldInput, styles.textArea]}
                placeholder="Write about your session — what worked, the weather, memorable moments..."
                placeholderTextColor={colors.textSecondary}
                value={newBody}
                onChangeText={setNewBody}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.fieldLabel}>LOCATION / SPOT</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Redmire Pool"
                placeholderTextColor={colors.textSecondary}
                value={newSpot}
                onChangeText={setNewSpot}
              />
              <Text style={styles.fieldLabel}>SPECIES CAUGHT</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Common Carp"
                placeholderTextColor={colors.textSecondary}
                value={newSpecies}
                onChangeText={setNewSpecies}
              />
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="image-plus" size={28} color={colors.textSecondary} />
                <Text style={styles.photoPlaceholderText}>Photo attachment (coming soon)</Text>
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEntry}>
                <Text style={styles.saveBtnText}>Save Entry</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* View entry modal */}
      <Modal visible={!!viewEntry} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{viewEntry?.title}</Text>
            <TouchableOpacity onPress={() => setViewEntry(null)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          {viewEntry && (
            <ScrollView style={styles.modalScroll}>
              <View style={styles.viewMeta}>
                <Text style={styles.viewMood}>{viewEntry.mood}</Text>
                <Text style={styles.viewDate}>{formatDate(viewEntry.date)}</Text>
                {viewEntry.spot && (
                  <View style={styles.viewSpot}>
                    <MaterialCommunityIcons name="map-marker" size={13} color={colors.primary} />
                    <Text style={styles.viewSpotText}>{viewEntry.spot}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.viewBody}>{viewEntry.body}</Text>
              {viewEntry.species && viewEntry.species.length > 0 && (
                <View style={styles.tagsRow}>
                  {viewEntry.species.map(s => (
                    <View key={s} style={styles.tagChip}>
                      <Text style={styles.tagText}>🐟 {s}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={{ height: 60 }} />
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.sm },
  heroSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  todayBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' },
  todayBannerText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.success },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: colors.textPrimary },
  addBtn: { width: 42, height: 42, backgroundColor: colors.success, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  entriesList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  entryCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  entryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  entryMood: { fontSize: 28 },
  entryTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  entryDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  spotBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 3, maxWidth: 120 },
  spotBadgeText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  entryPreview: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tagChip: { backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.lg, paddingVertical: spacing.md, backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)' },
  clearBtnText: { fontSize: 14, color: colors.danger, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  modalScroll: { flex: 1, padding: spacing.lg },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: spacing.sm, marginTop: spacing.md },
  fieldInput: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary },
  textArea: { minHeight: 160, paddingTop: spacing.md },
  moodRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  moodBtn: { width: 50, height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  moodBtnActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  moodEmoji: { fontSize: 28 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', height: 80, marginTop: spacing.md, gap: 6 },
  photoPlaceholderText: { fontSize: 13, color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.success, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  viewMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg, flexWrap: 'wrap' },
  viewMood: { fontSize: 36 },
  viewDate: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  viewSpot: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewSpotText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  viewBody: { fontSize: 16, color: colors.textPrimary, lineHeight: 26 },
});
