/**
 * Sleep Tracker Component
 * Main component for starting and ending sleep sessions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSleep } from '../../hooks/useSleep';
import { useAuth } from '../../contexts/AuthContext';

export const SleepTracker: React.FC = () => {
  const { user } = useAuth();
  const {
    activeSession,
    loading,
    error,
    startSession,
    completeSession,
    calculateDuration,
    isActive,
  } = useSleep();

  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second when session is active
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setElapsedTime(calculateDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, calculateDuration]);

  const handleStartSleep = async () => {
    try {
      await startSession();
      Alert.alert('Sleep Session Started', 'Sweet dreams! 🌙');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to start session');
    }
  };

  const handleWakeUp = async () => {
    try {
      const result = await completeSession();

      let message = `You slept for ${result.session.duration_hours?.toFixed(1)} hours!\n`;
      message += `Quality Score: ${result.quality_score.toFixed(0)}/100\n`;
      message += `Wool Earned: ${result.wool_earned} 🧶`;

      if (result.new_sheep_awarded) {
        message += `\n\n🎉 NEW SHEEP AWARDED! 🎉\n${result.new_sheep_awarded.custom_name}`;
      }

      Alert.alert('Sleep Session Complete', message);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete session');
    }
  };

  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please login to track sleep</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Tracker</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isActive ? (
        <View style={styles.activeSession}>
          <Text style={styles.statusText}>Currently Sleeping... 😴</Text>
          <Text style={styles.timerText}>{formatDuration(elapsedTime)}</Text>
          <Text style={styles.subtitleText}>
            Started: {new Date(activeSession!.start_time).toLocaleString()}
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.wakeButton]}
            onPress={handleWakeUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Completing...' : 'I Woke Up! ☀️'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inactiveSession}>
          <Text style={styles.statusText}>Ready to Sleep? 🌙</Text>
          <Text style={styles.subtitleText}>
            Track your sleep and earn wool + sheep!
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.sleepButton]}
            onPress={handleStartSleep}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Starting...' : 'Start Sleep Session'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
    textAlign: 'center',
  },
  activeSession: {
    alignItems: 'center',
  },
  inactiveSession: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
    marginVertical: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  sleepButton: {
    backgroundColor: '#667eea',
  },
  wakeButton: {
    backgroundColor: '#f59e0b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 10,
  },
});