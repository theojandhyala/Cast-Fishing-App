import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTripStore } from '../store/tripStore';
import { colors, spacing, radius } from '../constants/theme';

const SPECIES_OPTIONS = ['Carp', 'Pike', 'Perch', 'Barbel', 'Tench', 'Bream', 'Roach', 'Chub', 'Trout', 'Salmon'];

const FORECAST = [
  { day: 'Today', icon: 'weather-partly-cloudy', score: 72, temp: 14 },
  { day: 'Tue', icon: 'weather-pouring', score: 45, temp: 11 },
  { day: 'Wed', icon: 'weather-sunny', score: 88, temp: 17 },
  { day: 'Thu', icon: 'weather-partly-cloudy', score: 76, temp: 15 },
  { day: 'Fri', icon: 'weather-windy', score: 62, temp: 13 },
  { day: 'Sat', icon: 'weather-sunny', score: 91, temp: 18 },
  { day: 'Sun', icon: 'weather-partly-cloudy', score: 79, temp: 16 },
];

function scoreColor(score: number) {
  if (score >= 75) return colors.success;
  if (score >= 50) return colors.warning;
  return colors.danger;
}

export default function TripPlannerScreen() {
  const router = useRouter();
  const { trips, addTrip, updateTrip, removeTrip, getUpcomingTrips, getPastTrips } = useTripStore();
  const [tab, setTab] = useState<'plan' | 'trips'>('trips');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [checklist, setChecklist] = useState([
    { id: 'rod', label: 'Rod(s)', checked: false, icon: 'fishing' },
    { id: 'reel', label: 'Reel(s)', checked: false, icon: 'cog' },
    { id: 'bait', label: 'Bait', checked: false, icon: 'bug' },
    { id: 'licence', label: 'Rod Licence', checked: false, icon: 'file-document-outline' },
    { id: 'net', label: 'Landing Net', checked: false, icon: 'spider-web' },
    { id: 'mat', label: 'Unhooking Mat', checked: false, icon: 'bed-outline' },
    { id: 'scales', label: 'Scales', checked: false, icon: 'scale-balance' },
    { id: 'food', label: 'Food & Drink', checked: false, icon: 'food-apple-outline' },
  ]);

  const upcoming = getUpcomingTrips();
  const past = getPastTrips();

  const toggleSpecies = (s: string) => {
    setSelectedSpecies(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleSave = () => {
    if (!title || !location) {
      Alert.alert('Missing Info', 'Please enter a title and location.');
      return;
    }
    const tripDate = new Date();
    tripDate.setDate(tripDate.getDate() + selectedDay);
    addTrip({
      title,
      date: tripDate.toISOString(),
      location,
      targetSpecies: selectedSpecies,
      fishingScore: FORECAST[selectedDay].score,
      notes,
      checklist,
      catchIds: [],
      status: 'upcoming',
    });
    Alert.alert('Trip Saved!', 'Your trip has been added to your planner.');
    setTitle(''); setLocation(''); setSelectedSpecies([]); setNotes('');
    setTab('trips');
  };

  const forecast = FORECAST[selectedDay];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(0,212,170,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Planner</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.tabs}>
        {(['trips', 'plan'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <View style={styles.tabContentRow}>
              <MaterialCommunityIcons
                name={t === 'trips' ? 'calendar-month-outline' : 'plus-circle-outline'}
                size={16}
                color={tab === t ? '#0A0E1A' : colors.textSecondary}
              />
              <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                {t === 'trips' ? 'My Trips' : 'Plan Trip'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'trips' ? (
          <View style={styles.content}>
            {upcoming.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>UPCOMING TRIPS</Text>
                {upcoming.map(trip => (
                  <TripCard key={trip.id} trip={trip} onDelete={() => removeTrip(trip.id)} />
                ))}
              </>
            )}
            {past.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>PAST TRIPS</Text>
                {past.map(trip => (
                  <TripCard key={trip.id} trip={trip} onDelete={() => removeTrip(trip.id)} isPast />
                ))}
              </>
            )}
            {upcoming.length === 0 && past.length === 0 && (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={56} color={colors.textSecondary} style={{ marginBottom: spacing.md }} />
                <Text style={styles.emptyTitle}>No trips yet</Text>
                <Text style={styles.emptyText}>Plan your first fishing trip!</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setTab('plan')}>
                  <Text style={styles.emptyBtnText}>Plan a Trip</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.fieldLabel}>Trip Name</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Weekend Carp Session"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Location */}
            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Grafham Water"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Date / Forecast */}
            <Text style={styles.fieldLabel}>Date & Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
              {FORECAST.map((f, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.forecastCard, selectedDay === i && styles.forecastCardActive]}
                  onPress={() => setSelectedDay(i)}
                >
                  <Text style={styles.forecastDay}>{f.day}</Text>
                  <MaterialCommunityIcons name={f.icon as any} size={22} color={colors.textPrimary} style={styles.forecastIcon} />
                  <View style={[styles.scoreChip, { backgroundColor: scoreColor(f.score) + '33' }]}>
                    <Text style={[styles.scoreText, { color: scoreColor(f.score) }]}>{f.score}</Text>
                  </View>
                  <Text style={styles.forecastTemp}>{f.temp}°C</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Fishing score highlight */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>Fishing Score for {forecast.day}</Text>
              <Text style={[styles.scoreCardValue, { color: scoreColor(forecast.score) }]}>{forecast.score}/100</Text>
              <View style={styles.scoreCardDescRow}>
                <MaterialCommunityIcons
                  name={forecast.score >= 75 ? 'check-circle-outline' : forecast.score >= 50 ? 'alert-circle-outline' : 'close-circle-outline'}
                  size={14}
                  color={scoreColor(forecast.score)}
                />
                <Text style={styles.scoreCardDesc}>
                  {forecast.score >= 75 ? 'Excellent conditions — fish will be active!' :
                   forecast.score >= 50 ? 'Fair conditions — worth a try!' :
                   'Tough conditions — consider another day.'}
                </Text>
              </View>
            </View>

            {/* Target species */}
            <Text style={styles.fieldLabel}>Target Species</Text>
            <View style={styles.speciesGrid}>
              {SPECIES_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speciesChip, selectedSpecies.includes(s) && styles.speciesChipActive]}
                  onPress={() => toggleSpecies(s)}
                >
                  <Text style={[styles.speciesChipText, selectedSpecies.includes(s) && styles.speciesChipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Gear checklist */}
            <Text style={styles.fieldLabel}>Gear Checklist</Text>
            <View style={styles.card}>
              {checklist.map(item => (
                <TouchableOpacity key={item.id} style={styles.checkRow} onPress={() => toggleCheck(item.id)}>
                  <MaterialCommunityIcons name={item.icon as any} size={18} color={colors.textSecondary} style={styles.checkIcon} />
                  <Text style={[styles.checkLabel, item.checked && styles.checkLabelDone]}>{item.label}</Text>
                  <MaterialCommunityIcons
                    name={item.checked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={22}
                    color={item.checked ? colors.success : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Swim plans, bait strategy, anything..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#0A0E1A" />
              <Text style={styles.saveBtnText}>Save Trip</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TripCard({ trip, onDelete, isPast }: { trip: any; onDelete: () => void; isPast?: boolean }) {
  const date = new Date(trip.date);
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const sc = trip.fishingScore;
  const scColor = sc >= 75 ? colors.success : sc >= 50 ? colors.warning : colors.danger;

  return (
    <View style={[styles.tripCard, isPast && { opacity: 0.7 }]}>
      <View style={styles.tripCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <View style={styles.tripMetaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.tripMeta}>{trip.location}</Text>
          </View>
          <View style={styles.tripMetaRow}>
            <MaterialCommunityIcons name="calendar-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.tripMeta}>{dateStr}</Text>
          </View>
          {trip.targetSpecies.length > 0 && (
            <View style={styles.tripMetaRow}>
              <MaterialCommunityIcons name="target" size={13} color={colors.textSecondary} />
              <Text style={styles.tripMeta}>{trip.targetSpecies.join(', ')}</Text>
            </View>
          )}
        </View>
        <View style={styles.tripScoreBubble}>
          <Text style={[styles.tripScore, { color: scColor }]}>{sc}</Text>
          <Text style={styles.tripScoreLabel}>score</Text>
        </View>
      </View>
      {trip.notes ? <Text style={styles.tripNotes} numberOfLines={2}>{trip.notes}</Text> : null}
      <View style={styles.tripFooter}>
        <View style={[styles.statusBadge, { backgroundColor: isPast ? colors.surface2 : 'rgba(0,212,170,0.15)' }]}>
          <View style={styles.statusContentRow}>
            <MaterialCommunityIcons
              name={isPast ? 'check-circle-outline' : 'calendar-clock-outline'}
              size={12}
              color={isPast ? colors.textSecondary : colors.primary}
            />
            <Text style={[styles.statusText, { color: isPast ? colors.textSecondary : colors.primary }]}>
              {isPast ? 'Completed' : 'Upcoming'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  activeTab: { backgroundColor: colors.primary },
  tabContentRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  activeTabText: { color: '#0A0E1A' },
  content: { paddingHorizontal: spacing.lg },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.sm },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 15 },
  textarea: { height: 100, textAlignVertical: 'top' },
  forecastScroll: { marginBottom: spacing.sm },
  forecastCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, marginRight: spacing.sm, alignItems: 'center', minWidth: 70, borderWidth: 1, borderColor: colors.border },
  forecastCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(0,212,170,0.1)' },
  forecastDay: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  forecastIcon: { marginBottom: 4 },
  scoreChip: { borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  scoreText: { fontSize: 12, fontWeight: '700' },
  forecastTemp: { fontSize: 11, color: colors.textSecondary },
  scoreCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, alignItems: 'center' },
  scoreCardLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  scoreCardValue: { fontSize: 36, fontWeight: '800', marginBottom: 4 },
  scoreCardDescRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreCardDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  speciesChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  speciesChipActive: { backgroundColor: 'rgba(0,212,170,0.15)', borderColor: colors.primary },
  speciesChipText: { fontSize: 13, color: colors.textSecondary },
  speciesChipTextActive: { color: colors.primary, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  checkRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkIcon: { marginRight: spacing.sm },
  checkLabel: { flex: 1, fontSize: 15, color: colors.textPrimary },
  checkLabelDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, marginTop: spacing.md },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#0A0E1A' },
  empty: { alignItems: 'center', padding: spacing.xxl, marginTop: spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  emptyText: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 4 },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#0A0E1A' },
  tripCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  tripCardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  tripTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  tripMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  tripMeta: { fontSize: 13, color: colors.textSecondary },
  tripScoreBubble: { alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.lg, padding: spacing.sm, minWidth: 60 },
  tripScore: { fontSize: 24, fontWeight: '800' },
  tripScoreLabel: { fontSize: 10, color: colors.textSecondary },
  tripNotes: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: 'italic' },
  tripFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  statusContentRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 4 },
});
