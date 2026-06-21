import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useCatchStore } from '../store/catchStore';
import { useLocationStore } from '../store/locationStore';
import { CONFIG } from '../constants/config';
import { colors, spacing, radius } from '../constants/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const QUICK_QUESTIONS = [
  "What's biting near me?",
  "Best rig for Carp?",
  "Is today good for fishing?",
  "Best bait for Barbel?",
  "How do I tie a hair rig?",
  "When does the closed season end?",
];

const CANNED_RESPONSES: Record<string, { content: string; suggestions: string[] }> = {
  'biting': {
    content: "Based on the current conditions and time of year, **Carp and Tench** are your best bet right now. They're most active during warm, overcast days with light south-westerly winds — perfect for the current pressure system.\n\n**Top picks for today:**\n• 🐟 Carp — active at dawn and dusk, try boilies near margins\n• 🌿 Tench — feeding hard before summer spawning, worm & corn combo\n• 💪 Barbel — if you're on a river, pellets on a feeder in the current\n\nAvoid open water — fish will be tucked tight to features today.",
    suggestions: ["Best bait for Carp?", "Where should I fish?", "What rig for Tench?"],
  },
  'carp': {
    content: "**Hair Rig** is the go-to for Carp — here's why it works so well:\n\nCarp are incredibly cautious and will often eject a bait if they feel resistance. The hair rig presents the bait separate from the hook, so the fish sucks in the boilie naturally and hooks itself.\n\n**My recommended setup for today:**\n• Hook: Size 6-8 Wide Gape\n• Line: 15lb fluorocarbon hooklink, 8-10cm\n• Lead: 2-3oz inline lead (self-hooking)\n• Bait: 18mm shelf-life boilie, fruit or fishmeal\n\n**Pro tip:** Pop the bait up 1cm off the bottom using a piece of foam — this avoids silty areas where the fish can't find it.",
    suggestions: ["Best boilies for Carp?", "How long should my hooklink be?", "Chod rig vs hair rig?"],
  },
  'today': {
    content: "**Today's Fishing Score: 72/100 — Good conditions! ✅**\n\n**What's working in your favour:**\n✅ Pressure stable at 1016mb (rising slightly)\n✅ Overcast cloud cover — fish feel confident\n✅ SW wind bringing warm surface water\n✅ Temperature 14°C — good activity level\n\n**Challenges:**\n⚠️ Wind increasing to 15mph by afternoon\n⚠️ Rain possible after 3pm\n\n**Best windows today:**\n• 🌅 6:30-9:00am — Major feed (dawn feeding)\n• ☀️ 12:00-1:30pm — Minor feed\n• 🌆 7:00-9:00pm — Evening feeding window\n\n**Verdict:** Get out early — conditions are best before noon.",
    suggestions: ["What species should I target?", "Best spots for today?", "What about tomorrow?"],
  },
  'barbel': {
    content: "**Barbel are fantastic fighters — here's exactly how to target them:**\n\n**Best baits (ranked):**\n1. 🏆 Halibut pellets (8-15mm) — almost irresistible\n2. 🥈 Luncheon meat (1.5cm cubes) — deadly in summer\n3. 🥉 Hemp + sweetcorn — great for building a swim\n4. Paste wrapped around the hook — superb in warm water\n\n**Rig:** Method feeder or straight lead with short 3-4\" hooklink. Use a size 8-10 hook.\n\n**Where to fish:** Fast water, gravelly runs, just below weirs — barbel love oxygenated water. Cast upstream and let the rig settle in the current.\n\n**When:** Peak feeding is at dusk and into darkness. Summer evenings are magical for barbel fishing.",
    suggestions: ["What size hook for Barbel?", "River or canal?", "Night fishing tips?"],
  },
  'hair': {
    content: "**Hair Rig — Step by Step:**\n\n1. Cut 25cm of hooklink material (fluorocarbon works great)\n2. Thread the line through the hook eye and tie an overhand loop at the end — this is the hair\n3. The loop should extend ~1.5cm below the hook bend\n4. Tie the line to the hook using a knotless knot — 8 turns down the shank, then back through the eye\n5. Thread your bait onto a baiting needle, then hook it onto the hair loop\n6. Secure with a bait stop\n\n**Key measurements:**\n• Hair length: 1-1.5cm below hook bend\n• Hooklink: 6-12cm for wary fish, longer in snaggy swims\n\nWant me to explain any step in more detail?",
    suggestions: ["What hooklink material to use?", "Knotless knot vs palomar?", "How to use a bait stop?"],
  },
  'season': {
    content: "**UK Fishing Closed Seasons 2024:**\n\n**Coarse fish on rivers:**\n🚫 15th March to 15th June (inclusive)\nThis protects fish during spawning season.\n\n**Still waters (lakes, reservoirs, canals):**\n✅ No closed season for most coarse species\nHowever, individual fisheries may impose their own rules.\n\n**Salmon & Sea Trout:**\n🚫 Varies by river — check EA for your specific river\nTypically autumn through winter.\n\n**Trout:**\n🚫 October to March on most rivers\n✅ Stillwater trout fisheries often open year-round\n\n**Always:**\n• Check your specific water's rules\n• Ensure your EA rod licence is valid\n• Respect any local bylaws\n\nDo you need help checking if a specific species is in season?",
    suggestions: ["Do I need a rod licence?", "What can I catch right now?", "Where to buy a rod licence?"],
  },
  'default': {
    content: "That's a great fishing question! While I'm working with limited data right now, here's my best advice:\n\nAs a UK angler, the most important factors for success are:\n\n1. **Timing** — Dawn and dusk are peak feeding times for most species\n2. **Weather** — A rising barometer after rain often triggers feeding\n3. **Bait choice** — Match your bait to the season; naturals in spring/autumn, boilies and pellets in summer\n4. **Location** — Fish near features: lily pads, overhanging trees, weed edges, channels\n\nIs there anything more specific I can help you with? Try asking about a specific species, rig, or today's conditions!",
    suggestions: ["What's biting near me?", "Best rig for Carp?", "Today's conditions?"],
  },
};

