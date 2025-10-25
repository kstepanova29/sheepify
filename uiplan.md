# Sheepify Production UI Implementation Plan

## Design Overview

Based on the hand-drawn wireframes (`uides1.png` and `uides2.png`), we're implementing a 2-screen paginated mobile experience for Sheepify.

### Design Requirements
- **Navigation**: Horizontal paging (not smooth scroll) - swipe left/right between screens
- **Screen 1**: Farm view with sheep, grass, currency display
- **Screen 2**: Stats view with Shleepy character and sleep tracking
- **Asset Strategy**: Sprite-based design for easy PNG/JPG replacement

---

## Screen Breakdown

### Screen 1: Farm View

#### Layout Structure
```
┌─────────────────────────────────┐
│  ╭─────────────────╮    ☀️     │
│  │  kevin's farm   │            │  <- Cloud-shaped header
│  ╰─────────────────╯            │
│                                  │
│ ┌──┐  ┌────────────────────┐   │
│ │💰│  │                    │   │
│ │🧶│  │   Farm Scene       │   │  <- 3D-ish land block
│ │🏆│  │   🐑  🐑           │   │     with sheep sprites
│ └──┘  │      🌳  🐑        │   │
│       └────────────────────┘   │
└─────────────────────────────────┘
```

#### Components

**1. FarmHeader**
- Cloud-shaped container
- Farm name display (pulled from user state)
- Props: `farmName: string`
- Sprite: Cloud frame PNG (replaceable)

**2. SunIcon**
- Positioned top-right
- Optional: Slow rotation animation
- Sprite: Sun PNG (replaceable)

**3. CurrencyBar**
- Vertical left sidebar
- Display: Wool blocks, Shepherd tokens, Prank tokens
- Icons: Replaceable currency sprites
- Live updates from gameStore

**4. FarmScene**
- Main 3D-isometric style container
- Background: Grass texture (replaceable)
- Props: `sheep: Sheep[]`
- Handles sheep positioning

**5. SheepSprite**
- Individual animated sheep component
- States: Standing, Walking, Grazing
- Props: `position: {x, y}`, `isAlive: boolean`, `outfit?: string`
- Sprite: Sheep PNG with animation frames (replaceable)

**6. TreeSprite**
- Decorative landscape elements
- Random or fixed positioning
- Sprite: Tree PNG (replaceable)

---

### Screen 2: Stats/Sleep View

#### Layout Structure
```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │ Dynamic message based on  │  │ <- Changes with sleep quality
│  │ sleep quality/streak      │  │
│  └───────────────────────────┘  │
│                                  │
│         🐑                       │ <- Shleepy character
│        /│\                       │    (large, replaceable sprite)
│                                  │
│  ┌───────────────────────────┐  │
│  │  Sleep Streak: 5 🔥       │  │
│  │  Wool Blocks: 23 🧶       │  │ <- Stats card
│  │  Shepherd Tokens: 2 🏆    │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │     💤 Log Sleep          │  │ <- Same as current impl
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### Components

**1. DynamicHeader**
- Text changes based on:
  - Sleep streak (high/low)
  - Last sleep quality (perfect/good/poor)
  - Penalty status
- Examples:
  - "Great job! 5 nights in a row! 🌟"
  - "Time to catch up on sleep! 😴"
  - "Perfect sleep! Keep it up! ✨"
- Props: `user: User`, `lastSession?: SleepSession`

**2. ShleepyCharacter**
- Large central sheep mascot
- Mood changes based on user streak:
  - Happy (streak >= 3)
  - Neutral (streak 1-2)
  - Sleepy (streak 0 or in penalty)
- Sprite: Shleepy PNG with different expressions (replaceable)
- Props: `mood: 'happy' | 'neutral' | 'sleepy'`

**3. StatsCard**
- Display key metrics:
  - Sleep streak with fire emoji
  - Wool blocks with wool emoji
  - Shepherd tokens with trophy emoji
- Props: `user: User`
- Style: Bordered card with rounded corners

**4. LogSleepButton**
- Re-use existing sleep-log navigation
- Large, prominent button
- Same implementation as current design
- Props: `onPress: () => void`

---

## Technical Architecture

### 1. Paginated Container

Replace `ScrollView` with horizontal paginated `FlatList`:

```typescript
<FlatList
  horizontal
  pagingEnabled
  data={[{ key: 'farm' }, { key: 'stats' }]}
  renderItem={({ item }) =>
    item.key === 'farm' ? <FarmScreen /> : <StatsScreen />
  }
  showsHorizontalScrollIndicator={false}
  snapToAlignment="center"
  decelerationRate="fast"
/>
```

**Features:**
- Smooth page snapping
- No over-scroll
- Page indicator dots (optional)

### 2. Asset Management

**Directory Structure:**
```
assets/
├── sprites/
│   ├── sheep/
│   │   ├── default.png
│   │   ├── walking-1.png
│   │   ├── walking-2.png
│   │   └── grazing.png
│   ├── farm/
│   │   ├── cloud-frame.png
│   │   ├── sun.png
│   │   ├── tree.png
│   │   └── grass-texture.png
│   ├── shleepy/
│   │   ├── happy.png
│   │   ├── neutral.png
│   │   └── sleepy.png
│   └── currency/
│       ├── wool.png
│       ├── token-shepherd.png
│       └── token-prank.png
```

**Configuration File** (`constants/sprites.ts`):
```typescript
export const SPRITES = {
  farm: {
    cloud: require('@/assets/sprites/farm/cloud-frame.png'),
    sun: require('@/assets/sprites/farm/sun.png'),
    tree: require('@/assets/sprites/farm/tree.png'),
    grass: require('@/assets/sprites/farm/grass-texture.png'),
  },
  sheep: {
    default: require('@/assets/sprites/sheep/default.png'),
    walking: [
      require('@/assets/sprites/sheep/walking-1.png'),
      require('@/assets/sprites/sheep/walking-2.png'),
    ],
    grazing: require('@/assets/sprites/sheep/grazing.png'),
  },
  // ... etc
};
```

**Benefits:**
- Single source of truth for all sprites
- Easy to swap sprites by replacing files
- Supports both PNG and JPG
- Type-safe with TypeScript

### 3. Component Structure

```
components/
├── farm/
│   ├── FarmHeader.tsx
│   ├── CurrencyBar.tsx
│   ├── FarmScene.tsx
│   ├── SheepSprite.tsx
│   ├── TreeSprite.tsx
│   └── SunIcon.tsx
├── stats/
│   ├── DynamicHeader.tsx
│   ├── ShleepyCharacter.tsx
│   ├── StatsCard.tsx
│   └── LogSleepButton.tsx
└── shared/
    └── PageIndicator.tsx
