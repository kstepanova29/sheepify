import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useGameStore } from '../store/gameStore';

export default function SleepLogScreen() {
  const router = useRouter();
  const { startSleep, endSleep, user, activeSleepSession } = useGameStore();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load retro pixel font
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  // Update elapsed time every second when sleep is active
  useEffect(() => {
    if (!activeSleepSession?.isActive) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const bedTime = new Date(activeSleepSession.bedTime).getTime();
      const elapsed = (now - bedTime) / (1000 * 60 * 60); // hours
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSleepSession]);

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

  const handleStartSleep = () => {
    startSleep();
    Alert.alert(
      '🌙 Good Night!',
      'Sleep tracking started. Tap "I Woke Up!" when you wake up in the morning.',
      [{ text: 'Sleep Well!' }]
    );
  };

  const handleEndSleep = () => {
    const duration = elapsedTime;
    const quality = getSleepQuality(duration);
    const earnedSheep = duration >= 8 && duration <= 10;

    Alert.alert(
      `${quality.emoji} ${quality.text} Sleep!`,
      earnedSheep
        ? `You slept ${duration.toFixed(1)} hours and earned a new sheep! 🐑`
        : `You slept ${duration.toFixed(1)} hours. ${
            duration < 8
              ? 'Sleep 8-10 hours to earn sheep!'
              : duration > 10
              ? 'Over 10 hours - try to keep it under 10!'
              : 'Great sleep!'
          }`,
      [
        {
          text: 'Nice!',
          onPress: () => {
            endSleep();
            router.back();
          },
        },
      ]
    );
  };

  const isSleeping = activeSleepSession?.isActive;
  const quality = getSleepQuality(elapsedTime);

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
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
            >
              <Text style={styles.startButtonText}>😴 I'm Going to Sleep</Text>
            </TouchableOpacity>

            {/* Streak Info */}
            {user && (
              <View style={styles.streakCard}>
                <Text style={styles.streakText}>
                  Current Streak: {user.streak} nights 🔥
                </Text>
                {user.penalties.lambChopWarning > 0 && (
                  <Text style={styles.warningText}>
                    ⚠️ {3 - user.penalties.lambChopWarning} more bad night(s)
                    until Lamb Chop penalty!
                  </Text>
                )}
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
              {formatTime(activeSleepSession.bedTime)}
            </Text>

            {/* Wake Up Button */}
            <TouchableOpacity
              style={styles.wakeButton}
              onPress={handleEndSleep}
            >
              <Text style={styles.wakeButtonText}>☀️ I Woke Up!</Text>
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
    fontSize: 10,
    fontFamily: 'PressStart2P_400Regular',
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'PressStart2P_400Regular',
  },
  subtitle: {
    fontSize: 10,
    color: '#a8a8d1',
    marginBottom: 30,
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 16,
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
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    marginBottom: 10,
    fontFamily: 'PressStart2P_400Regular',
  },
  cardDescription: {
    fontSize: 10,
    color: '#a8a8d1',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 16,
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
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'PressStart2P_400Regular',
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
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'PressStart2P_400Regular',
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
    fontSize: 10,
    color: '#a8a8d1',
    marginBottom: 8,
    fontFamily: 'PressStart2P_400Regular',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'PressStart2P_400Regular',
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
    fontWeight: '400',
    fontSize: 10,
    fontFamily: 'PressStart2P_400Regular',
  },
  startedText: {
    fontSize: 10,
    color: '#a8a8d1',
    marginBottom: 20,
    fontFamily: 'PressStart2P_400Regular',
  },
  streakCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    width: '100%',
  },
  streakText: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 16,
  },
  warningText: {
    fontSize: 10,
    color: '#ff6b6b',
    textAlign: 'center',
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 16,
  },
  tipsCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'PressStart2P_400Regular',
  },
  tip: {
    fontSize: 10,
    color: '#a8a8d1',
    marginBottom: 6,
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 16,
  },
});