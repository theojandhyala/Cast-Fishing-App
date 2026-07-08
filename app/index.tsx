import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (user?.hasCompletedOnboarding === false) {
      router.replace('/(auth)/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated, user?.hasCompletedOnboarding]);

  // Always render a dark view — never null — so there is no white flash
  // while auth state resolves or while Expo Router navigates (iOS Safari).
  return <View style={{ flex: 1, backgroundColor: '#0A0E1A' }} />;
}
