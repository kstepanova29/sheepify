import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSleep } from '@/hooks/useSleep';
import { useSheep } from '@/hooks/useSheep';
import { useWool } from '@/hooks/useWool';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { stats } = useSleep();
  const { sheepCount } = useSheep();
  const { balance, generationRate } = useWool();

  console.log('[HomeScreen] ============ RENDER ============');
  console.log('[HomeScreen] User:', user ? `${user.username} (id: ${user.id})` : 'NULL');
  console.log('[HomeScreen] Loading:', loading);
  console.log('[HomeScreen] Router:', typeof router, router ? 'exists' : 'NULL');

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    console.log('[HomeScreen] useEffect triggered');
    console.log('[HomeScreen] - loading:', loading);
    console.log('[HomeScreen] - user:', user ? user.username : 'NULL');

    if (!loading && !user) {
      console.log('[HomeScreen] *** AUTO-REDIRECTING to /auth/login ***');
      try {
        router.replace('/auth/login');
        console.log('[HomeScreen] router.replace() called successfully');
      } catch (error) {
        console.error('[HomeScreen] ERROR in router.replace():', error);
      }
    }
  }, [user, loading, router]);

  if (!user) {
    console.log('[HomeScreen] Rendering login prompt (no user authenticated)');
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.logo}>🐑</Text>
          <Text style={styles.title}>Sheepify</Text>
          <Text style={styles.subtitle}>Sleep Well, Earn Sheep</Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              console.log('[HomeScreen] ===============================================');
              console.log('[HomeScreen] GET STARTED BUTTON PRESSED');
              console.log('[HomeScreen] ===============================================');
              console.log('[HomeScreen] Current user:', user);
              console.log('[HomeScreen] Router type:', typeof router);
              console.log('[HomeScreen] Router keys:', Object.keys(router));
              console.log('[HomeScreen] Attempting: router.replace("/auth/login")');

              try {
                const result = router.replace('/auth/login');
                console.log('[HomeScreen] router.replace() returned:', result);
                console.log('[HomeScreen] Navigation initiated successfully');
              } catch (error) {
                console.error('[HomeScreen] *** ERROR during navigation ***');
                console.error('[HomeScreen] Error type:', typeof error);
                console.error('[HomeScreen] Error:', error);
                console.error('[HomeScreen] Error stack:', error instanceof Error ? error.stack : 'N/A');
              }

              console.log('[HomeScreen] After navigation attempt');
            }}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  console.log('[HomeScreen] Rendering authenticated home view');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.username}>{user.username}</Text>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="🧶" label="Wool" value={balance.toLocaleString()} />
          <StatCard icon="🐑" label="Sheep" value={sheepCount.toString()} />
          <StatCard icon="😴" label="Sessions" value={stats?.total_sessions.toString() || '0'} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>+{generationRate.toFixed(1)} wool/hour</Text>
        </View>

        {/* Quick Actions */}
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/(tabs)/sleep')}
        >
          <Text style={styles.actionButtonText}>😴 Track Sleep</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/(tabs)/farm')}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>🐑 View Farm</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#0284c7',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    cursor: 'pointer' as any, // For web
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  actionButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    cursor: 'pointer' as any, // For web
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000',
  },
  secondaryButtonText: {
    color: '#000',
  },
});
