import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../constants/theme';

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'story';
  chapter?: number;
}

const DAILY_QUESTS: Quest[] = [
  { id: 'd1', title: 'Early Bird', description: 'Log a catch before 8am', xp: 25, completed: false, type: 'daily' },
  { id: 'd2', title: 'Specimen Hunter', description: 'Log a catch over 2kg', xp: 50, completed: false, type: 'daily' },
  { id: 'd3', title: 'Explorer', description: 'Fish at a new location', xp: 30, completed: false, type: 'daily' },
];

const WEEKLY_QUESTS: Quest[] = [
  { id: 'w1', title: 'Diversity', description: 'Catch 3 different species this week', xp: 150, completed: false, type: 'weekly' },
  { id: 'w2', title: 'Rare Achievement', description: 'Land a Rare or better fish', xp: 200, completed: false, type: 'weekly' },
  { id: 'w3', title: 'Dedication', description: 'Fish 4 days this week', xp: 100, completed: false, type: 'weekly' },
];

const STORY_QUESTS: Quest[] = [
  { id: 's1', title: 'The Beginning', description: 'Log your first catch', xp: 100, completed: true, type: 'story', chapter: 1 },
  { id: 's2', title: 'The Apprentice', description: 'Catch 5 different species', xp: 250, completed: false, type: 'story', chapter: 2 },
  { id: 's3', title: 'The Hunter', description: 'Catch an Epic fish', xp: 500, completed: false, type: 'story', chapter: 3 },
  { id: 's4', title: 'The Legend', description: 'Catch a Legendary fish', xp: 1000, completed: false, type: 'story', chapter: 4 },
  { id: 's5', title: 'The Mythic', description: 'Catch a Mythic fish', xp: 2500, completed: false, type: 'story', chapter: 5 },
];

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

function getTimeUntilMonday(): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() + ((7 - now.getDay() + 1) % 7 || 7));
  monday.setHours(0, 0, 0, 0);
  const diff = monday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
}

export default function QuestsScreen() {
  const [timeToMidnight, setTimeToMidnight] = useState(getTimeUntilMidnight());
  const [timeToMonday, setTimeToMonday] = useState(getTimeUntilMonday());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeToMidnight(getTimeUntilMidnight());
      setTimeToMonday(getTimeUntilMonday());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const completedStory = STORY_QUESTS.filter(q => q.completed).length;
  const storyProgress = completedStory / STORY_QUESTS.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Quest Log</Text>
          <Text style={styles.subtitle}>RPG-style fishing progression</Text>
        </View>

        {/* Story Progress */}
        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>Story Progression</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${storyProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Chapter {completedStory + 1} of {STORY_QUESTS.length}</Text>
          <View style={styles.chapterMap}>
            {STORY_QUESTS.map((q, i) => (
              <View key={q.id} style={styles.chapterItem}>
                <View style={[
                  styles.chapterDot,
                  q.completed && styles.chapterDotCompleted,
                  i === completedStory && styles.chapterDotActive,
                ]}>
                  {q.completed ? (
                    <MaterialCommunityIcons name="check" size={12} color="#fff" />
                  ) : (
                    <Text style={styles.chapterNum}>{q.chapter}</Text>
                  )}
                </View>
                {i < STORY_QUESTS.length - 1 && (
                  <View style={[styles.chapterLine, q.completed && styles.chapterLineCompleted]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Daily Quests */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Daily Quests</Text>
          <Text style={styles.timer}>Resets in {timeToMidnight}</Text>
        </View>
        {DAILY_QUESTS.map(q => <QuestCard key={q.id} quest={q} />)}

        {/* Weekly Quests */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Weekly Quests</Text>
          <Text style={styles.timer}>Resets in {timeToMonday}</Text>
        </View>
        {WEEKLY_QUESTS.map(q => <QuestCard key={q.id} quest={q} />)}

        {/* Story Quests */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>Story Quests</Text>
        {STORY_QUESTS.map(q => (
          <View key={q.id} style={styles.storyQuest}>
            <View style={[
              styles.storyQuestChapter,
              q.completed && { backgroundColor: colors.primary },
            ]}>
              <Text style={styles.storyQuestChapterText}>{q.chapter}</Text>
            </View>
            <View style={styles.questInfo}>
              <Text style={styles.questTitle}>{q.title}</Text>
              <Text style={styles.questDesc}>{q.description}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{q.xp}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
            {q.completed && (
              <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
            )}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  return (
    <View style={[styles.questCard, quest.completed && styles.questCardCompleted]}>
      <View style={styles.questIcon}>
        <MaterialCommunityIcons
          name={quest.completed ? 'check-circle' : 'circle-outline'}
          size={24}
          color={quest.completed ? colors.primary : colors.textSecondary}
        />
      </View>
      <View style={styles.questInfo}>
        <Text style={[styles.questTitle, quest.completed && { opacity: 0.5 }]}>{quest.title}</Text>
        <Text style={styles.questDesc}>{quest.description}</Text>
      </View>
      <View style={styles.xpBadge}>
        <Text style={styles.xpText}>+{quest.xp}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  storyCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: 'rgba(0,212,170,0.06)', borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  storyTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },
  progressBar: { height: 8, backgroundColor: colors.surface2, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.xs },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressText: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md },
  chapterMap: { flexDirection: 'row', alignItems: 'center' },
  chapterItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  chapterDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  chapterDotCompleted: { backgroundColor: colors.primary, borderColor: colors.primary },
  chapterDotActive: { borderColor: colors.primary },
  chapterNum: { fontSize: 11, fontWeight: '800', color: colors.textSecondary },
  chapterLine: { flex: 1, height: 2, backgroundColor: colors.border },
  chapterLineCompleted: { backgroundColor: colors.primary },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  timer: { fontSize: 12, color: colors.textSecondary },
  questCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  questCardCompleted: { opacity: 0.6 },
  questIcon: { width: 32, alignItems: 'center' },
  questInfo: { flex: 1 },
  questTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  questDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  xpBadge: {
    alignItems: 'center', backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
  },
  xpText: { fontSize: 14, fontWeight: '900', color: colors.primary },
  xpLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: '700' },
  storyQuest: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  storyQuestChapter: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  storyQuestChapterText: { fontSize: 13, fontWeight: '800', color: colors.textSecondary },
});
