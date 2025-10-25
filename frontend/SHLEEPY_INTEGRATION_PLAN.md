# Shleepy (Claude LLM) Integration Plan

## Overview
Integrate Claude AI as "Shleepy" - an interactive sheep mascot that:
- Sends affirmative messages/sheep pickup lines for good sleep (8-10 hours)
- Roasts users with sheep puns for poor sleep (<8 hours)
- Generates surreal dream snippets for morning summaries

## What You Need to Provide

### Required
1. **Anthropic API Key** - Get from https://console.anthropic.com/
   - Navigate to API Keys section
   - Create new key with appropriate permissions
   - Format: `sk-ant-api03-...`

### Model Selection
- **Using: Claude Haiku 4** (`claude-haiku-4-20250514`)
  - Fast response times (~1-2 seconds)
  - Very cost-effective (~$0.001 per message)
  - Perfect for quick, witty responses and puns
  - Estimated cost: <$0.50/month for typical usage

## Architecture

### New Files to Create
```
/services
  /ai
    - claudeService.ts (API client for Claude)
    - shleepyPrompts.ts (prompt templates)

/hooks
  - useShleepy.ts (hook for Shleepy interactions)

/components
  - ShleepyMessage.tsx (message bubble UI)
  - DreamPopup.tsx (morning dream modal)

/types
  - shleepy.ts (Shleepy message types)

/store
  - shleepyStore.ts (message history persistence)
```

### Files to Update
- `app/(tabs)/index.tsx` - Add Shleepy message display on home screen
- `app/sleep-log.tsx` - Add Shleepy response after logging sleep
- `types/game.ts` - Add dream field to SleepSession
- `store/gameStore.ts` - Store dreams with sleep sessions

## Implementation Details

### 1. Claude Service (`services/ai/claudeService.ts`)

**Technology**: Anthropic SDK for React Native
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
});
```

**Functions to implement**:
- `generateSleepMessage(quality, streak, hours)` - contextual sleep feedback
- `generateDream(sleepQuality)` - surreal dream snippet
- `generatePickupLine()` - sheep-themed pickup lines
- `generateRoast(hours, streak)` - sheep pun roasts

### 2. Message Types & Examples

#### Good Sleep (8-10 hours)
**Style**: Affirmative + sheep pickup lines
**Examples**:
- "Ewe nailed it! 9 hours of sleep? You're un-BAAAA-lievable! 💕"
- "Are you a pillow? Because I want to rest my head on ewe all night! 😴✨"
- "8.5 hours! You're shear-ly amazing! Keep up the flock-tastic work! 🐑"

#### Bad Sleep (<8 hours)
**Style**: Roasts with sheep puns
**Examples**:
- "5 hours? That's just SHEEP-ish behavior. Even my wool is disappointed 😴"
- "3 hours? You're really RAMMING your health into the ground here 🙄"
- "6.5 hours? You call that sleep? I've seen lambs nap longer than that! 🐏"

#### Dreams (for good sleep only)
**Style**: Surreal, absurd, dreamlike
**Examples**:
- "You chased a golden sheep into a void of cotton candy. The moon tasted like marshmallows."
- "A flock of neon sheep sang you lullabies in a language made of starlight and whispers."
- "You floated through clouds made of wool while counting backwards from infinity."

### 3. UI Components

#### ShleepyMessage Component
```
┌─────────────────────────────┐
│  🐑 Shleepy says:           │
│  ┌─────────────────────┐   │
│  │ Ewe nailed it! 9hrs │   │
│  │ You're un-BAAAA-    │   │
│  │ lievable! 💕        │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```
- Speech bubble design
- Animated entrance (slide/fade in)
- Shleepy emoji/avatar
- Auto-dismiss after 5 seconds (or tap to dismiss)

#### DreamPopup Component
```
┌─────────────────────────────┐
│    ✨ Your Dream ✨         │
│                             │
│  You chased a golden sheep  │
│  into a void of cotton      │
│  candy. The moon tasted     │
│  like marshmallows.         │
│                             │
│     [Sweet Dreams 🌙]       │
└─────────────────────────────┘
```
- Modal overlay
- Appears after logging good sleep
- Ethereal/dreamy styling
- Can be saved to dream journal

### 4. Data Flow

```
User logs sleep
    ↓
