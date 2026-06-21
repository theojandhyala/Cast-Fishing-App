import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, SafeAreaView, ScrollView, Dimensions
} from 'react-native';
import { Icon as MaterialCommunityIcons } from '../components/ui/Icon';
import { species as allSpecies } from '../data/species';
import { RarityBadge } from '../components/catches/RarityBadge';
import { colors, radius, spacing } from '../constants/theme';

const { width } = Dimensions.get('window');
const RADAR_SIZE = Math.min(width - spacing.lg * 2, 320);
const RADAR_CENTER = RADAR_SIZE / 2;

interface BlipData {
  id: string;
  name: string;
  rarity: string;
  rarityColor: string;
  x: number;
  y: number;
  activity: number;
}

function getBlipPosition(rarity: string, index: number, total: number): { x: number; y: number } {
  const rarityDistances: Record<string, number> = {
    common: 0.2,
    uncommon: 0.4,
    rare: 0.6,
    epic: 0.75,
    legendary: 0.85,
    mythic: 0.92,
  };
  const distance = (rarityDistances[rarity] || 0.5) * RADAR_CENTER * 0.8;
  const angle = (index / total) * 2 * Math.PI + Math.random() * 0.5;
  return {
    x: RADAR_CENTER + distance * Math.cos(angle) - 6,
    y: RADAR_CENTER + distance * Math.sin(angle) - 6,
  };
}

