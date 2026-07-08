import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { RIGS, Rig } from '../data/rigsData';
import { colors, radius, spacing } from '../constants/theme';

const DIFFICULTY_COLORS = { beginner: colors.success, intermediate: colors.secondary, advanced: colors.danger };

const RIG_ICONS: Record<string, string> = {
  running_lead: 'hook',
  helicopter_rig: 'rotate-3d-variant',
  chod_rig: 'leaf',
  zig_rig: 'arrow-up-bold',
  method_feeder: 'basket',
  waggler: 'flag-variant',
  pole_rig: 'arrow-up-bold-hexagon-outline',
  float_rig: 'waves',
  texas_rig: 'hat-fedora',
  drop_shot: 'arrow-down-bold',
  ledger: 'anchor',
  paternoster: 'waves',
  running_paternoster: 'fish',
  fixed_paternoster: 'target',
  live_bait: 'fish',
};

export default function RigBuilderScreen() {
  const [selected, setSelected] = useState<Rig | null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarked(b => b.includes(id) ? b.filter(x => x !== id) : [...b, id]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Tap any rig to see full assembly instructions, components list, and tips.</Text>
        <View style={styles.grid}>
          {RIGS.map(rig => (
            <TouchableOpacity key={rig.id} style={styles.rigCard} onPress={() => setSelected(rig)}>
              <View style={styles.rigTop}>
                <MaterialCommunityIcons name={(RIG_ICONS[rig.id] || 'hook') as any} size={32} color={colors.primary} />
                <TouchableOpacity style={styles.bookmarkBtn} onPress={() => toggleBookmark(rig.id)}>
                  <MaterialCommunityIcons
                    name={bookmarked.includes(rig.id) ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={bookmarked.includes(rig.id) ? colors.secondary : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.rigName}>{rig.name}</Text>
              <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[rig.difficulty] + '22' }]}>
                <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[rig.difficulty] }]}>{rig.difficulty}</Text>
              </View>
              <Text style={styles.rigSpecies} numberOfLines={1}>{rig.targetSpecies.join(', ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.overlay}>
          {selected && (
            <View style={styles.modal}>
              <ScrollView>
                <View style={styles.modalHeader}>
                  <MaterialCommunityIcons name={(RIG_ICONS[selected.id] || 'hook') as any} size={40} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalName}>{selected.name}</Text>
                    <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[selected.difficulty] + '22', alignSelf: 'flex-start' }]}>
                      <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[selected.difficulty] }]}>{selected.difficulty}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDesc}>{selected.description}</Text>

                <Text style={styles.subTitle}>Use Case</Text>
                <Text style={styles.subText}>{selected.useCase}</Text>

                <Text style={styles.subTitle}>Best For</Text>
                <View style={styles.chipsRow}>
                  {selected.bestFor.map(b => (
                    <View key={b} style={styles.chip}><Text style={styles.chipText}>{b}</Text></View>
                  ))}
                </View>

                <Text style={styles.subTitle}>Target Species</Text>
                <View style={styles.chipsRow}>
                  {selected.targetSpecies.map(s => (
                    <View key={s} style={[styles.chip, styles.speciesChip]}><Text style={[styles.chipText, { color: colors.primary }]}>{s}</Text></View>
                  ))}
                </View>

                <Text style={styles.subTitle}>Components</Text>
                {selected.components.map((c, i) => (
                  <View key={i} style={styles.componentRow}>
                    <View style={styles.componentBullet} />
                    <Text style={styles.componentText}>{c}</Text>
                  </View>
                ))}

                <Text style={styles.subTitle}>Assembly Instructions</Text>
                {selected.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i + 1}</Text></View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}

                <Text style={styles.subTitle}>Related Knots</Text>
                <View style={styles.chipsRow}>
                  {selected.relatedKnots.map(k => (
                    <View key={k} style={[styles.chip, styles.knotChip]}>
                      <MaterialCommunityIcons name="link-variant" size={11} color={colors.secondary} />
                      <Text style={[styles.chipText, { color: colors.secondary }]}>{k}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ height: spacing.xl }} />
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  intro: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rigCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6 },
  rigTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookmarkBtn: {},
  rigName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
  diffText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  rigSpecies: { fontSize: 11, color: colors.textSecondary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  modalName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  modalDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md },
  subTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  subText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: { backgroundColor: colors.surface2, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  speciesChip: { backgroundColor: 'rgba(0,212,170,0.1)', borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)' },
  knotChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  chipText: { fontSize: 12, color: colors.textSecondary },
  componentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 6 },
  componentBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6 },
  componentText: { fontSize: 13, color: colors.textPrimary, flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumberText: { fontSize: 12, fontWeight: '700', color: '#0A0E1A' },
  stepText: { fontSize: 13, color: colors.textPrimary, lineHeight: 20, flex: 1 },
});
