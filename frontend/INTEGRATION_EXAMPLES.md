# Integration Examples

This document shows how to integrate the new backend-connected components into your existing app screens.

---

## Example 1: Update Farm Screen to Show Real Sheep

**Current:** `app/farm.tsx` uses mock data
**Update:** Use real sheep from backend

```typescript
// app/farm.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSheep } from '@/hooks/useSheep';
import { useWool } from '@/hooks/useWool';
import { useAuth } from '@/contexts/AuthContext';
import Animated from 'react-native-reanimated';

export default function FarmScreen() {
  const { user } = useAuth();
  const { sheep, loading: sheepLoading } = useSheep();
  const { balance, generationRate } = useWool();

  // Your existing animation code...
  const timeOfDay = getTimeOfDay();
  const skyColor = getSkyColor(timeOfDay);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginPrompt}>Please login to view your farm</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Your existing animated sky background */}
      <Animated.View style={[styles.sky, { backgroundColor: skyColor }]}>
        {/* Sun/Moon animation */}
      </Animated.View>

      {/* Farm Header */}
      <View style={styles.header}>
        <Text style={styles.farmName}>{user.farm_name}</Text>
        <Text style={styles.woolDisplay}>🧶 {balance} (+{generationRate.toFixed(1)}/hr)</Text>
      </View>

      {/* Sheep Display - Using Real Data */}
      <View style={styles.sheepContainer}>
        {sheepLoading ? (
          <Text>Loading sheep...</Text>
        ) : sheep.length === 0 ? (
          <Text>No sheep yet! Complete sleep sessions to earn sheep.</Text>
        ) : (
          sheep.map((s) => (
            <View key={s.id} style={styles.sheepSprite}>
              <Text style={styles.sheepEmoji}>{getSheepEmoji(s.sheep_type_id)}</Text>
              <Text style={styles.sheepName}>{s.custom_name}</Text>
              <Text style={styles.sheepWool}>+{s.current_wool_rate}/hr</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function getSheepEmoji(type: string): string {
  const emojiMap = {
    starter: '🐑',
    merino: '🐏',
    suffolk: '🦙',
    cotswold: '✨🐑',
    golden: '🌟🐑',
  };
  return emojiMap[type] || '🐑';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87CEEB' },
  header: { padding: 20, alignItems: 'center' },
  farmName: { fontSize: 28, fontWeight: 'bold', color: '#2d5016' },
  woolDisplay: { fontSize: 20, marginTop: 8 },
  sheepContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 16 },
  sheepSprite: { alignItems: 'center', width: 80 },
  sheepEmoji: { fontSize: 48 },
  sheepName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  sheepWool: { fontSize: 10, color: '#666' },
  // ... keep your existing sky animation styles
});
```

---

## Example 2: Add Dashboard to Main Tab

**Create:** `app/(tabs)/dashboard.tsx`

```typescript
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSleep } from '@/hooks/useSleep';
import { useSheep } from '@/hooks/useSheep';
import { useWool } from '@/hooks/useWool';
import { WoolBalance } from '@/components/wool/WoolBalance';
import { SleepStats } from '@/components/sleep/SleepStats';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { stats, loadStats, loading: sleepLoading } = useSleep();
  const { sheepCount } = useSheep();
  const { balance } = useWool();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Sheepify!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()},</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="🐑"
          label="Total Sheep"
          value={sheepCount.toString()}
          onPress={() => router.push('/farm')}
        />
        <StatCard
          icon="🧶"
          label="Wool Balance"
          value={balance.toString()}
        />
        <StatCard
          icon="😴"
          label="Sleep Sessions"
          value={stats?.total_sessions.toString() || '0'}
        />
        <StatCard
          icon="⭐"
          label="Avg Quality"
          value={stats?.avg_quality.toFixed(0) || '0'}
        />
      </View>

      {/* Wool Balance Widget */}
      <WoolBalance />

      {/* Quick Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.sleepButton]}
          onPress={() => router.push('/sleep-log')}
        >
          <Text style={styles.actionButtonText}>😴 Track Sleep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.farmButton]}
          onPress={() => router.push('/farm')}
        >
          <Text style={styles.actionButtonText}>🐑 View Farm</Text>
        </TouchableOpacity>
      </View>

      {/* Sleep Stats */}
      <SleepStats />
    </ScrollView>
  );
}

function StatCard({ icon, label, value, onPress }: any) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: { fontSize: 16, color: '#666' },
  username: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 4 },
  logoutButton: { color: '#667eea', fontSize: 16, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  actionButtons: { flexDirection: 'row', padding: 20, gap: 12 },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sleepButton: { backgroundColor: '#667eea' },
  farmButton: { backgroundColor: '#10b981' },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  // ... other styles
});
```

