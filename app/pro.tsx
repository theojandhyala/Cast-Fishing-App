import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProPaywall } from '../components/paywall/ProPaywall';
import { useRouter } from 'expo-router';
import { colors } from '../constants/theme';

export default function ProScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ProPaywall onClose={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
