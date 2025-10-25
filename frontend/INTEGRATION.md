# Frontend-Backend Integration Guide

This document explains how the Sheepify frontend integrates with the backend API.

## Overview

The frontend now has full integration with the FastAPI backend, including:
- Authentication (login/register)
- Sleep tracking with quality scoring
- Sheep management
- Wool economy system
- Real-time data synchronization

## Architecture

### Service Layer (`services/`)

All API communication is handled through dedicated service modules:

#### **API Client** (`services/api.ts`)
- Base HTTP client with fetch API
- Automatic JSON parsing
- Error handling
- User ID persistence in AsyncStorage
- Configurable base URL (dev vs production)

#### **Auth Service** (`services/authService.ts`)
```typescript
import { authService } from '@/services/authService';

// Register new user
await authService.register({
  username: 'john',
  password: 'secret123',
  email: 'john@example.com',
  farm_name: 'John\'s Farm',
  sleep_goal_hours: 8
});

// Login
await authService.login({
  username: 'john',
  password: 'secret123'
});

// Get profile
const user = await authService.getProfile(userId);

// Logout
await authService.logout();
```

#### **Sleep Service** (`services/sleepService.ts`)
```typescript
import { sleepService } from '@/services/sleepService';

// Start sleep session
const session = await sleepService.startSession(userId, {
  planned_wake_time: new Date().toISOString()
});

// Complete session
const result = await sleepService.completeSession({
  session_id: sessionId,
  notes: 'Great sleep!'
});
// Returns: quality_score, wool_earned, new_sheep_awarded (if any)

// Get active session
const active = await sleepService.getActiveSession(userId);

// Get session history
const sessions = await sleepService.getSessions(userId, 10, 0);

// Get weekly stats
const stats = await sleepService.getWeeklyStats(userId);
```

#### **Sheep Service** (`services/sheepService.ts`)
```typescript
import { sheepService } from '@/services/sheepService';

// Get all user's sheep
const sheep = await sheepService.getUserSheep(userId);

// Get specific sheep
const oneSheep = await sheepService.getSheep(sheepId);

// Rename sheep
await sheepService.renameSheep(sheepId, userId, 'Fluffy');

// Toggle favorite
await sheepService.toggleFavorite(sheepId, userId, true);
```

#### **Wool Service** (`services/woolService.ts`)
```typescript
import { woolService } from '@/services/woolService';

// Get balance and generation rate
const balance = await woolService.getBalance(userId);
// Returns: wool_balance, generation_rate_per_hour

// Manually collect wool
const result = await woolService.collectWool(userId);
// Returns: wool_collected, new_balance, sheep_count

// Get transaction history
const transactions = await woolService.getTransactions(userId, 20, 0);

// Purchase item
await woolService.purchase(userId, itemId, amount);
```

---

## Context & State Management

### **AuthContext** (`contexts/AuthContext.tsx`)

Provides global authentication state:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const {
    user,          // Current user object (null if not logged in)
    loading,       // Loading state for auth operations
    error,         // Error message (null if no error)
    login,         // Login function
    register,      // Register function
    logout,        // Logout function
    refreshUser,   // Refresh user data from backend
    clearError,    // Clear error message
  } = useAuth();

  // User object structure:
  // {
  //   id, username, email, farm_name,
  //   wool_balance, sleep_goal_hours,
  //   target_bedtime, target_wake_time,
  //   timezone, created_at, updated_at
  // }
}
```

---

## Custom Hooks

### **useSleep** (`hooks/useSleep.ts`)

```typescript
import { useSleep } from '@/hooks/useSleep';

function SleepComponent() {
  const {
    activeSession,      // Current active sleep session (null if none)
    sessions,           // Session history array
    stats,              // Weekly stats object
    loading,            // Loading state
    error,              // Error message
    startSession,       // Start new session
    completeSession,    // Complete active session
    loadSessions,       // Reload session history
    loadStats,          // Reload stats
    calculateDuration,  // Calculate elapsed time for active session
    isActive,           // Boolean: is session active?
  } = useSleep();

  const handleStart = async () => {
    const session = await startSession(plannedWakeTime);
    console.log('Started:', session.id);
  };

  const handleComplete = async () => {
    const result = await completeSession('Slept great!');
    console.log('Quality:', result.quality_score);
    console.log('Wool earned:', result.wool_earned);
    if (result.new_sheep_awarded) {
      console.log('New sheep!', result.new_sheep_awarded.custom_name);
    }
  };
}
```

### **useSheep** (`hooks/useSheep.ts`)

```typescript
import { useSheep } from '@/hooks/useSheep';

