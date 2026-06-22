import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const profile = useUserStore((s) => s.profile);

  if (isLoading) return null;

  if (isAuthenticated) {
    if (profile && !profile.onboardingComplete) {
      return <Redirect href="/(onboarding)/welcome" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