export default function FishRadarScreen() {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const [blips, setBlips] = useState<BlipData[]>([]);
  const [mythicAlert, setMythicAlert] = useState(false);

  useEffect(() => {
    // Create blips from species
    const activeSpecies = allSpecies.filter((_, i) => i < 15);
    const newBlips: BlipData[] = activeSpecies.map((s: any, i) => {
      const pos = getBlipPosition(s.rarity || 'common', i, activeSpecies.length);
      return {
        id: s.id,
        name: s.commonName,
        rarity: s.rarity || 'common',
        rarityColor: s.rarityColor || '#9CA3AF',
        x: pos.x,
        y: pos.y,
        activity: Math.round(Math.random() * 60 + 20),
      };
    });
    setBlips(newBlips);

    // Random mythic alert
    const alertTimer = setTimeout(() => {
      if (Math.random() > 0.6) setMythicAlert(true);
    }, 5000);

    return () => clearTimeout(alertTimer);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const currentHour = new Date().getHours();
  const isPeakHours = (currentHour >= 5 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 21);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Fish Radar</Text>
          <Text style={styles.subtitle}>Scanning 10km radius · London</Text>
        </View>

        {mythicAlert && (
          <View style={styles.mythicAlert}>
            <MaterialCommunityIcons name="alert" size={16} color="#EC4899" />
            <Text style={styles.mythicAlertText}> MYTHIC ALERT — Rare signal detected!</Text>
          </View>
        )}

        {/* Radar */}
        <View style={styles.radarContainer}>
          <View style={styles.radar}>
            {/* Rings */}
            {[0.25, 0.5, 0.75, 1].map(r => (
              <View
                key={r}
                style={[styles.ring, {
                  width: RADAR_SIZE * r,
                  height: RADAR_SIZE * r,
                  borderRadius: (RADAR_SIZE * r) / 2,
                  top: RADAR_CENTER - (RADAR_SIZE * r) / 2,
                  left: RADAR_CENTER - (RADAR_SIZE * r) / 2,
                }]}
              />
            ))}
            {/* Cross hairs */}
            <View style={[styles.crossH, { top: RADAR_CENTER - 0.5, left: 0, width: RADAR_SIZE }]} />
            <View style={[styles.crossV, { left: RADAR_CENTER - 0.5, top: 0, height: RADAR_SIZE }]} />

            {/* Scan line */}
            <Animated.View
              style={[styles.scanLine, {
                transform: [
                  { translateX: RADAR_CENTER },
                  { translateY: RADAR_CENTER },
                  { rotate },
                  { translateX: -RADAR_CENTER },
                  { translateY: -RADAR_CENTER },
                ],
              }]}
            >
              <View style={[styles.scanLineInner, { width: RADAR_CENTER, height: RADAR_CENTER }]} />
            </Animated.View>

            {/* Blips */}
            {blips.map((b) => (
              <View
                key={b.id}
                style={[styles.blip, {
                  left: b.x,
                  top: b.y,
                  backgroundColor: b.rarityColor,
                  shadowColor: b.rarityColor,
                }]}
              />
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {[
            { label: 'Common', color: '#9CA3AF' },
            { label: 'Rare', color: '#3B82F6' },
            { label: 'Epic', color: '#8B5CF6' },
            { label: 'Mythic', color: '#EC4899' },
          ].map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Detected Species List */}
        <View style={styles.detectedHeader}>
          <Text style={styles.detectedTitle}>Detected Species</Text>
          <Text style={styles.detectedSub}>Sorted by activity</Text>
        </View>

        {blips
          .sort((a, b) => b.activity - a.activity)
          .map((b) => (
            <View key={b.id} style={styles.detectedRow}>
              <View style={[styles.detectedDot, { backgroundColor: b.rarityColor }]} />
              <MaterialCommunityIcons name="fish" size={22} color={colors.textPrimary} style={styles.detectedEmoji} />
              <View style={styles.detectedInfo}>
                <View style={styles.detectedNameRow}>
                  <Text style={styles.detectedName}>{b.name}</Text>
                  {isPeakHours && b.activity > 70 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <MaterialCommunityIcons name="fire" size={12} color={colors.secondary} />
                      <Text style={styles.hotBadge}>Hot</Text>
                    </View>
                  )}
                </View>
                <View style={styles.activityBarBg}>
                  <View style={[styles.activityBarFill, {
                    width: `${b.activity}%`,
                    backgroundColor: b.rarityColor,
                  }]} />
                </View>
              </View>
              <RarityBadge rarity={b.rarity as any} rarityColor={b.rarityColor} size="sm" />
            </View>
          ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  mythicAlert: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: 'rgba(236,72,153,0.15)',
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: '#EC4899',
  },
  mythicAlertText: { fontSize: 14, fontWeight: '700', color: '#EC4899', textAlign: 'center' },
  radarContainer: { alignItems: 'center', paddingVertical: spacing.lg },
  radar: {
    width: RADAR_SIZE, height: RADAR_SIZE,
    backgroundColor: '#050E1A',
    borderRadius: RADAR_SIZE / 2,
    position: 'relative',
    borderWidth: 2, borderColor: 'rgba(0,212,170,0.4)',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute', borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
  },
  crossH: { position: 'absolute', height: 1, backgroundColor: 'rgba(0,212,170,0.2)' },
  crossV: { position: 'absolute', width: 1, backgroundColor: 'rgba(0,212,170,0.2)' },
  scanLine: {
    position: 'absolute', top: 0, left: 0,
    width: RADAR_SIZE, height: RADAR_SIZE,
  },
  scanLineInner: {
    position: 'absolute',
    top: RADAR_CENTER,
    left: RADAR_CENTER,
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderTopRightRadius: RADAR_CENTER,
    transform: [{ rotate: '-90deg' }],
  },
  blip: {
    position: 'absolute', width: 10, height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
  legendRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: spacing.lg, paddingVertical: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.textSecondary },
  detectedHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  detectedTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  detectedSub: { fontSize: 12, color: colors.textSecondary },
  detectedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  detectedDot: { width: 10, height: 10, borderRadius: 5 },
  detectedEmoji: { marginRight: 0 },
  detectedInfo: { flex: 1 },
  detectedNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  detectedName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  hotBadge: { fontSize: 11, color: colors.secondary, fontWeight: '700' },
  activityBarBg: {
    height: 4, backgroundColor: colors.surface2,
    borderRadius: 2, overflow: 'hidden',
  },
  activityBarFill: { height: '100%', borderRadius: 2 },
});
