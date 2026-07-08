import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, elevation } from '../../constants/theme';

interface CastButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

export function CastButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  accessibilityLabel,
}: CastButtonProps) {
  const sizeStyles = {
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.sm },
    md: { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, borderRadius: radius.md },
    lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radius.lg },
  };

  const textSizes = {
    sm: { fontSize: 13 },
    md: { fontSize: 15 },
    lg: { fontSize: 17 },
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPress={onPress}
        disabled={isDisabled}
        style={[fullWidth && { width: '100%' }, !isDisabled && elevation.glow, style]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={isDisabled ? ['#4B5563', '#374151'] : ['#00D4AA', '#00B892']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color="#0A0E1A" size="small" />
          ) : (
            <Text style={[styles.primaryText, textSizes[size], textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    secondary: { backgroundColor: colors.secondary },
    ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
    danger: { backgroundColor: colors.danger },
  };

  const variantTextColor: Record<string, string> = {
    secondary: '#0A0E1A',
    ghost: colors.primary,
    danger: '#fff',
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variantTextColor[variant]} size="small" />
      ) : (
        <Text style={[styles.text, textSizes[size], { color: variantTextColor[variant] }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryText: {
    color: '#0A0E1A',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.5,
  },
});
