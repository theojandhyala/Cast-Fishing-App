import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../constants/theme';

const SPECIES_SEASONS = [
  { name: 'Carp Season', date: 'Jun 16 – Mar 14', icon: '🐟' },
  { name: 'Trout Season', date: 'Mar 1 – Sep 30', icon: '🐠' },
  { name: 'Salmon Season', date: 'Feb 1 – Oct 31 (varies)', icon: '🐡' },
  { name: 'Pike Season', date: 'Year-round (rivers: Oct–Mar)', icon: '🦷' },
  { name: 'Tench Season', date: 'Jun 16 – Mar 14', icon: '🎣' },
];

const LEAD_TIMES = ['30 min', '1 hour', '2 hours'];

export default function NotificationsScreen() {
  const [tideAlerts, setTideAlerts] = useState(true);
  const [tideLead, setTideLead] = useState(1);
  const [morningBriefing, setMorningBriefing] = useState(true);
  const [seasonOpeners, setSeasonOpeners] = useState<Record<string, boolean>>({ 'Carp Season': true, 'Trout Season': true, 'Salmon Season': true, 'Pike Season': false, 'Tench Season': false });
  const [windThreshold, setWindThreshold] = useState(25);
  const [challengeReminders, setChallengeReminders] = useState(true);
  const [communityActivity, setCommunityActivity] = useState(false);

  const toggleSeason = (name: string) => setSeasonOpeners(s => ({ ...s, [name]: !s[name] }));

  const testNotification = () => {
    Alert.alert('🎣 CAST', 'This is a test notification!\n\nPrime fishing window starting in 30 minutes. Conditions: Wind 8mph SW, Tide: Rising, Temp: 17°C', [{ text: 'Got it!' }]);
  };

  const WindSlider = () => (
    <View style={styles.sliderRow}>
      {[10, 15, 20, 25, 30, 35, 40].map(v => (
        <TouchableOpacity key={v} style={[styles.sliderTick, windThreshold === v && styles.sliderTickActive]} onPress={() => setWindThreshold(v)}>
          <Text style={[styles.sliderTickText, windThreshold === v && styles.sliderTickTextActive]}>{v}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tide Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tide Alerts</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons name="waves" size={18} color="#60A5FA" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Tide Change Alerts</Text>
                <Text style={styles.rowSub}>Notified before each high and low tide</Text>
              </View>
              <Switch value={tideAlerts} onValueChange={setTideAlerts} trackColor={{ true: colors.primary }} thumbColor={colors.textPrimary} />
            </View>
            {tideAlerts && (
              <View style={[styles.subRow, styles.subBorder]}>
                <Text style={styles.subLabel}>Lead time</Text>
                <View style={styles.leadTimePicker}>
                  {LEAD_TIMES.map((t, i) => (
                    <TouchableOpacity key={t} style={[styles.leadOption, tideLead === i && styles.leadOptionActive]} onPress={() => setTideLead(i)}>
                      <Text style={[styles.leadText, tideLead === i && styles.leadTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Fishing Windows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fishing Windows</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                <MaterialCommunityIcons name="weather-sunny" size={18} color={colors.secondary} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Daily Morning Briefing</Text>
                <Text style={styles.rowSub}>Best fishing windows for today, sent at 6am</Text>
              </View>
              <Switch value={morningBriefing} onValueChange={setMorningBriefing} trackColor={{ true: colors.primary }} thumbColor={colors.textPrimary} />
            </View>
          </View>
        </View>

        {/* Season Openers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Season Opener Reminders</Text>
          <View style={styles.card}>
            {SPECIES_SEASONS.map((s, i) => (
              <View key={s.name} style={[styles.row, i < SPECIES_SEASONS.length - 1 && styles.rowBorder]}>
                <Text style={styles.seasonEmoji}>{s.icon}</Text>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>{s.name}</Text>
                  <Text style={styles.rowSub}>{s.date}</Text>
                </View>
                <Switch value={seasonOpeners[s.name] || false} onValueChange={() => toggleSeason(s.name)} trackColor={{ true: colors.primary }} thumbColor={colors.textPrimary} />
              </View>
            ))}
          </View>
        </View>

        {/* Weather */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Alerts</Text>
          <View style={styles.card}>
            <View style={styles.windHeader}>
              <View style={[styles.rowIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <MaterialCommunityIcons name="weather-windy" size={18} color={colors.danger} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Wind Speed Alert</Text>
                <Text style={styles.rowSub}>Alert when wind exceeds <Text style={{ color: colors.danger, fontWeight: '700' }}>{windThreshold} mph</Text></Text>
              </View>
            </View>
            <WindSlider />
            <Text style={styles.windHint}>Fishing is generally difficult above 30 mph</Text>
          </View>
        </View>

        {/* Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenges & Community</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={[styles.rowIcon, { backgroundColor: 'rgba(0,212,170,0.1)' }]}>
                <MaterialCommunityIcons name="trophy" size={18} color={colors.primary} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Weekly Challenge Reminders</Text>
                <Text style={styles.rowSub}>Reminder on Monday and if behind on challenges</Text>
              </View>
              <Switch value={challengeReminders} onValueChange={setChallengeReminders} trackColor={{ true: colors.primary }} thumbColor={colors.textPrimary} />
            </View>
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'rgba(139,92,246,0.1)' }]}>
                <MaterialCommunityIcons name="heart" size={18} color="#8B5CF6" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>Community Activity</Text>
                <Text style={styles.rowSub}>When someone likes or comments on your catch</Text>
              </View>
              <Switch value={communityActivity} onValueChange={setCommunityActivity} trackColor={{ true: colors.primary }} thumbColor={colors.textPrimary} />
            </View>
          </View>
        </View>

        {/* Test */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.testBtn} onPress={testNotification}>
            <MaterialCommunityIcons name="bell-ring" size={18} color={colors.primary} />
            <Text style={styles.testBtnText}>Test Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(96,165,250,0.1)' },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.md },
  subBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  subLabel: { fontSize: 13, color: colors.textSecondary },
  leadTimePicker: { flex: 1, flexDirection: 'row', gap: spacing.sm },
  leadOption: { flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.md },
  leadOptionActive: { backgroundColor: colors.primary },
  leadText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  leadTextActive: { color: '#0A0E1A' },
  seasonEmoji: { fontSize: 20 },
  windHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  sliderRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: 4 },
  sliderTick: { flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.sm },
  sliderTickActive: { backgroundColor: colors.danger },
  sliderTickText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  sliderTickTextActive: { color: colors.textPrimary },
  windHint: { fontSize: 11, color: colors.textSecondary, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)', paddingVertical: spacing.md },
  testBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
});