function SheepComponent() {
  const {
    sheep,              // Array of all user's sheep
    loading,            // Loading state
    error,              // Error message
    loadSheep,          // Reload sheep data
    renameSheep,        // Rename a sheep
    toggleFavorite,     // Toggle favorite status
    getSheepById,       // Get sheep by ID
    getFavoriteSheep,   // Get all favorite sheep
    getTotalWoolRate,   // Calculate total wool generation rate
    sheepCount,         // Total number of sheep
  } = useSheep();

  // Sheep object structure:
  // {
  //   id, user_id, sheep_type_id, custom_name,
  //   level, experience, wool_rate_modifier,
  //   date_acquired, is_favorite,
  //   total_wool_generated, current_wool_rate
  // }
}
```

### **useWool** (`hooks/useWool.ts`)

```typescript
import { useWool } from '@/hooks/useWool';

function WoolComponent() {
  const {
    balance,            // Current wool balance (number)
    generationRate,     // Wool per hour (number)
    transactions,       // Transaction history array
    loading,            // Loading state
    error,              // Error message
    loadBalance,        // Reload balance (called automatically every 30s)
    loadTransactions,   // Load transaction history
    collectWool,        // Manually collect wool from sheep
    purchase,           // Purchase item with wool
    canAfford,          // Check if user can afford amount
  } = useWool();

  const handleCollect = async () => {
    const collected = await collectWool();
    console.log('Collected:', collected, 'wool');
  };
}
```

---

## React Components

### **Authentication Screens**

#### Login Screen (`app/auth/login.tsx`)
- Username and password inputs
- Login button with loading state
- Error display
- Link to registration
- Auto-navigates to main app on success

#### Register Screen (`app/auth/register.tsx`)
- Username, password, email, farm name inputs
- Validation (password min 6 chars)
- Creates account with default sleep goal (8 hours)
- Auto-navigates to main app on success
- Automatically awards starter sheep via backend

### **Sleep Components**

#### SleepTracker (`components/sleep/SleepTracker.tsx`)
Standalone sleep tracking component:
- Start/stop sleep sessions
- Real-time elapsed time display
- Quality score and wool earnings on completion
- New sheep notification

#### SleepStats (`components/sleep/SleepStats.tsx`)
Weekly statistics dashboard:
- Total sessions, avg duration, avg quality
- Total wool earned, best quality score
- Recent sessions list with details
- Auto-refreshes when mounted

#### Updated Sleep Log Screen (`app/sleep-log.tsx`)
Integrated with backend:
- Uses `useAuth` and `useSleep` hooks
- Displays user's sleep goal and wool balance
- Shows quality score and wool earned on completion
- Displays new sheep awards

### **Sheep Components**

#### SheepList (`components/sheep/SheepList.tsx`)
Displays all user's sheep:
- Cards with sheep emoji (based on type)
- Name, type, level, wool rate, total generated
- Favorite toggle (star icon)
- Rename button (via Alert.prompt)
- Color-coded by rarity (starter=gray, merino=blue, golden=gold)
- Auto-loads on mount
- Empty state for new users

### **Wool Components**

#### WoolBalance (`components/wool/WoolBalance.tsx`)
Wool economy widget:
- Current balance display
- Generation rate per hour
- Manual "Collect Wool" button
- Loading states
- Auto-refreshes every 30 seconds

---

## Data Flow

### Authentication Flow
```
User → Login Screen
  ↓
authService.login(credentials)
  ↓
API: POST /api/v1/auth/login
  ↓
Store user ID in AsyncStorage
  ↓
AuthContext updates user state
  ↓
Navigate to main app
```

### Sleep Session Flow
```
User → Click "Start Sleep"
  ↓
sleepService.startSession(userId)
  ↓
API: POST /api/v1/sleep/start?user_id=...
  ↓
Backend creates session, returns session object
  ↓
useSleep updates activeSession state
  ↓
Timer starts updating elapsed time
  ↓
User → Click "I Woke Up!"
  ↓
sleepService.completeSession(sessionId)
  ↓
API: POST /api/v1/sleep/complete
  ↓
Backend calculates:
  - Duration
  - Quality score (0-100)
  - Wool reward (50 * hours * quality)
  - Checks for new sheep award (10% chance if quality >= 70)
  ↓
Returns: quality_score, wool_earned, new_sheep_awarded
  ↓
Display results to user
```

### Wool Collection Flow
```
User → Click "Collect Wool"
  ↓
woolService.collectWool(userId)
  ↓
API: POST /api/v1/wool/collect/{userId}
  ↓
Backend:
  - Calculates time since last collection
  - Sums wool from all sheep (rate * hours)
  - Updates user's wool_balance
  - Creates transaction record
  ↓
Returns: wool_collected, new_balance, sheep_count
  ↓
useWool refreshes balance
  ↓
Display collection amount
```

---

## Environment Configuration

### Development Setup

**Backend URL** (in `services/api.ts`):
```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'  // Development
  : 'https://api.sheepify.com/api/v1';  // Production
