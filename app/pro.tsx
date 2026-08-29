import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProPaywall } from '../components/paywall/ProPaywall';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../constants/theme';

export default function ProScreen() {
  const router = useRouter();
  // `welcome=1` is the plan step shown at the end of sign-up: dismissing it
  // must drop the user into the app rather than back into onboarding.
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const isWelcome = welcome === '1';

  return (
    <View style={styles.container}>
      <ProPaywall
        welcome={isWelcome}
        onClose={() => (isWelcome ? router.replace('/(tabs)') : router.back())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
