import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../../components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../constants/theme';
import { useSessionStore } from '../../store/sessionStore';

const TAB_BAR_HEIGHT = 68;

function TabIcon({ name, color, focused, label }: { name: string; color: string; focused: boolean; label: string }) {
  return (
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons name={name as any} size={22} color={color} />
      {focused && <View style={styles.indicator} />}
    </View>
  );
}

function CenterButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      style={styles.centerBtnWrap}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Add catch or start session"
    >
      <LinearGradient
        colors={['#00D4AA', '#00B88A']}
        style={styles.centerBtn}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#031A12" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SessionBanner() {
  const activeSession = useSessionStore((s) => s.activeSession);
  const router = useRouter();
  const [, forceTick] = useState(0);

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
  const router = useRouter();

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
            paddingBottom: 10,
            paddingTop: 6,
            elevation: 0,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.3,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} label="Home" />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Spots',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="map-marker-multiple-outline" color={color} focused={focused} label="Spots" />
            ),
          }}
        />
        <Tabs.Screen
          name="session"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: () => null,
            tabBarButton: () => (
              <CenterButton onPress={() => router.push('/(tabs)/session' as any)} />
            ),
          }}
        />
        <Tabs.Screen
          name="catches"
          options={{
            title: 'Logbook',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'book-open-variant' : 'book-open-outline'} color={color} focused={focused} label="Logbook" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'account-circle' : 'account-circle-outline'} color={color} focused={focused} label="Profile" />
            ),
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
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  // Center + button
  centerBtnWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  centerBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },

  // Session banner
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