function getCannedResponse(input: string): typeof CANNED_RESPONSES['default'] {
  const lower = input.toLowerCase();
  if (lower.includes('bit') || lower.includes('catch') || lower.includes('near me')) return CANNED_RESPONSES['biting'];
  if (lower.includes('carp') && (lower.includes('rig') || lower.includes('how'))) return CANNED_RESPONSES['carp'];
  if (lower.includes('today') || lower.includes('good') || lower.includes('condition')) return CANNED_RESPONSES['today'];
  if (lower.includes('barbel')) return CANNED_RESPONSES['barbel'];
  if (lower.includes('hair') || lower.includes('knot') || lower.includes('rig') && lower.includes('tie')) return CANNED_RESPONSES['hair'];
  if (lower.includes('season') || lower.includes('close') || lower.includes('licence') || lower.includes('legal')) return CANNED_RESPONSES['season'];
  return CANNED_RESPONSES['default'];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function AIAdvisorScreen() {
  const router = useRouter();
  const { catches } = useCatchStore();
  const { location } = useLocationStore();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm CAST AI, your personal fishing advisor. I can help with species tips, rig advice, bait selection, conditions analysis and much more.\n\nWhat would you like to know today?",
      timestamp: new Date(),
      suggestions: QUICK_QUESTIONS.slice(0, 3),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: generateId(), role: 'user', content: text, timestamp: new Date() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    // Try the real AI via the secure Worker proxy; fall back to canned advice.
    let content: string | null = null;
    if (CONFIG.AI_WORKER_URL) {
      try {
        const res = await fetch(`${CONFIG.AI_WORKER_URL}/advisor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: `You are CAST's expert fishing advisor. ${location ? `The angler is currently fishing at: ${location.name}.` : ''} Give concise, practical advice. Use markdown bold (**text**) for emphasis. Keep responses focused and actionable.`,
            messages: history
              .filter(m => m.id !== 'welcome')
              .map(m => ({ role: m.role, content: m.content })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.reply) content = data.reply;
        }
      } catch {
        // network error — fall through to canned response
      }
    }

    if (!content) {
      await new Promise(r => setTimeout(r, 600));
      content = getCannedResponse(text).content;
    }

    const aiMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      suggestions: getCannedResponse(text).suggestions,
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const formatContent = (content: string) => {
    // Simple bold formatting
    return content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(0,212,170,0.08)', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Advisor</Text>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View key={msg.id}>
              <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.role === 'assistant' && (
                  <View style={styles.aiAvatar}>
                    <Text style={styles.aiAvatarText}>🤖</Text>
                  </View>
                )}
                <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
                  <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>
                    {formatContent(msg.content)}
                  </Text>
                  <Text style={styles.bubbleTime}>
                    {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              {msg.suggestions && msg.suggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {msg.suggestions.map(s => (
                    <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
          {loading && (
            <View style={styles.bubble}>
              <View style={styles.aiAvatar}><Text style={styles.aiAvatarText}>🤖</Text></View>
              <View style={[styles.bubbleContent, styles.aiBubbleContent]}>
                <View style={styles.typingDots}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, { opacity: 0.6 }]} />
                  <View style={[styles.typingDot, { opacity: 0.3 }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick questions */}
        {messages.length === 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            {QUICK_QUESTIONS.map(q => (
              <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => sendMessage(q)}>
                <Text style={styles.quickBtnText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about fishing..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0A0E1A" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#0A0E1A" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  onlineText: { fontSize: 12, color: colors.success },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  userBubble: { flexDirection: 'row-reverse' },
  aiBubble: {},
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,212,170,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  aiAvatarText: { fontSize: 16 },
  bubbleContent: { maxWidth: '78%', borderRadius: radius.lg, padding: spacing.md },
  aiBubbleContent: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  userBubbleContent: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  userText: { color: '#0A0E1A' },
  bold: { fontWeight: '700' },
  bubbleTime: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginLeft: 40, marginTop: spacing.xs },
  suggestionChip: { backgroundColor: 'rgba(0,212,170,0.1)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)' },
  suggestionText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  typingDots: { flexDirection: 'row', gap: 4, padding: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  quickScroll: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  quickBtn: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, marginRight: spacing.xs, borderWidth: 1, borderColor: colors.border },
  quickBtnText: { fontSize: 13, color: colors.textPrimary },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  input: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, color: colors.textPrimary, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
