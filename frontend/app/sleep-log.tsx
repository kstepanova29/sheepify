import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSleep } from '../hooks/useSleep';

export default function SleepLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeSession, startSession, completeSession, calculateDuration, loading } = useSleep();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second when sleep is active
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      setElapsedTime(calculateDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, calculateDuration]);

  const formatElapsedTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSleepQuality = (hours: number) => {
    if (hours < 6) return { text: 'Poor', emoji: '😴', color: '#ff6b6b' };
    if (hours < 8) return { text: 'Good', emoji: '😊', color: '#ffd93d' };
    return { text: 'Perfect', emoji: '🌟', color: '#6bcf7f' };
  };

  const handleStartSleep = async () => {
    try {
      await startSession();
      Alert.alert(
        '🌙 Good Night!',
        'Sleep tracking started. Tap "I Woke Up!" when you wake up in the morning.',
        [{ text: 'Sleep Well!' }]
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to start sleep session');
    }
  };

  const handleEndSleep = async () => {
    try {
      const result = await completeSession();
      const duration = result.session.duration_hours || 0;
      const quality = getSleepQuality(duration);

      let message = `You slept ${duration.toFixed(1)} hours!\n`;
      message += `Quality Score: ${result.quality_score.toFixed(0)}/100\n`;
      message += `Wool Earned: ${result.wool_earned} 🧶`;

      if (result.new_sheep_awarded) {
        message += `\n\n🎉 NEW SHEEP EARNED! 🎉\n${result.new_sheep_awarded.custom_name}`;
      }

      Alert.alert(
        `${quality.emoji} ${quality.text} Sleep!`,
        message,
        [
          {
            text: 'Nice!',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete session');
    }
  };

  const isSleeping = activeSession !== null;
  const quality = getSleepQuality(elapsedTime);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Please Login</Text>
          <Text style={styles.subtitle}>You need to be logged in to track sleep</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.startButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>💤 Sleep Tracker</Text>
        <Text style={styles.subtitle}>
          {isSleeping ? 'Tracking your sleep...' : 'Ready to track your sleep'}
        </Text>

        {/* Main Card */}
        {!isSleeping ? (
          // START SLEEP VIEW
          <View style={styles.mainCard}>
            <Text style={styles.bigEmoji}>🌙</Text>
            <Text style={styles.cardTitle}>Ready for Bed?</Text>
            <Text style={styles.cardDescription}>
              Tap the button below when you're going to sleep
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartSleep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.startButtonText}>😴 I'm Going to Sleep</Text>
              )}
            </TouchableOpacity>

            {/* User Info */}
            {user && (
              <View style={styles.streakCard}>
                <Text style={styles.streakText}>
                  Sleep Goal: {user.sleep_goal_hours} hours 🎯
                </Text>
                <Text style={styles.streakText}>
                  Wool Balance: {user.wool_balance} 🧶
                </Text>
              </View>
            )}
          </View>
        ) : (
          // SLEEPING VIEW
          <View style={styles.mainCard}>
            <Text style={styles.bigEmoji}>😴</Text>
            <Text style={styles.cardTitle}>You're Sleeping...</Text>

            {/* Elapsed Time Display */}
            <View style={[styles.timeCard, { borderColor: quality.color }]}>
              <Text style={styles.timeLabel}>Time Asleep</Text>
              <Text style={styles.timeValue}>{formatElapsedTime(elapsedTime)}</Text>
              <Text style={[styles.qualityBadge, { backgroundColor: quality.color }]}>
                {quality.emoji} {quality.text}
              </Text>

              {elapsedTime >= 8 && elapsedTime <= 10 && (
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>🐑 You'll earn a sheep!</Text>
                </View>
              )}
            </View>

            {/* Sleep Started Time */}
            <Text style={styles.startedText}>
              Started sleeping at{' '}
              {formatTime(new Date(activeSession.start_time))}
            </Text>

            {/* Wake Up Button */}
            <TouchableOpacity
              style={styles.wakeButton}
              onPress={handleEndSleep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.wakeButtonText}>☀️ I Woke Up!</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 How It Works</Text>
          <Text style={styles.tip}>
            • Tap "I'm Going to Sleep" when you go to bed
          </Text>
          <Text style={styles.tip}>
            • Tap "I Woke Up!" when you wake up in the morning
          </Text>
          <Text style={styles.tip}>• Sleep 8-10 hours to earn sheep 🐑</Text>
          <Text style={styles.tip}>
            • Keep your streak to earn Shepherd Tokens
          </Text>
          <Text style={styles.tip}>
            • Avoid 3 bad nights or lose a sheep! 🍳
          </Text>
        </View>
      </View>
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
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#a8a8d1',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8a8d1',
    marginBottom: 30,
  },
  mainCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  bigEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#a8a8d1',
    textAlign: 'center',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#e94560',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  wakeButton: {
    backgroundColor: '#ffd93d',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  wakeButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeCard: {
    backgroundColor: '#0f3460',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    borderWidth: 3,
    alignItems: 'center',
    width: '100%',
  },
  timeLabel: {
    fontSize: 14,
    color: '#a8a8d1',
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  qualityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  rewardBadge: {
    backgroundColor: '#6bcf7f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  rewardText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  startedText: {
    fontSize: 14,
    color: '#a8a8d1',
    marginBottom: 20,
  },
  streakCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    width: '100%',
  },
  streakText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#a8a8d1',
    marginBottom: 6,
  },
});
