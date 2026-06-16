import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, elevation } from '../../constants/theme';

interface CastCardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  noPadding?: boolean;
}

export function CastCard({ children, header, footer, onPress, style, padding, noPadding }: CastCardProps) {
  const content = (
    <View style={[styles.card, noPadding && { padding: 0 }, padding !== undefined && { padding }, style]}>
      {header && <View style={styles.header}>{header}</View>}
      {children}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.card,
  },
  header: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