Then add to tab navigator in `app/(tabs)/_layout.tsx`:

```typescript
<Tabs.Screen
  name="dashboard"
  options={{
    title: 'Dashboard',
    tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
  }}
/>
```

---

## Example 3: Add Profile Screen

**Create:** `app/(tabs)/profile.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSheep } from '@/hooks/useSheep';
import { useWool } from '@/hooks/useWool';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { sheepCount, getTotalWoolRate } = useSheep();
  const { balance } = useWool();

  if (!user) {
    return <Text>Please login</Text>;
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        {user.email && <Text style={styles.email}>{user.email}</Text>}
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Stats</Text>
        <InfoRow label="Farm Name" value={user.farm_name} />
        <InfoRow label="Total Sheep" value={sheepCount.toString()} />
        <InfoRow label="Wool Balance" value={balance.toLocaleString()} />
        <InfoRow label="Wool Generation" value={`${getTotalWoolRate()}/hour`} />
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep Settings</Text>
        <InfoRow label="Sleep Goal" value={`${user.sleep_goal_hours} hours`} />
        <InfoRow label="Timezone" value={user.timezone} />
        {user.target_bedtime && (
          <InfoRow label="Target Bedtime" value={user.target_bedtime} />
        )}
        {user.target_wake_time && (
          <InfoRow label="Target Wake Time" value={user.target_wake_time} />
        )}
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <InfoRow
          label="Member Since"
          value={new Date(user.created_at).toLocaleDateString()}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
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
  container: { flex: 1, backgroundColor: '#f8f9ff' },
  header: { alignItems: 'center', padding: 40, backgroundColor: 'white' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666', marginTop: 4 },
  section: { backgroundColor: 'white', marginTop: 20, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  logoutButton: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
```

---

## Example 4: Protected Route Wrapper

**Create:** `components/auth/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={styles.subtitle}>Please login to access this feature</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9ff',
  },
  loadingText: { fontSize: 18, color: '#666' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
```

**Usage:**
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyProtectedScreen() {
  return (
    <ProtectedRoute>
      <YourActualScreen />
    </ProtectedRoute>
  );
}
```

---

## Example 5: Integrate into Existing Index Screen

**Update:** `app/(tabs)/index.tsx`

```typescript
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSleep } from '@/hooks/useSleep';
import { WoolBalance } from '@/components/wool/WoolBalance';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeSession, isActive } = useSleep();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🐑 Sheepify</Text>
      <Text style={styles.subtitle}>Sleep Well, Earn Sheep</Text>

      {user ? (
        <>
          <WoolBalance />

          {/* Active Sleep Indicator */}
          {isActive && (
            <View style={styles.activeCard}>
              <Text style={styles.activeText}>😴 Currently Sleeping...</Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => router.push('/sleep-log')}
              >
                <Text style={styles.viewButtonText}>View Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.actions}>
            <ActionButton
              icon="😴"
              label="Track Sleep"
              onPress={() => router.push('/sleep-log')}
            />
            <ActionButton
              icon="🐑"
              label="My Farm"
              onPress={() => router.push('/farm')}
            />
          </View>
        </>
      ) : (
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>Welcome! Please login to get started.</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.authButtonText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function ActionButton({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginTop: 60 },
  subtitle: {
    fontSize: 18,
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 30,
  },
  activeCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  activeText: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  viewButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  viewButtonText: { color: 'white', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: { fontSize: 40, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  authPrompt: { alignItems: 'center', marginTop: 40 },
  authText: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  authButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  authButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
```

---

## Tips

1. **Gradual Migration**: You can keep existing screens and gradually replace mock data with real API calls
2. **Loading States**: Always show loading indicators while fetching data
3. **Error Handling**: Display user-friendly error messages
4. **Refresh Control**: Add pull-to-refresh to all list views
5. **Protected Routes**: Use ProtectedRoute wrapper for authenticated-only screens

---

These examples show how to seamlessly integrate the new backend-connected components into your existing app structure!
