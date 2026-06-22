import { useEffect, useState, Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { useAuthStore } from '../store/authStore';
import { useCatchStore } from '../store/catchStore';
import { useUserStore } from '../store/userStore';
import { colors } from '../constants/theme';

const CastTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: 'rgba(255,255,255,0.08)',
    primary: colors.primary,
  },
};

try { SplashScreen.preventAutoHideAsync(); } catch {}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ color: '#00D4AA', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Something went wrong</Text>
          <Text style={{ color: '#8B95A7', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {(this.state.error as Error).message}
          </Text>
          <TouchableOpacity onPress={() => this.setState({ error: null })}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}>
            <Text style={{ color: colors.background, fontWeight: '700' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const { loadUser } = useAuthStore();
  const { loadCatches } = useCatchStore();
  const { load: loadUserPrefs } = useUserStore();
  const [fontLoadTimedOut, setFontLoadTimedOut] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Inject MaterialCommunityIcons font-face directly into DOM for web
    const existing = document.getElementById('mci-font');
    if (existing) return;
    const style = document.createElement('style');
    style.id = 'mci-font';
    style.textContent = `@font-face{font-family:'material-community';src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.b62641afc9ab487008e996a5c5865e56.ttf') format('truetype');font-weight:normal;font-style:normal;}`;
    document.head.appendChild(style);
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Syne_600SemiBold,
    Syne_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    // Must be loaded explicitly on web — font name must match exactly what
    // @expo/vector-icons uses internally to resolve icon glyphs
    'material-community': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
    MaterialCommunityIcons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) return;
    const timeout = setTimeout(() => setFontLoadTimedOut(true), 3000);
    return () => clearTimeout(timeout);
  }, [fontsLoaded, fontError]);

  const fontsReady = fontsLoaded || Boolean(fontError) || fontLoadTimedOut;

  useEffect(() => {
    if (!fontsReady) return;
    async function init() {
      try {
        await Promise.all([loadUser(), loadCatches(), loadUserPrefs()]);
      } catch {}
      try { await SplashScreen.hideAsync(); } catch {}
    }
    init();
  }, [fontsReady]);

  // Don't render until icon font is loaded — prevents rectangle flash
  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <ThemeProvider value={CastTheme}>
    <ErrorBoundary>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
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
        <Stack.Screen name="friends" options={{ title: 'Friends' }} />
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
      </View>
    </ErrorBoundary>
    </ThemeProvider>
  );
}