addSleepSession() called
    ↓
Calculate sleep quality
    ↓
useShleepy.generateResponse(session)
    ↓
Claude API call (Haiku model)
    ↓
Receive Shleepy message
    ↓
Display in UI (ShleepyMessage component)
    ↓
If good sleep → Also generate dream
    ↓
Show DreamPopup
    ↓
Store message + dream in history
```

### 5. Environment Setup

**Create `.env` file in project root:**
```env
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Update `app.json`:**
```json
{
  "expo": {
    "extra": {
      "anthropicApiKey": process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
    }
  }
}
```

**Install dependencies:**
```bash
npm install @anthropic-ai/sdk
```

### 6. Shleepy Personality System

**Core Personality Traits:**
- Witty and punny
- Supportive but sassy
- Sheep-obsessed (everything relates to sheep)
- Escalates roasts for repeated bad behavior
- Celebrates streaks enthusiastically

**Context Awareness:**
Shleepy considers:
- Current sleep duration
- Sleep streak
- Penalty warnings
- Time since last good sleep
- Total sheep count

**Example contextual messages:**
- First bad night: Gentle roast
- Third bad night (penalty): Harsh roast + warning
- 10-night streak: Extra enthusiastic praise
- After penalty recovery: Encouraging message

## Feature Breakdown

### Phase 1: Basic Shleepy Messages ⭐ (Start here)
**Files to create:**
- `services/ai/claudeService.ts`
- `services/ai/shleepyPrompts.ts`
- `types/shleepy.ts`

**Features:**
- Claude API integration
- Generate sleep feedback messages
- Display in sleep log screen
- Basic error handling

**Test:** Log sleep → See Shleepy message

---

### Phase 2: Dream Generation
**Files to create:**
- `components/DreamPopup.tsx`
- `store/shleepyStore.ts`

**Files to update:**
- `types/game.ts` (add dream field)
- `store/gameStore.ts` (store dreams)
- `app/sleep-log.tsx` (show dream popup)

**Features:**
- Generate surreal dream snippets
- Show modal after good sleep
- Store dreams with sleep sessions
- Dream history view

**Test:** Log good sleep → See dream popup

---

### Phase 3: Home Screen Integration
**Files to create:**
- `components/ShleepyMessage.tsx`
- `hooks/useShleepy.ts`

**Files to update:**
- `app/(tabs)/index.tsx`

**Features:**
- Daily Shleepy greeting on home screen
- Context-aware messages (streak, penalties)
- Animated message bubble
- Persistent message until dismissed

**Test:** Open app → See Shleepy greeting

---

### Phase 4: Advanced Features (Future)
- Personality evolution (Shleepy gets sassier over time)
- Custom roast escalation
- Dream journal screen
- Shleepy achievements
- Text-to-speech (Shleepy voice)
- Random mid-day motivational messages

## Type Definitions

```typescript
// types/shleepy.ts

export interface ShleepyMessage {
  id: string;
  content: string;
  type: 'affirmation' | 'roast' | 'pickup-line' | 'dream' | 'general';
  timestamp: Date;
  sleepSessionId?: string;
}

export interface ShleepyContext {
  sleepDuration: number;
  sleepQuality: 'poor' | 'good' | 'perfect';
  streak: number;
  penaltyWarning: number;
  totalSheep: number;
  lastSleepDate: Date | null;
}

export interface DreamSnippet {
  id: string;
  content: string;
  sleepDate: Date;
  sleepDuration: number;
}
```