```

### Testing on Physical Device

If testing on a physical device, replace `localhost` with your computer's IP:
```typescript
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:8000/api/v1'  // Replace with your IP
  : 'https://api.sheepify.com/api/v1';
```

### iOS Simulator
Use `localhost` - it works fine.

### Android Emulator
Use `10.0.2.2` instead of `localhost`:
```typescript
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000/api/v1'
  : 'https://api.sheepify.com/api/v1';
```

---

## Usage Examples

### Complete Sleep Tracking Example
```typescript
import React from 'react';
import { View, Button, Text } from 'react-native';
import { useSleep } from '@/hooks/useSleep';
import { useAuth } from '@/contexts/AuthContext';

export default function MySleepScreen() {
  const { user } = useAuth();
  const { activeSession, startSession, completeSession, isActive } = useSleep();

  if (!user) {
    return <Text>Please login</Text>;
  }

  return (
    <View>
      {isActive ? (
        <>
          <Text>Sleeping since: {activeSession.start_time}</Text>
          <Button
            title="Wake Up"
            onPress={async () => {
              const result = await completeSession();
              alert(`Quality: ${result.quality_score}, Wool: ${result.wool_earned}`);
            }}
          />
        </>
      ) : (
        <Button
          title="Start Sleep"
          onPress={() => startSession()}
        />
      )}
    </View>
  );
}
```

### Display Sheep Collection
```typescript
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSheep } from '@/hooks/useSheep';

export default function MySheepScreen() {
  const { sheep, loading } = useSheep();

  if (loading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={sheep}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.custom_name}</Text>
          <Text>Type: {item.sheep_type_id}</Text>
          <Text>Level: {item.level}</Text>
          <Text>Wool Rate: {item.current_wool_rate}/hr</Text>
        </View>
      )}
    />
  );
}
```

---

## Error Handling

All hooks and services include error handling:

```typescript
const { error } = useAuth();
const { error: sleepError } = useSleep();
const { error: sheepError } = useSheep();
const { error: woolError } = useWool();

// Display errors in UI
{error && <Text style={{ color: 'red' }}>{error}</Text>}
```

Services throw errors that can be caught:
```typescript
try {
  await sleepService.startSession(userId);
} catch (err) {
  console.error('Failed:', err.message);
  Alert.alert('Error', err.message);
}
```

---

## Backend Compatibility

All components are fully compatible with the existing FastAPI backend:

### Sheep Types
- `starter` - Default sheep (5 wool/hr)
- `merino` - Blue rarity (10 wool/hr)
- `suffolk` - Purple rarity (15 wool/hr)
- `cotswold` - Pink rarity (20 wool/hr)
- `golden` - Gold rarity (50 wool/hr)

### Quality Score Calculation
Backend uses:
- Duration score (40 pts): 8-10 hrs = max
- Timing score (30 pts): Best bedtime 21:00-23:00
- Consistency score (30 pts): Based on last 7 days' variance

### Wool Rewards
- Base: 50 wool per hour slept
- Multiplied by quality score (0-1.0)
- Example: 8 hours at 85% quality = 8 * 50 * 0.85 = 340 wool

### New Sheep Awards
- 10% chance if quality >= 70
- Rarity based on quality:
  - >= 95: Golden
  - >= 90: Cotswold
  - >= 85: Suffolk
  - < 85: Merino

---

## Next Steps

### Recommended Additions
1. **Profile screen** - Display user info, change farm name, sleep goal
2. **Leaderboard** - Show top users by streak/wool
3. **Shop screen** - Purchase items with wool
4. **Settings** - Update target bedtime/wake time
5. **Notifications** - Remind users to sleep, notify of wool collection

### Integration Points
The backend already has endpoints for:
- Updating user profile
- Deleting account
- Advanced sleep analytics
- Multiple sessions per day

All hooks and services can be easily extended to support these features.

---

## Troubleshooting

### "Network request failed"
- Check if backend is running (`python run.py`)
- Verify API_BASE_URL matches your setup
- Check firewall settings

### "User not authenticated"
- Make sure user is logged in via AuthContext
- Check AsyncStorage for USER_ID_KEY
- Verify token is being sent to backend

### "Failed to fetch"
- Backend might not be running
- CORS might be blocking requests (should be configured in backend)
- Check backend logs for errors

### Sleep session not starting
- Check backend logs
- Verify user_id is being passed correctly
- Ensure no active session already exists

---

## Testing Checklist

- [ ] Register new account
- [ ] Login with existing account
- [ ] Start sleep session
- [ ] Complete sleep session (< 8 hours)
- [ ] Complete sleep session (8-10 hours, should earn sheep)
- [ ] View sheep list
- [ ] Rename a sheep
- [ ] Toggle favorite on sheep
- [ ] View wool balance
- [ ] Collect wool manually
- [ ] View sleep statistics
- [ ] Logout and login again

---

This integration provides a complete, production-ready connection between the React Native frontend and FastAPI backend!
