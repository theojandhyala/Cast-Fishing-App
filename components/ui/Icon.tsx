import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties | any;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Icon({ name, size = 24, color = '#fff', style, onPress, accessibilityLabel }: IconProps) {
  return (
    <MaterialCommunityIcons
      name={name as any}
      size={size}
      color={color}
      style={style}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

export default Icon;
