import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { ReactionCounts, ReactionType } from '../../data/socialData';

const REACTIONS: { type: ReactionType; symbol: string; label: string }[] = [
  { type: 'like', symbol: '♥', label: 'Like' },
  { type: 'wow', symbol: '◎', label: 'Wow' },
  { type: 'fire', symbol: '🔥', label: 'Fire' },
  { type: 'congrats', symbol: '✦', label: 'Congrats' },
];

interface ReactionBarProps {
  counts: ReactionCounts;
  selected?: ReactionType;
  onSelect: (type: ReactionType) => void;
}

export const ReactionBar = memo(function ReactionBar({ counts, selected, onSelect }: ReactionBarProps) {
  return (
    <View style={styles.row} accessibilityRole="toolbar" accessibilityLabel="Catch reactions">
      {REACTIONS.map(({ type, symbol, label }) => {
        const active = selected === type;
        const count = counts[type] + (active ? 1 : 0);
        return (
          <Pressable
            key={type}
            accessibilityRole="button"
            accessibilityLabel={`${label}, ${count} reactions`}
            accessibilityState={{ selected: active }}
            hitSlop={6}
            onPress={() => onSelect(type)}
            style={({ pressed }) => [styles.button, active && styles.buttonActive, pressed && styles.pressed]}
          >
            <Text style={[styles.symbol, active && styles.activeText]}>{symbol}</Text>
            <Text style={[styles.count, active && styles.activeText]}>{count}</Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  button: {
    minHeight: 40,
    minWidth: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonActive: { backgroundColor: 'rgba(0,212,170,0.14)', borderColor: colors.primary },
  pressed: { opacity: 0.7 },
  symbol: { color: colors.textSecondary, fontSize: 15 },
  count: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  activeText: { color: colors.primary },
});
