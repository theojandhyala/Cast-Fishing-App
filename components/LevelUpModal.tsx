import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from './ui/Icon';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { titleForLevel } from '../data/progression';
import { useProfileStore } from '../store/profileStore';

interface LevelUpModalProps {
  level?: number | null;
  onClose?: () => void;
}

export function LevelUpModal({ level: controlledLevel, onClose }: LevelUpModalProps) {
  const storeLevel = useProfileStore((state) => state.pendingLevelUp);
  const dismiss = useProfileStore((state) => state.dismissLevelUp);
  const level = controlledLevel === undefined ? storeLevel : controlledLevel;
  const scale = useRef(new Animated.Value(0.72)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!level) return;
    scale.setValue(0.72);
    glow.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 11, stiffness: 150, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 1, duration: 650, useNativeDriver: true }),
    ]).start();
  }, [glow, level, scale]);

  const close = () => {
    if (controlledLevel === undefined) dismiss();
    onClose?.();
  };

  return (
    <Modal visible={Boolean(level)} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <LinearGradient colors={['#123D43', colors.surface, '#111827']} style={styles.gradient}>
            <Animated.View style={[styles.glow, { opacity: glow }]} />
            <View style={styles.iconRing}>
              <Icon name="trophy-award" size={44} color={colors.primary} />
            </View>
            <Text style={styles.eyebrow}>LEVEL UP</Text>
            <Text style={styles.level}>{level}</Text>
            <Text style={styles.title}>{level ? titleForLevel(level) : ''}</Text>
            <Text style={styles.message}>New waters. Bigger stories. Keep casting.</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Continue after levelling up" activeOpacity={0.85} onPress={close} style={styles.button}>
              <Text style={styles.buttonText}>Keep fishing</Text>
              <Icon name="arrow-right" size={18} color={colors.background} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,6,15,0.84)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 380, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,212,170,0.35)', shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  gradient: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: 38, overflow: 'hidden' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, top: -110, backgroundColor: 'rgba(0,212,170,0.18)' },
  iconRing: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,212,170,0.12)', borderWidth: 1, borderColor: 'rgba(0,212,170,0.45)', marginBottom: spacing.lg },
  eyebrow: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3 },
  level: { color: colors.textPrimary, fontFamily: fonts.display, fontSize: 72, lineHeight: 82, marginTop: 2 },
  title: { color: colors.textPrimary, fontFamily: fonts.displaySemi, fontSize: 21, textAlign: 'center' },
  message: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  button: { minHeight: 50, width: '100%', borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  buttonText: { color: colors.background, fontFamily: fonts.bodyBold, fontSize: 15 },
});
