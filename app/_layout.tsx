import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import { useAuthStore } from '../store/authStore';
import { useCatchStore } from '../store/catchStore';
import { useUserStore } from '../store/userStore';
import { colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadUser } = useAuthStore();
  const { loadCatches } = useCatchStore();
  const { load: loadUserPrefs } = useUserStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Syne_600SemiBold,
    Syne_700Bold,
  });

  useEffect(() => {
    async function init() {
      await Promise.all([loadUser(), loadCatches(), loadUserPrefs()]);
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
      </Stack>
    </>
  );
}
