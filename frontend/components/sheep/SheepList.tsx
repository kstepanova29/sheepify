/**
 * Sheep List Component
 * Displays all user's sheep with management options
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useSheep } from '../../hooks/useSheep';
import { SheepResponse } from '../../services/sheepService';

export const SheepList: React.FC = () => {
  const { sheep, loading, loadSheep, renameSheep, toggleFavorite, sheepCount } = useSheep();

  useEffect(() => {
    loadSheep();
  }, []);

  const handleToggleFavorite = async (sheepId: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(sheepId, !currentStatus);
    } catch (err) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleRename = async (sheepId: string, currentName: string) => {
    Alert.prompt(
      'Rename Sheep',
      'Enter a new name for your sheep:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newName) => {
            if (newName && newName.trim() !== currentName) {
              try {
                await renameSheep(sheepId, newName.trim());
                Alert.alert('Success', 'Sheep renamed!');
              } catch (err) {
                Alert.alert('Error', 'Failed to rename sheep');
              }
            }
          },
        },
      ],
      'plain-text',
      currentName
    );
  };

  if (loading && sheep.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (sheep.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No sheep yet! 🐑</Text>
        <Text style={styles.emptySubtext}>
          Complete sleep sessions to earn your first sheep
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sheep ({sheepCount})</Text>

      <FlatList
        data={sheep}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SheepCard
            sheep={item}
            onToggleFavorite={handleToggleFavorite}
            onRename={handleRename}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const SheepCard: React.FC<{
  sheep: SheepResponse;
  onToggleFavorite: (id: string, currentStatus: boolean) => void;
  onRename: (id: string, currentName: string) => void;
}> = ({ sheep, onToggleFavorite, onRename }) => {
  const getSheepEmoji = (type: string): string => {
    const emojiMap: Record<string, string> = {
      starter: '🐑',
      merino: '🐏',
      suffolk: '🦙',
      cotswold: '✨🐑',
      golden: '🌟🐑',
    };
    return emojiMap[type] || '🐑';
  };

  const getRarityColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      starter: '#94a3b8',
      merino: '#3b82f6',
      suffolk: '#8b5cf6',
      cotswold: '#ec4899',
      golden: '#f59e0b',
    };
    return colorMap[type] || '#94a3b8';
  };

  return (
    <View style={[styles.card, { borderLeftColor: getRarityColor(sheep.sheep_type_id) }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.sheepEmoji}>{getSheepEmoji(sheep.sheep_type_id)}</Text>
          <View>
            <Text style={styles.sheepName}>{sheep.custom_name}</Text>
            <Text style={styles.sheepType}>{sheep.sheep_type_id}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => onToggleFavorite(sheep.id, sheep.is_favorite)}>
          <Text style={styles.favoriteIcon}>{sheep.is_favorite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardStats}>
        <StatItem label="Level" value={sheep.level.toString()} />
        <StatItem label="Wool/hr" value={sheep.current_wool_rate.toString()} />
        <StatItem label="Total Wool" value={sheep.total_wool_generated.toString()} />
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRename(sheep.id, sheep.custom_name)}
        >
          <Text style={styles.actionButtonText}>Rename</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statItem}>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheepEmoji: {
    fontSize: 32,
  },
  sheepName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sheepType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});