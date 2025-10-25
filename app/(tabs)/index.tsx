import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../../store/gameStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user, initializeUser } = useGameStore();
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    // Initialize user if not exists (in production, this would be after login)
    if (!user) {
      initializeUser('Shepherd');
    }

    // Sheep bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const calculateDailyWool = () => {
    if (!user) return 0;
    return user.sheep.filter(s => s.isAlive).reduce((sum, sheep) => sum + sheep.woolProduction, 0);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🐑 Sheepify</Text>
        <Text style={styles.subtitle}>Sleep Well, Farm Better</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Sheep</Text>
          <Text style={styles.statValue}>
            {user?.sheep.filter(s => s.isAlive).length || 0}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Wool Blocks</Text>
          <Text style={styles.statValue}>{user?.woolBlocks || 0} 🧶</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>
            {user?.streak || 0} {user?.streak ? '🔥' : ''}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Daily Wool</Text>
          <Text style={styles.statValue}>{calculateDailyWool()}/day</Text>
        </View>
      </View>

      {/* Animated Sheep */}
      <Animated.Text
        style={[styles.sheepEmoji, { transform: [{ scale: scaleAnim }] }]}
      >
        🐑
      </Animated.Text>

      {/* Penalty Warning */}
      {user?.penalties.isInPenalty && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            🍳 Lamb Chop Alert! You've lost a sheep to the Butcher.
          </Text>
          <Text style={styles.warningSubtext}>
            Get 2 good nights of sleep to revive it!
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/sleep-log')}
        >
          <Text style={styles.buttonText}>💤 Log Sleep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/farm')}
        >
          <Text style={styles.buttonText}>🏡 View Farm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/friends')}
        >
          <Text style={styles.buttonText}>👥 Sleep Wars</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: '#a78bfa', borderColor: '#9f7aea' }]}
          onPress={() => router.push('/shleepy-test')}
        >
          <Text style={styles.buttonText}>🐑 Test Shleepy AI</Text>
        </TouchableOpacity>
      </View>

      {/* Fun Message */}
      <Text style={styles.footerText}>
        {user?.streak
          ? `${user.streak} nights in a row! Keep it up! 🌟`
          : 'Start your sleep journey tonight! 🌙'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8a8d1',
  },
  statsCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#a8a8d1',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sheepEmoji: {
    fontSize: 120,
    textAlign: 'center',
    marginVertical: 20,
  },
  warningCard: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 14,
    color: '#ffe5e5',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#e94560',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#0f3460',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16213e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#a8a8d1',
    fontSize: 14,
  },
});
