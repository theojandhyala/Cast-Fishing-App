import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

const EMERGENCY_CONTACTS = [
  { name: 'Emergency Services', number: '999', icon: 'phone-alert', color: '#EF4444', desc: 'Police, Fire, Ambulance, Coastguard' },
  { name: 'RNLI Coastguard', number: '999', icon: 'lifebuoy', color: '#0EA5E9', desc: 'Request Coastguard when in sea distress' },
  { name: 'Non-Emergency Police', number: '101', icon: 'police-badge', color: '#6366F1', desc: 'Non-urgent police matters' },
  { name: 'Environment Agency', number: '0800 807 060', icon: 'leaf', color: '#10B981', desc: 'Report pollution, illegal fishing' },
  { name: 'RNLI Donation / Info', number: '0300 300 9990', icon: 'information', color: '#60A5FA', desc: 'RNLI information line' },
];

const WATER_RULES = [
  { icon: 'life-ring', rule: 'Always wear a buoyancy aid or life jacket when on or near open water in wind/rain.' },
  { icon: 'account-multiple', rule: 'Never fish alone in remote or dangerous locations — always tell someone your plans.' },
  { icon: 'cellphone', rule: 'Keep your phone charged and in a waterproof case. Know your grid reference.' },
  { icon: 'weather-lightning', rule: 'Stop fishing immediately in a thunderstorm — rod carbon fibre conducts electricity.' },
  { icon: 'swim', rule: 'Never wade beyond knee depth in rivers — currents are much stronger than they appear.' },
  { icon: 'eye', rule: 'Stay alert to rising water levels — rivers can rise rapidly after rain upstream.' },
];

const FIRST_AID = [
  {
    title: 'Hook Removal',
    icon: 'hook',
    color: '#EF4444',
    steps: [
      'Do NOT pull hook straight out — this causes more damage.',
      'For shallow hooks: push the hook forward through the skin, snip off the barb with pliers, back out.',
      'For deep or barbed hooks in eyes, face or joints: leave in place and go to A&E immediately.',
      'Clean the wound thoroughly with antiseptic wipes. Apply sterile dressing.',
      'Check tetanus immunisation is up to date.',
    ],
  },
  {
    title: 'Line Cuts & Lacerations',
    icon: 'content-cut',
    color: '#F97316',
    steps: [
      'Apply direct pressure with a clean cloth for at least 10 minutes.',
      'Elevate the injured limb above heart level if possible.',
      'If bleeding does not slow or the cut is deep, go to A&E.',
      'Clean smaller wounds with running water and apply sterile dressing.',
    ],
  },
  {
    title: 'Heat / Sun Exhaustion',
    icon: 'weather-sunny-alert',
    color: '#F59E0B',
    steps: [
      'Move to shade immediately. Remove excess clothing.',
      'Cool the person with water — spray or damp cloth on skin.',
      'Give water to sip if conscious and able to swallow.',
      'If they become confused, stop sweating or lose consciousness: call 999.',
    ],
  },
  {
    title: 'Hypothermia Warning Signs',
    icon: 'snowflake-alert',
    color: '#60A5FA',
    steps: [
      'Warning signs: uncontrollable shivering, confusion, slurred speech, blue lips.',
      'Move the person out of cold and wet conditions immediately.',
      'Replace wet clothing with dry. Wrap in blankets. Do not rub limbs.',
      'Give warm (not hot) drinks if conscious. Call 999 for severe cases.',
      'Do not put in a hot bath — rapid rewarming can be fatal.',
    ],
  },
];

const WEATHER_THRESHOLDS = [
  { condition: 'Wind > 40mph', action: 'Stop fishing. Seek shelter. Risk of casting accidents.', icon: 'weather-windy', color: '#EF4444' },
  { condition: 'Lightning within 5 miles', action: 'Stop immediately. Move away from water and rods.', icon: 'weather-lightning', color: '#F59E0B' },
  { condition: 'River level FLOOD', action: 'Leave the bankside. Do not return until level drops.', icon: 'waves', color: '#EF4444' },
  { condition: 'Fog & poor visibility', action: 'Avoid sea/boat fishing. Stay close to shore or bank.', icon: 'weather-fog', color: '#9CA3AF' },
  { condition: 'Ice / frozen surfaces', action: 'Never walk on frozen lakes or rivers. Ice is unpredictable.', icon: 'snowflake', color: '#60A5FA' },
];

