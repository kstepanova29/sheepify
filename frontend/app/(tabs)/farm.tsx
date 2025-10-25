import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSheep } from '@/hooks/useSheep';
import { useWool } from '@/hooks/useWool';

export default function FarmScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { sheep, loading, renameSheep, toggleFavorite } = useSheep();
  const { balance, generationRate, collectWool, loading: woolLoading } = useWool();

  console.log('[FarmScreen] ============ RENDER ============');
  console.log('[FarmScreen] User:', user ? `${user.username}` : 'NULL');
  console.log('[FarmScreen] Auth Loading:', authLoading);

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('[FarmScreen] useEffect - authLoading:', authLoading, 'user:', user ? user.username : 'NULL');
    if (!authLoading && !user) {
      console.log('[FarmScreen] *** REDIRECTING to /auth/login ***');
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  if (!user) {
    console.log('[FarmScreen] Rendering login required screen');
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>Login Required</Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              console.log('[FarmScreen] Go to Login button pressed');
              router.replace('/auth/login');
            }}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  console.log('[FarmScreen] User authenticated, rendering farm view');

  const handleCollect = async () => {
    console.log('[FarmScreen] Collect button pressed');
    try {
      const amount = await collectWool();
      console.log('[FarmScreen] Collected wool:', amount);
      Alert.alert('Collected!', `+${amount} wool`);
    } catch (err) {
      console.error('[FarmScreen] Error collecting wool:', err);
      Alert.alert('Error', 'Failed to collect wool');
    }
  };

  const handleRename = (sheepId: string, currentName: string) => {
    Alert.prompt(
      'Rename Sheep',
      'Enter new name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name) => {
            if (name && name !== currentName) {
              try {
                await renameSheep(sheepId, name);
              } catch (err) {
                Alert.alert('Error', 'Failed to rename');
              }
            }
          },
        },
      ],
      'plain-text',
      currentName
    );
  };

  const getSheepEmoji = (type: string) => {
    const map: Record<string, string> = {
      starter: '🐑',
      merino: '🐏',
      suffolk: '🦙',
      cotswold: '✨',
      golden: '⭐',
    };
    return map[type] || '🐑';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{user.farm_name}</Text>

        {/* Wool Info */}
        <View style={styles.woolCard}>
          <View style={styles.woolInfo}>
            <Text style={styles.woolLabel}>Wool Balance</Text>
            <Text style={styles.woolValue}>{balance.toLocaleString()}</Text>
            <Text style={styles.woolRate}>+{generationRate.toFixed(1)}/hour</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.collectButton,
              pressed && !woolLoading && { opacity: 0.7 },
            ]}
            onPress={handleCollect}
            disabled={woolLoading}
          >
            {woolLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.collectButtonText}>Collect</Text>
            )}
          </Pressable>
        </View>

        {/* Sheep List */}
        <Text style={styles.sectionTitle}>Your Sheep ({sheep.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : sheep.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐑</Text>
            <Text style={styles.emptyText}>No sheep yet</Text>
            <Text style={styles.emptySubtext}>Complete sleep sessions to earn sheep</Text>
          </View>
        ) : (
          sheep.map((s) => (
            <View key={s.id} style={styles.sheepCard}>
              <View style={styles.sheepHeader}>
                <View style={styles.sheepInfo}>
                  <Text style={styles.sheepEmoji}>{getSheepEmoji(s.sheep_type_id)}</Text>
                  <View>
                    <Text style={styles.sheepName}>{s.custom_name}</Text>
                    <Text style={styles.sheepType}>{s.sheep_type_id}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    console.log('[FarmScreen] Favorite toggle pressed for sheep:', s.id);
                    toggleFavorite(s.id, !s.is_favorite);
                  }}
                  style={({ pressed }) => [
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.favorite}>{s.is_favorite ? '⭐' : '☆'}</Text>
                </Pressable>
              </View>

              <View style={styles.sheepStats}>
                <StatBadge label="Level" value={s.level.toString()} />
                <StatBadge label="Wool/hr" value={s.current_wool_rate.toString()} />
                <StatBadge label="Total" value={s.total_wool_generated.toString()} />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.renameButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  console.log('[FarmScreen] Rename button pressed for sheep:', s.id);
                  handleRename(s.id, s.custom_name);
                }}
              >
                <Text style={styles.renameButtonText}>Rename</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBadge}>
      <Text style={styles.statBadgeValue}>{value}</Text>
      <Text style={styles.statBadgeLabel}>{label}</Text>
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
    marginBottom: 24,
  },
  woolCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  woolInfo: {
    flex: 1,
  },
  woolLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  woolValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  woolRate: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
  collectButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    cursor: 'pointer' as any, // For web
  },
  collectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  sheepCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sheepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheepEmoji: {
    fontSize: 32,
  },
  sheepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sheepType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  favorite: {
    fontSize: 24,
  },
  sheepStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBadge: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  statBadgeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  statBadgeLabel: {
    fontSize: 10,
    color: '#666',
  },
  renameButton: {
    paddingVertical: 8,
    alignItems: 'center',
    cursor: 'pointer' as any, // For web
  },
  renameButtonText: {
    fontSize: 14,
    color: '#666',
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
});
