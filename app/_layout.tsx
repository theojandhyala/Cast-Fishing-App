import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import MaterialCommunityIconsFont from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../store/authStore';
import { useCatchStore } from '../store/catchStore';
import { useUserStore } from '../store/userStore';
import { colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadUser } = useAuthStore();
  const { loadCatches } = useCatchStore();
  const { load: loadUserPrefs } = useUserStore();
  const [ready, setReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Syne_600SemiBold,
    Syne_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    ...MaterialCommunityIconsFont.font,
  });

  useEffect(() => {
    // Fallback: if fonts don't load within 4s, continue anyway
    const timeout = setTimeout(() => setReady(true), 4000);
    if (fontsLoaded) {
      clearTimeout(timeout);
      setReady(true);
    }
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  useEffect(() => {
    if (!ready) return;
    async function init() {
      await Promise.all([loadUser(), loadCatches(), loadUserPrefs()]);
      await SplashScreen.hideAsync().catch(() => {});
    }
    init();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="identifier"
          options={{
            title: 'Fish Identifier',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen name="knots" options={{ title: 'Knot Library' }} />
        <Stack.Screen name="knot-detail" options={{ title: 'Knot Tutorial' }} />
        <Stack.Screen name="add-catch" options={{ title: 'Log a Catch' }} />
        <Stack.Screen name="catch-detail" options={{ title: 'Catch Details' }} />
        <Stack.Screen name="species-detail" options={{ title: 'Species Info' }} />
        <Stack.Screen name="conditions" options={{ title: 'Tides & Conditions' }} />
        <Stack.Screen name="pro" options={{ title: 'CAST Pro', presentation: 'modal' }} />
        <Stack.Screen name="fish-tips" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
        <Stack.Screen name="leaderboards" options={{ title: 'Leaderboards' }} />
        <Stack.Screen name="clubs" options={{ title: 'Fishing Clubs' }} />
        <Stack.Screen name="challenges" options={{ title: 'Challenges' }} />
        <Stack.Screen name="tackle-shops" options={{ title: 'Tackle Shops' }} />
        <Stack.Screen name="competitions" options={{ title: 'Competitions' }} />
        <Stack.Screen name="rig-builder" options={{ title: 'Rig Builder' }} />
        <Stack.Screen name="water-conditions" options={{ title: 'Water Conditions' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notification Settings' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="my-stats" options={{ title: 'My Fishing Story' }} />
        <Stack.Screen name="catch-card-share" options={{ title: 'Share Catch' }} />
        <Stack.Screen name="search" options={{ title: 'Search', headerShown: false }} />
        <Stack.Screen name="ai-advisor" options={{ title: 'AI Advisor' }} />
        <Stack.Screen name="weather-detail" options={{ title: 'Weather & Conditions' }} />
        <Stack.Screen name="trip-planner" options={{ title: 'Trip Planner' }} />
        <Stack.Screen name="gear-tracker" options={{ title: 'Gear Tracker' }} />
        <Stack.Screen name="records" options={{ title: 'Records' }} />
        <Stack.Screen name="bait-guide" options={{ title: 'Bait Guide' }} />
        <Stack.Screen name="fishing-calendar" options={{ title: 'Fishing Calendar' }} />
        <Stack.Screen name="community" options={{ title: 'Community' }} />
        <Stack.Screen name="marketplace" options={{ title: 'Tackle Marketplace' }} />
        <Stack.Screen name="fishing-guides" options={{ title: 'Fishing Guides' }} />
        <Stack.Screen name="casting-calculator" options={{ title: 'Casting Calculator' }} />
        <Stack.Screen name="moon-calendar" options={{ title: 'Moon Calendar' }} />
        <Stack.Screen name="fishing-journal" options={{ title: 'Fishing Journal' }} />
        <Stack.Screen name="safety" options={{ title: 'Safety & Emergency' }} />
        <Stack.Screen name="fish-encyclopedia" options={{ title: 'Fish Encyclopedia' }} />
        <Stack.Screen name="fish-radar" options={{ title: 'Fish Radar' }} />
        <Stack.Screen name="species-compare" options={{ title: 'Species Compare' }} />
        <Stack.Screen name="quests" options={{ title: 'Quest Log' }} />
        <Stack.Screen name="fish-database" options={{ title: 'Fish Database' }} />
        <Stack.Screen name="session" options={{ headerShown: false }} />
        <Stack.Screen name="session-summary" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </>
  );
}
