/**
 * Cross-platform icon component.
 * Web: renders inline SVG from @mdi/js paths (no font required).
 * Native: delegates to MaterialCommunityIcons.
 */
import React from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Lazy-import @mdi/js only on web to keep native bundle clean
let mdiPaths: Record<string, string> | null = null;
if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mdiPaths = require('@mdi/js');
}

function toCamel(name: string): string {
  return 'mdi' + name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties | any;
}

export function Icon({ name, size = 24, color = '#fff', style }: IconProps) {
  if (Platform.OS === 'web' && mdiPaths) {
    const path = mdiPaths[toCamel(name)] ?? mdiPaths['mdiHelp'];
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        style={{ display: 'inline-block', flexShrink: 0, ...(style as any) }}
        // @ts-ignore
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={path} />
      </svg>
    );
  }
  return (
    <MaterialCommunityIcons
      name={name as any}
      size={size}
      color={color}
      style={style}
    />
  );
}

export default Icon;
