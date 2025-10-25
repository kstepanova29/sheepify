import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSleep } from '@/hooks/useSleep';

export default function SleepScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    activeSession,
    stats,
    loading,
    startSession,
    completeSession,
    calculateDuration,
    isActive,
  } = useSleep();

  const [elapsedTime, setElapsedTime] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setElapsedTime(calculateDuration());
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, calculateDuration]);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>Login Required</Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.replace('/auth/login')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    try {
      await startSession();
      Alert.alert('Sleep Started', 'Have a good rest! 😴');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to start');
    }
  };

  const handleComplete = async () => {
    try {
      const result = await completeSession();
      let msg = `Duration: ${result.session.duration_hours?.toFixed(1)}h\n`;
      msg += `Quality: ${result.quality_score.toFixed(0)}/100\n`;
      msg += `Wool: ${result.wool_earned}`;
      if (result.new_sheep_awarded) {
        msg += `\n\n🎉 New Sheep!\n${result.new_sheep_awarded.custom_name}`;
      }
      Alert.alert('Sleep Completed', msg);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sleep Tracker</Text>

        {isActive ? (
          <View style={styles.activeContainer}>
            <Text style={styles.status}>Currently Sleeping</Text>
            <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.subtitle}>
              Started: {new Date(activeSession!.start_time).toLocaleTimeString()}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.wakeButton,
                pressed && !loading && { opacity: 0.7 },
              ]}
              onPress={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={[styles.buttonText, styles.wakeButtonText]}>Wake Up</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.inactiveContainer}>
            <Text style={styles.icon}>😴</Text>
            <Text style={styles.subtitle}>Ready to track your sleep?</Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && !loading && { opacity: 0.7 },
              ]}
              onPress={handleStart}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Start Sleep</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Weekly Stats</Text>
            <View style={styles.statsGrid}>
              <StatItem label="Sessions" value={stats.total_sessions.toString()} />
              <StatItem label="Avg Duration" value={`${stats.avg_duration.toFixed(1)}h`} />
              <StatItem label="Avg Quality" value={`${stats.avg_quality.toFixed(0)}`} />
              <StatItem label="Wool Earned" value={stats.total_wool_earned.toString()} />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
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
  content: {
    padding: 20,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 32,
  },
  activeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  inactiveContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  status: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    cursor: 'pointer' as any, // For web
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  wakeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000',
  },
  wakeButtonText: {
    color: '#000',
  },
  statsContainer: {
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});
