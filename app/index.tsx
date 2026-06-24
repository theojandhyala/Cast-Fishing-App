import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  if (isLoading) return null;
  if (isAuthenticated) {
    return <Redirect href={user?.hasCompletedOnboarding === false ? '/(auth)/onboarding' : '/(tabs)'} />;
  }
  return <Redirect href="/(auth)/login" />;
}