## Prompt Engineering Strategy

### System Prompt (Shleepy's Persona)
```
You are Shleepy, a witty and sassy sheep mascot for a sleep-tracking app.
Your job is to encourage good sleep habits through humor, puns, and sheep-related wordplay.

Personality:
- Obsessed with sheep and wool
- Every response must include sheep puns
- Supportive but sarcastic
- Gets sassier when users have bad sleep
- Enthusiastic about good sleep habits

Rules:
- Keep responses under 50 words
- Always include at least one sheep pun
- Use emojis (🐑 😴 💤 🌙 ✨)
- Be family-friendly
```

### Message Prompts
**Good Sleep:**
```
Generate an affirmative message for someone who slept ${hours} hours.
Include a sheep-themed pickup line.
Be enthusiastic and punny.
```

**Bad Sleep:**
```
Generate a roast for someone who only slept ${hours} hours.
Use sheep puns to mock their poor sleep.
Be sassy but not mean-spirited.
${streak === 0 ? 'Their streak is broken - roast them harder.' : ''}
```

**Dream:**
```
Generate a surreal, dreamlike snippet (1-2 sentences).
Include sheep, wool, or sleep themes.
Make it absurd and whimsical.
```

## Error Handling & Fallbacks

### API Errors
```typescript
try {
  const message = await claudeService.generateMessage(context);
  return message;
} catch (error) {
  // Fallback to pre-written messages
  return getFallbackMessage(context.sleepQuality);
}
```

### Fallback Messages
Pre-written messages stored locally:
- Good sleep: 10 variations
- Bad sleep: 10 variations
- Dreams: 20 variations

**Fallback examples:**
- Good: "Ewe did it! Great sleep! 🐑"
- Bad: "Baaaad sleep. Do better! 😴"
- Dream: "Sheep jumped over the moon in your dreams."

### Offline Mode
- Queue API calls when offline
- Use fallback messages
- Retry when online
- Store pending messages

## Testing Checklist

- [ ] API key configured correctly
- [ ] Good sleep (8-10 hrs) → Affirmative message
- [ ] Good sleep → Dream popup appears
- [ ] Bad sleep (<6 hrs) → Roast message
- [ ] Medium sleep (6-8 hrs) → Encouraging message
- [ ] Streak context reflected in messages
- [ ] Penalty context reflected in roasts
- [ ] API error → Fallback message shown
- [ ] Offline → Fallback message used
- [ ] Messages stored in history
- [ ] Dreams stored with sessions

## Cost Analysis

### Claude Haiku Pricing (as of 2025)
- Input: $0.80 per MTok
- Output: $4.00 per MTok

### Expected Usage per Message
- Input: ~200 tokens (context + prompt)
- Output: ~100 tokens (message)
- Cost per message: ~$0.0006

### Monthly Estimate
- 2 messages/day (sleep log + morning)
- 60 messages/month
- **Total: ~$0.036/month** (essentially free)

### Annual Estimate
- 720 messages/year
- **Total: ~$0.43/year**

## Privacy & Security

### API Key Security
- Store in environment variables (`.env`)
- Never commit to git (add to `.gitignore`)
- Use Expo SecureStore for production

### Data Privacy
- All API calls are user-initiated
- No personal data sent to Claude except sleep metrics
- Messages stored locally on device
- No user data sharing

### Rate Limiting
- Max 5 requests per minute
- Implement exponential backoff
- Cache recent messages

## Next Steps to Start Implementation

1. **Get API Key** - Visit https://console.anthropic.com/
2. **Create `.env` file** - Add API key
3. **Install dependencies** - `npm install @anthropic-ai/sdk`
4. **Create feature branch** - `git checkout -b feature/shleepy-integration`
5. **Start with Phase 1** - Basic Claude service + messages
6. **Test thoroughly** - Verify messages appear correctly
7. **Iterate** - Add dreams, home screen, advanced features
