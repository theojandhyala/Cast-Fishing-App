import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon as MaterialCommunityIcons } from '../ui/Icon';
import { useAuthStore } from '../../store/authStore';

interface ProGateProps {
  feature: string;         // e.g. "Unlimited AI Scans"
  description: string;     // one-line description
  icon: string;            // MaterialCommunityIcons name
  children: React.ReactNode;
}

export function ProGate({ feature, description, icon, children }: ProGateProps) {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  if (user?.isPro) return <>{children}</>;
  return (
    <View style={s.wrap}>
      <LinearGradient colors={['rgba(0,212,170,0.08)', 'rgba(0,212,170,0.02)']} style={s.card}>
        <View style={s.iconCircle}>
          <MaterialCommunityIcons name={icon as any} size={28} color="#00D4AA" />
        </View>
        <Text style={s.featureName}>{feature}</Text>
        <Text style={s.desc}>{description}</Text>
        <TouchableOpacity onPress={() => router.push('/pro' as any)} activeOpacity={0.85}>
          <LinearGradient colors={['#00D4AA', '#00A882']} style={s.btn}>
            <Text style={s.btnText}>UPGRADE TO PRO</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)', padding: 28, alignItems: 'center', gap: 12 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,212,170,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  featureName: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  desc: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20 },
  btn: { borderRadius: 50, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  btnText: { fontSize: 13, fontWeight: '800', color: '#050A12', letterSpacing: 1.2 },
});
