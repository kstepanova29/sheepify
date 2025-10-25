# Sheepify Frontend - Quick Reference Card

## 🚀 Getting Started

```bash
# Backend (Terminal 1)
cd src/backend
python run.py

# Frontend (Terminal 2)
cd src/frontend
npm install
npm start
```

---

## 🔑 Authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, login, register, logout } = useAuth();

// Register
await register({
  username: 'john',
  password: 'secret',
  email: 'john@example.com',
  farm_name: 'John\'s Farm'
});

// Login
await login({ username: 'john', password: 'secret' });

// Logout
await logout();
```

---

## 😴 Sleep Tracking

```typescript
import { useSleep } from '@/hooks/useSleep';

const { activeSession, startSession, completeSession, isActive } = useSleep();

// Start sleep
await startSession();

// Complete sleep
const result = await completeSession();
// result = { quality_score, wool_earned, new_sheep_awarded }
```

---

## 🐑 Sheep Management

```typescript
import { useSheep } from '@/hooks/useSheep';

const { sheep, renameSheep, toggleFavorite, getTotalWoolRate } = useSheep();

// Rename
await renameSheep(sheepId, 'Fluffy');

// Toggle favorite
await toggleFavorite(sheepId, true);

// Get total wool generation
const rate = getTotalWoolRate(); // wool per hour
```

---

## 🧶 Wool Economy

```typescript
import { useWool } from '@/hooks/useWool';

const { balance, generationRate, collectWool, purchase } = useWool();

// Collect wool
const amount = await collectWool();

// Purchase
await purchase(itemId, cost);

// Check affordability
if (canAfford(100)) {
  // User has >= 100 wool
}
```

---

## 📦 Ready-Made Components

```typescript
// Drop these into any screen:
import { SleepTracker } from '@/components/sleep/SleepTracker';
import { SleepStats } from '@/components/sleep/SleepStats';
import { SheepList } from '@/components/sheep/SheepList';
import { WoolBalance } from '@/components/wool/WoolBalance';

// Usage:
<SleepTracker />  // Full sleep tracking UI
<SleepStats />    // Weekly statistics
<SheepList />     // All sheep with rename/favorite
<WoolBalance />   // Balance + collect button
```

---

## 🎨 Component Example

```typescript
import React from 'react';
import { ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { SleepTracker } from '@/components/sleep/SleepTracker';
import { WoolBalance } from '@/components/wool/WoolBalance';
import { SheepList } from '@/components/sheep/SheepList';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Text>Please login</Text>;
  }

  return (
    <ScrollView>
      <WoolBalance />
      <SleepTracker />
      <SheepList />
    </ScrollView>
  );
}
```

---

## 🌐 API Endpoints Used

| Service | Endpoint | Method |
|---------|----------|--------|
| **Auth** | `/auth/register` | POST |
| | `/auth/login` | POST |
| | `/auth/user/{id}` | GET |
| **Sleep** | `/sleep/start?user_id=` | POST |
| | `/sleep/complete` | POST |
| | `/sleep/active/{user_id}` | GET |
| | `/sleep/sessions/{user_id}` | GET |
| | `/sleep/stats/weekly/{user_id}` | GET |
| **Sheep** | `/sheep/user/{user_id}` | GET |
| | `/sheep/{id}?user_id=` | PATCH |
| **Wool** | `/wool/balance/{user_id}` | GET |
| | `/wool/collect/{user_id}` | POST |
| | `/wool/transactions/{user_id}` | GET |

---

## 🐛 Debugging

### Check Auth State
```typescript
const { user } = useAuth();
console.log('User:', user);
console.log('User ID:', user?.id);
```

### Check API Connection
```typescript
// In services/api.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Physical device: Use your computer's IP
// const API_BASE_URL = 'http://192.168.1.100:8000/api/v1';

// Android emulator:
// const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';
```

### Common Errors

**"User not authenticated"**
- Check if user is logged in: `const { user } = useAuth()`
- Verify AsyncStorage has user ID

**"Network request failed"**
- Backend not running? Check `python run.py`
- Wrong API_BASE_URL? Check IP address
- CORS issue? Backend allows all origins

**"No active session"**
- Check `activeSession` from useSleep
- Only one active session allowed per user

---

## 📊 Data Models

### User
```typescript
{
  id: string
  username: string
  email?: string
  farm_name: string
  wool_balance: number
  sleep_goal_hours: number
  timezone: string
  created_at: string
  updated_at: string
}
```

### Sheep
```typescript
{
  id: string
  user_id: string
  sheep_type_id: 'starter' | 'merino' | 'suffolk' | 'cotswold' | 'golden'
  custom_name: string
  level: number
  experience: number
  current_wool_rate: number  // per hour
  is_favorite: boolean
  total_wool_generated: number
  date_acquired: string
}
```

### Sleep Session
```typescript
{
  id: string
  user_id: string
  start_time: string
  end_time?: string
  duration_hours?: number
  quality_score?: number  // 0-100
  reward_wool: number
  status: 'active' | 'completed' | 'cancelled'
}
```

---

## 🎯 Quality Score Breakdown

Backend calculates quality based on:
- **Duration (40 pts)**: 8-10 hours = max
- **Timing (30 pts)**: Bedtime 21:00-23:00 = max
- **Consistency (30 pts)**: Based on last 7 days

---

## 🏆 Sheep Rewards

- 10% chance if quality >= 70
- Rarity based on quality:
  - `>= 95`: Golden (50 wool/hr)
  - `>= 90`: Cotswold (20 wool/hr)
  - `>= 85`: Suffolk (15 wool/hr)
  - `< 85`: Merino (10 wool/hr)

---

## 🔥 Tips

1. **Auto-refresh**: WoolBalance refreshes every 30s
2. **Persistence**: Auth state saved in AsyncStorage
3. **Error handling**: All hooks expose `error` state
4. **Loading states**: All hooks expose `loading` state
5. **Type safety**: All responses are typed

---

## 📝 Quick Checklist

- [ ] Backend running on port 8000
- [ ] Frontend started with `npm start`
- [ ] API_BASE_URL configured correctly
- [ ] User registered/logged in
- [ ] Sleep session started
- [ ] Sleep session completed
- [ ] Sheep displayed
- [ ] Wool collected

---

## 📚 Full Docs

See [INTEGRATION.md](./INTEGRATION.md) for complete documentation.
