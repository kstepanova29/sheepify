/**
 * Sleep Statistics Component
 * Displays weekly sleep statistics
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSleep } from '../../hooks/useSleep';

export const SleepStats: React.FC = () => {
  const { stats, loading, loadStats } = useSleep();

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !stats) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No sleep data yet. Start tracking!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Statistics</Text>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Sessions"
          value={stats.total_sessions.toString()}
          icon="📊"
        />
        <StatCard
          label="Avg Duration"
          value={`${stats.avg_duration.toFixed(1)}h`}
          icon="⏰"
        />
        <StatCard
          label="Avg Quality"
          value={`${stats.avg_quality.toFixed(0)}/100`}
          icon="⭐"
        />
        <StatCard
          label="Wool Earned"
          value={stats.total_wool_earned.toString()}
          icon="🧶"
        />
        <StatCard
          label="Best Quality"
          value={`${stats.best_quality.toFixed(0)}/100`}
          icon="🏆"
        />
      </View>

      {stats.recent_sessions.length > 0 && (
        <View style={styles.recentSessions}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {stats.recent_sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <Text style={styles.sessionDate}>
                {new Date(session.start_time).toLocaleDateString()}
              </Text>
              <Text style={styles.sessionDetail}>
                Duration: {session.duration_hours?.toFixed(1)}h
              </Text>
              <Text style={styles.sessionDetail}>
                Quality: {session.quality_score?.toFixed(0)}/100
              </Text>
              <Text style={styles.sessionDetail}>
                Wool: {session.reward_wool} 🧶
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string }> = ({
  label,
  value,
  icon,
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recentSessions: {
    marginTop: 10,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sessionDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});