/**
 * Wool Balance Component
 * Displays current wool balance, generation rate, and collection button
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useWool } from '../../hooks/useWool';

export const WoolBalance: React.FC = () => {
  const {
    balance,
    generationRate,
    loading,
    loadBalance,
    collectWool,
  } = useWool();

  useEffect(() => {
    loadBalance();
  }, []);

  const handleCollect = async () => {
    try {
      const collected = await collectWool();
      Alert.alert(
        'Wool Collected!',
        `You collected ${collected} wool! 🧶`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to collect wool');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wool Balance</Text>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceEmoji}>🧶</Text>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
          <Text style={styles.balanceLabel}>Wool Blocks</Text>
        </View>
      </View>

      <View style={styles.rateContainer}>
        <Text style={styles.rateText}>
          +{generationRate.toFixed(1)} wool/hour
        </Text>
      </View>

      <TouchableOpacity
        style={styles.collectButton}
        onPress={handleCollect}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.collectButtonText}>Collect Wool</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.helpText}>
        Wool is generated automatically by your sheep!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  rateContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rateText: {
    fontSize: 16,
    color: '#0284c7',
    fontWeight: '600',
    textAlign: 'center',
  },
  collectButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  collectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});