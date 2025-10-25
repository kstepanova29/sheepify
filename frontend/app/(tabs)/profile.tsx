import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSheep } from '@/hooks/useSheep';
import { useWool } from '@/hooks/useWool';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { sheepCount, getTotalWoolRate } = useSheep();
  const { balance } = useWool();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          {user.email && <Text style={styles.email}>{user.email}</Text>}
        </View>

        {/* Farm Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Stats</Text>
          <InfoRow label="Farm Name" value={user.farm_name} />
          <InfoRow label="Total Sheep" value={sheepCount.toString()} />
          <InfoRow label="Wool Balance" value={balance.toLocaleString()} />
          <InfoRow label="Generation Rate" value={`${getTotalWoolRate()}/hour`} />
        </View>

        {/* Sleep Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Settings</Text>
          <InfoRow label="Sleep Goal" value={`${user.sleep_goal_hours} hours`} />
          <InfoRow label="Timezone" value={user.timezone} />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <InfoRow
            label="Member Since"
            value={new Date(user.created_at).toLocaleDateString()}
          />
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8f9fa',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#000',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    cursor: 'pointer' as any, // For web
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 32,
  },
});
