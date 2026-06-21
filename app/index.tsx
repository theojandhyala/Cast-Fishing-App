import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login');
    }
  }, [isLoading, isAuthenticated]);

  // Always render a dark view — never null — so there is no white flash
  // while auth state resolves or while Expo Router navigates.
  return <View style={{ flex: 1, backgroundColor: '#0A0E1A' }} />;
}