```

---

## Implementation Steps

### Phase 1: Setup (Foundation)
1. ✅ Create feature branch (`feature/production-ui`)
2. ⏳ Create asset directory structure
3. ⏳ Create sprite configuration file
4. ⏳ Create placeholder sprite images (simple colored rectangles for testing)

### Phase 2: Container & Navigation
1. ⏳ Modify `app/(tabs)/index.tsx` to use FlatList pagination
2. ⏳ Create basic FarmScreen and StatsScreen containers
3. ⏳ Add page indicator dots
4. ⏳ Test swipe navigation

### Phase 3: Screen 1 - Farm View
1. ⏳ Implement FarmHeader with cloud shape
2. ⏳ Implement SunIcon with rotation animation
3. ⏳ Implement CurrencyBar with live data
4. ⏳ Implement FarmScene container with 3D perspective
5. ⏳ Implement SheepSprite with walk animations
6. ⏳ Add TreeSprite decorations
7. ⏳ Connect to gameStore for sheep data

### Phase 4: Screen 2 - Stats View
1. ⏳ Implement DynamicHeader with conditional messages
2. ⏳ Implement ShleepyCharacter with mood states
3. ⏳ Implement StatsCard with user data
4. ⏳ Integrate existing LogSleepButton functionality
5. ⏳ Connect to gameStore for user stats

### Phase 5: Polish & Testing
1. ⏳ Add animations (sheep walking, sun rotation)
2. ⏳ Test on device via ngrok tunnel
3. ⏳ Optimize performance (memoization, lazy loading)
4. ⏳ Add haptic feedback for page changes
5. ⏳ Final design polish

### Phase 6: Sprite Integration
1. ⏳ Replace placeholder sprites with actual designs
2. ⏳ Test all sprite replacements
3. ⏳ Document sprite replacement process for team

---

## Animation Plan

### Sheep Walking Animation
- Use `Animated.timing()` to interpolate between walking frames
- Loop infinitely when sheep is in "walking" state
- Frame duration: ~200ms per frame

### Sun Rotation
- Slow continuous rotation using `Animated.loop()`
- Full rotation every 30 seconds
- Optional: brightness pulse effect

### Page Transitions
- Use FlatList's built-in momentum scroll
- Optional: Add fade effect on page change

---

## Data Integration

### gameStore Connection
```typescript
const { user, sheep } = useGameStore();

// Screen 1: Farm View
- Display user.woolBlocks, user.shepherdTokens, user.prankTokens
- Map over user.sheep to render SheepSprites
- Filter by isAlive status

// Screen 2: Stats View
- Display user.streak
- Display user.woolBlocks, user.shepherdTokens
- Calculate message based on streak and penalties
- Use existing sleep-log navigation
```

---

## Sprite Replacement Guide

To replace any sprite in the future:

1. **Prepare your sprite**:
   - Format: PNG (transparent) or JPG
   - Size: Match original placeholder dimensions
   - Name: Same as original file

2. **Replace the file**:
   - Navigate to `assets/sprites/[category]/`
   - Replace the PNG/JPG file
   - Keep the exact same filename

3. **Restart Metro bundler**:
   ```bash
   npx expo start --clear
   ```

4. **Changes apply automatically** - no code changes needed!

---

## Design Tokens

### Colors
- Background: `#1a1a2e` (dark blue-black)
- Card backgrounds: `#16213e`, `#0f3460`
- Text primary: `#fff`
- Text secondary: `#a8a8d1`
- Accent: `#e94560` (pink-red)
- Success: `#6bcf7f` (green)
- Warning: `#ff6b6b` (red)
- Gold: `#ffd93d` (yellow)

### Typography
- Title: 48px, bold
- Subtitle: 16px
- Body: 14-16px
- Buttons: 18px, bold

### Spacing
- Page padding: 20px
- Card padding: 20-30px
- Element gap: 12-20px

---

## Testing Checklist

- [ ] Swipe navigation works smoothly
- [ ] Sheep sprites render correctly
- [ ] Currency updates in real-time
- [ ] Stats screen shows correct data
- [ ] Log Sleep button navigates properly
- [ ] Dynamic header updates based on streak
- [ ] Shleepy character changes mood
- [ ] Animations run without lag
- [ ] Works on both iOS simulators and physical devices
- [ ] Sprite replacement works (test with dummy replacement)

---

## Future Enhancements

- Tap sheep to interact (feed, pet, etc.)
- Drag to reposition sheep on farm
- Weather effects (rain, snow on farm)
- Day/night cycle
- Sheep outfits from gameRules.ts
- Sound effects (sheep baa, walking on grass)
- Multiplayer farm visiting
