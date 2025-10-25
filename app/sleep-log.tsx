import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function SleepLogScreen() {
  const router = useRouter();
  const { addSleepSession, user } = useGameStore();

  const [bedTime, setBedTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  const calculateDuration = () => {
    const diff = wakeTime.getTime() - bedTime.getTime();
    const hours = diff / (1000 * 60 * 60);
    return Math.abs(hours);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSleepQuality = (hours: number) => {
    if (hours < 6) return { text: 'Poor', emoji: '😴', color: '#ff6b6b' };
    if (hours < 8) return { text: 'Good', emoji: '😊', color: '#ffd93d' };
    return { text: 'Perfect', emoji: '🌟', color: '#6bcf7f' };
  };

  const handleSubmit = () => {
    const duration = calculateDuration();

    if (duration < 2 || duration > 16) {
      Alert.alert('Invalid Sleep Time', 'Please enter a realistic sleep duration.');
      return;
    }

    addSleepSession({
      date: new Date(),
      bedTime,
      wakeTime,
      duration,
      quality: duration < 6 ? 'poor' : duration < 8 ? 'good' : 'perfect',
    });

    const quality = getSleepQuality(duration);
    const earnedSheep = duration >= 8 && duration <= 10;

    Alert.alert(
      `${quality.emoji} ${quality.text} Sleep!`,
      earnedSheep
        ? `You slept ${duration.toFixed(1)} hours and earned a new sheep! 🐑`
        : `You slept ${duration.toFixed(1)} hours. ${
            duration < 8
              ? 'Sleep 8-10 hours to earn sheep!'
              : 'Great sleep, but over 10 hours!'
          }`,
      [
        {
          text: 'Nice!',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const duration = calculateDuration();
  const quality = getSleepQuality(duration);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>💤 Log Your Sleep</Text>
        <Text style={styles.subtitle}>Track your nightly rest</Text>

        {/* Sleep Time Inputs */}
        <View style={styles.card}>
          <Text style={styles.label}>When did you go to bed?</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowBedTimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(bedTime)}</Text>
            <Text style={styles.timeEmoji}>🛏️</Text>
          </TouchableOpacity>

          {showBedTimePicker && (
            <DateTimePicker
              value={bedTime}
              mode="time"
              is24Hour={false}
              onChange={(event, selectedDate) => {
                setShowBedTimePicker(false);
                if (selectedDate) setBedTime(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>When did you wake up?</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowWakeTimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(wakeTime)}</Text>
            <Text style={styles.timeEmoji}>☀️</Text>
          </TouchableOpacity>

          {showWakeTimePicker && (
            <DateTimePicker
              value={wakeTime}
              mode="time"
              is24Hour={false}
              onChange={(event, selectedDate) => {
                setShowWakeTimePicker(false);
                if (selectedDate) setWakeTime(selectedDate);
              }}
            />
          )}
        </View>

        {/* Duration Display */}
        <View style={[styles.durationCard, { borderColor: quality.color }]}>
          <Text style={styles.durationLabel}>Sleep Duration</Text>
          <Text style={styles.durationValue}>
            {duration.toFixed(1)} hours {quality.emoji}
          </Text>
          <Text style={[styles.qualityText, { color: quality.color }]}>
            {quality.text} Sleep
          </Text>

          {duration >= 8 && duration <= 10 && (
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>🐑 You'll earn a sheep!</Text>
            </View>
          )}
        </View>

        {/* Streak Info */}
        {user && (
          <View style={styles.streakCard}>
            <Text style={styles.streakText}>
              Current Streak: {user.streak} nights 🔥
            </Text>
            {user.penalties.lambChopWarning > 0 && (
              <Text style={styles.warningText}>
                ⚠️ {3 - user.penalties.lambChopWarning} more bad night(s) until
                Lamb Chop penalty!
              </Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>✅ Log Sleep</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Sleep Tips</Text>
          <Text style={styles.tip}>• Sleep 8-10 hours to earn sheep</Text>
          <Text style={styles.tip}>• Keep your streak to earn Shepherd Tokens</Text>
          <Text style={styles.tip}>• Avoid 3 bad nights or lose a sheep!</Text>
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
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#a8a8d1',
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    padding: 16,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeEmoji: {
    fontSize: 32,
  },
  durationCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 3,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    color: '#a8a8d1',
    marginBottom: 8,
  },
  durationValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  qualityText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rewardBadge: {
    backgroundColor: '#6bcf7f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  rewardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  streakCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  submitButton: {
    backgroundColor: '#e94560',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
