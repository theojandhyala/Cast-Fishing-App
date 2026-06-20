import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';

const TAB_BAR_HEIGHT = 68;

function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.indicator} />}
      <MaterialCommunityIcons name={name as any} size={22} color={color} />
    </View>
  );
}

// Persistent "Currently fishing at..." banner. Rendered as an overlay that sits
// directly above the tab bar — NOT inside tabBarBackground, which has a fragile
// render context on web and was causing a blank screen.
function SessionBanner() {
  const activeSession = useSessionStore((s) => s.activeSession);
  const router = useRouter();
  const [, forceTick] = useState(0);

  // Keep the elapsed timer fresh while a session is running.
  useEffect(() => {
    if (!activeSession) return;
    const id = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, [activeSession]);

  if (!activeSession) return null;

  const startTime = new Date(activeSession.startTime);
  const elapsed = Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 60000));
  const hours = Math.floor(elapsed / 60);
  const mins = elapsed % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <View style={styles.bannerWrap} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push('/session')}
        accessibilityRole="button"
        accessibilityLabel={`Return to your active session at ${activeSession.spotName}`}
      >
        <LinearGradient
          colors={['#001F18', '#002E22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.activeDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerLabel}>CURRENTLY FISHING AT</Text>
              <Text style={styles.bannerSpot} numberOfLines={1}>{activeSession.spotName}</Text>
            </View>
          </View>
          <View style={styles.bannerRight}>
            <MaterialCommunityIcons name="timer-outline" size={14} color={colors.primary} />
            <Text style={styles.bannerTime}>{timeStr}</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(0,212,170,0.5)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: TAB_BAR_HEIGHT,
            paddingBottom: 12,
            paddingTop: 6,
            elevation: 0,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => <TabIcon name="home-outline" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Spots',
            tabBarIcon: ({ color, focused }) => <TabIcon name="map-marker-multiple-outline" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="session"
          options={{
            title: 'Session',
            tabBarIcon: ({ color, focused }) => <TabIcon name="timer-outline" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="catches"
          options={{
            title: 'Log',
            tabBarIcon: ({ color, focused }) => <TabIcon name="book-open-variant" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => <TabIcon name="account-circle-outline" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen name="tips" options={{ href: null }} />
        <Tabs.Screen name="more" options={{ href: null }} />
        <Tabs.Screen name="add-tab" options={{ href: null }} />
      </Tabs>

      <SessionBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
    gap: 4,
  },
  indicator: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  bannerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,212,170,0.25)',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
  bannerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
    opacity: 0.75,
  },
  bannerSpot: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bannerTime: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
});