export default function SafetyScreen() {
  const [expandedFirst, setExpandedFirst] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const shareLocation = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Share Location', 'Use your phone\'s native app for this feature. Open maps.google.com to find your coordinates.');
      return;
    }
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to share your position.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      Alert.alert(
        'Your Location',
        `Latitude: ${loc.coords.latitude.toFixed(5)}\nLongitude: ${loc.coords.longitude.toFixed(5)}\n\nShare this with your emergency contact.`,
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Error', 'Could not get location. Please check your device settings.');
    }
  };

  const checkIn = () => {
    setCheckedIn(true);
    Alert.alert(
      'Check-in Recorded',
      "You've checked in as safe. Your emergency contact has been notified (mock).",
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['rgba(239,68,68,0.15)', 'transparent']} style={styles.hero}>
          <MaterialCommunityIcons name="shield-check" size={44} color={colors.danger} />
          <Text style={styles.heroTitle}>Safety & Emergency</Text>
          <Text style={styles.heroSub}>Stay safe on the water</Text>
        </LinearGradient>

        {/* Quick actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={shareLocation}>
            <MaterialCommunityIcons name="map-marker-account" size={22} color={colors.primary} />
            <Text style={styles.actionBtnText}>Share{'\n'}Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, checkedIn && styles.actionBtnChecked]}
            onPress={checkIn}
          >
            <MaterialCommunityIcons name="check-circle" size={22} color={checkedIn ? colors.success : colors.secondary} />
            <Text style={[styles.actionBtnText, checkedIn && { color: colors.success }]}>I'm OK{'\n'}Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: 'rgba(239,68,68,0.4)' }]}
            onPress={() => Linking.openURL('https://www.gov.uk/check-flood-risk')}
          >
            <MaterialCommunityIcons name="waves" size={22} color={colors.danger} />
            <Text style={[styles.actionBtnText, { color: colors.danger }]}>Flood{'\n'}Warnings</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
          <View style={styles.card}>
            {EMERGENCY_CONTACTS.map((c, i) => (
              <TouchableOpacity
                key={c.name}
                style={[styles.contactRow, i < EMERGENCY_CONTACTS.length - 1 && styles.rowBorder]}
                onPress={() => Alert.alert(c.name, `Call ${c.number}\n\n${c.desc}`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: `Call ${c.number}`, onPress: () => Linking.openURL(`tel:${c.number.replace(/\s/g, '')}`) },
                ])}
              >
                <View style={[styles.contactIcon, { backgroundColor: c.color + '22' }]}>
                  <MaterialCommunityIcons name={c.icon as any} size={20} color={c.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactDesc}>{c.desc}</Text>
                </View>
                <Text style={[styles.contactNum, { color: c.color }]}>{c.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Water safety rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WATER SAFETY RULES</Text>
          {WATER_RULES.map((r, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={styles.ruleIcon}>
                <MaterialCommunityIcons name={r.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={styles.ruleText}>{r.rule}</Text>
            </View>
          ))}
        </View>

        {/* First aid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FIRST AID GUIDANCE</Text>
          {FIRST_AID.map(item => (
            <View key={item.title} style={styles.firstAidCard}>
              <TouchableOpacity
                style={styles.firstAidHeader}
                onPress={() => setExpandedFirst(expandedFirst === item.title ? null : item.title)}
              >
                <View style={[styles.firstAidIcon, { backgroundColor: item.color + '22' }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.firstAidTitle}>{item.title}</Text>
                <MaterialCommunityIcons
                  name={expandedFirst === item.title ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {expandedFirst === item.title && (
                <View style={styles.firstAidSteps}>
                  {item.steps.map((step, si) => (
                    <View key={si} style={styles.stepRow}>
                      <View style={[styles.stepNum, { backgroundColor: item.color + '22' }]}>
                        <Text style={[styles.stepNumText, { color: item.color }]}>{si + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Weather thresholds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WEATHER STOP THRESHOLDS</Text>
          {WEATHER_THRESHOLDS.map((t, i) => (
            <View key={i} style={[styles.thresholdRow, { borderLeftColor: t.color }]}>
              <MaterialCommunityIcons name={t.icon as any} size={18} color={t.color} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.thresholdCondition, { color: t.color }]}>{t.condition}</Text>
                <Text style={styles.thresholdAction}>{t.action}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.sm },
  heroSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  actionRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  actionBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  actionBtnChecked: { borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.06)' },
  actionBtnText: { fontSize: 12, color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  contactIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  contactName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  contactDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  contactNum: { fontSize: 15, fontWeight: '800' },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  ruleIcon: { width: 36, height: 36, backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ruleText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, paddingTop: spacing.xs },
  firstAidCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  firstAidHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  firstAidIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  firstAidTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  firstAidSteps: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { fontSize: 11, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  thresholdRow: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, borderLeftWidth: 3 },
  thresholdCondition: { fontSize: 14, fontWeight: '800', marginBottom: 3 },
  thresholdAction: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
