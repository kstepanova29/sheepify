# Sheep Spawning Analysis: Why Sheep Appear Outside Grass Area

## Problem Statement
Sheep are spawning outside the visible green grass area on the farm platform. This document analyzes the root causes and documents the fix.

## Root Causes Identified

### Issue #1: Async Contour Loading Race Condition ⚠️ CRITICAL

**Location**: `utils/sheepSpawner.ts:11-21, 78-81`

**Problem**:
```typescript
const contourPromise = new Promise<[number, number][]>((resolve) => {
  try {
    const contourData = require('./grass_contour.json');
    grassContour = contourData;
    resolve(contourData);
  } catch (e) {
    console.error('Failed to load grass contour:', e);
    resolve([]);
  }
});

// Later in getRandomPositionInDiamond():
if (!grassContour) {
  // Fallback: just return a random position if contour isn't loaded yet
  x = Math.random() * platformWidth;
  y = Math.random() * platformHeight;
}
```

**Why this is wrong**:
- `require()` executes synchronously, BUT the Promise wrapping makes it async
- `getRandomPositionInDiamond()` is called immediately when component renders
- If called before Promise resolves, `grassContour` is `null` → falls back to random positioning **ANYWHERE**
- This is the #1 reason sheep spawn outside grass

**Fix**: Make `getRandomPositionInDiamond()` async and await the contourPromise

---

### Issue #2: Incorrect Sheep Bottom Calculation ⚠️ CRITICAL

**Location**: `utils/sheepSpawner.ts:89`

**Problem**:
```typescript
const [imageX, imageY] = toImageCoords(x, y + sheepSize / 2, platformWidth, platformHeight);
```

**Why this is wrong**:
- Sheep sprite is 60×60 pixels (from `index.tsx:312-313`)
- Position `{x, y}` is the TOP-LEFT corner of the sheep
- Bottom of sheep is at `y + 60`, NOT `y + 30` (`sheepSize / 2`)
- Current code checks if MIDDLE of sheep is in grass, not BOTTOM
- Sheep can hang half outside the grass area

**Fix**: Change to `y + sheepSize` (or hardcode `y + 60`)

---

### Issue #3: Coordinate System Transformation Issues

**The Three Coordinate Spaces**:

1. **Image Pixel Coordinates** (grass_contour.json):
   - Origin: Top-left of `blockofdirt.png` image
   - Range: `[0, 2485] × [0, 1893]` pixels
   - Contour points stored in this space

2. **Platform Container Coordinates** (returned by `getRandomPositionInDiamond()`):
   - Origin: Top-left of `sheepContainer` View
   - Range: `[0, platformWidth] × [0, platformHeight]`
   - Where: `platformWidth = SCREEN_WIDTH * 0.84`, `platformHeight = SCREEN_HEIGHT * 0.48`

3. **Screen Absolute Coordinates** (React Native layout):
   - Origin: Top-left of screen
   - `sheepContainer` positioned at:
     - `left: SCREEN_WIDTH * 0.08`
     - `top: SCREEN_HEIGHT * 0.28`

**Current Transformation** (`toImageCoords`):
```typescript
const imageX = Math.round((x / platformWidth) * imageWidth);
const imageY = Math.round((y / platformHeight) * imageHeight);
```

**Problem**:
- Assumes platform container perfectly aligns with grass image
- Doesn't account for how `blockofdirt.png` is actually rendered
- Image uses `resizeMode="contain"` which may add padding/scaling
- The grass area might NOT fill the entire container

**Fix**: This transformation is actually CORRECT assuming:
- The image fills the container exactly
- The grass contour coordinates are relative to the full image
- No letterboxing from `resizeMode="contain"`

---

### Issue #4: Potential resizeMode="contain" Letterboxing

**Location**: `app/(tabs)/index.tsx:94-96`

```typescript
<Image
  source={require('@/blockofdirt.png')}
  style={styles.farmPlatform}
  resizeMode="contain"  // <-- This might add padding!
/>
```

**Problem**:
- `blockofdirt.png` dimensions: 2485×1893 pixels (aspect ratio: ~1.31:1)
- Container dimensions: `SCREEN_WIDTH * 0.84` × `SCREEN_HEIGHT * 0.48`
- If aspect ratios don't match, `resizeMode="contain"` adds transparent padding
- Our coordinate transformation assumes NO padding

**Testing needed**: Verify actual image dimensions vs container dimensions

---

## The Contour Data

**File**: `utils/grass_contour.json`
**Points**: 3,697 [x, y] coordinates
**Source**: Extracted from `checkcoloure.py` using OpenCV:
- HSV color range: `(35, 40, 40)` to `(90, 255, 255)`
- Method: `cv.findContours()` with `RETR_EXTERNAL`
- Represents the boundary of the green grass in pixel coordinates

**Sample points**:
- `[1223, 254]` - Top area
- `[162, 776]` - Left edge
- `[1767, 1251]` - Right edge
- `[1311, 1479]` - Bottom area

**Bounding box** (approximate):
- X: ~162 to ~1767 (width: ~1605px)
- Y: ~254 to ~1479 (height: ~1225px)

This confirms grass doesn't fill the entire 2485×1893 image - there's a diamond-shaped grass area in the center.

---

## Implementation Fixes

### Fix #1: Make spawning async
```typescript
export const getRandomPositionInDiamond = async (
  platformWidth: number,
  platformHeight: number,
  sheepSize: number = 60
): Promise<{ x: number; y: number }> => {
  // Wait for contour to load
  await contourPromise;

  // Now grassContour is guaranteed to be loaded
  // ... rest of implementation
}
```

### Fix #2: Fix bottom calculation
```typescript
// Check if the bottom of the sheep is inside the contour
const [imageX, imageY] = toImageCoords(
  x,
  y + sheepSize,  // Bottom = y + full height, not half
  platformWidth,
  platformHeight
);
```

### Fix #3: Add debug logging
```typescript
console.log('[SheepSpawner] Contour loaded:', grassContour?.length, 'points');
console.log('[SheepSpawner] Testing position:', {x, y, imageX, imageY, inside: isPointInGrassContour(imageX, imageY)});
```

### Fix #4: Update callers to handle async
```typescript
// In index.tsx
const handleSpawnSheep = async () => {
  if (!user) return;
  const position = await getRandomPositionInDiamond(platformWidth, platformHeight);
  // ... rest
};

// In sheep rendering
if (!sheepPositionsRef.current.has(sheep.id)) {
  getRandomPositionInDiamond(platformWidth, platformHeight).then(position => {
    sheepPositionsRef.current.set(sheep.id, position);
    forceUpdate(); // Need to trigger re-render
  });
}
```

---

## Testing Checklist

After implementing fixes:
- [ ] Clear all sheep (Delete All button)
- [ ] Spawn 20 sheep rapidly
- [ ] Verify NO sheep appear outside visible grass
- [ ] Check console: "Contour loaded: 3697 points"
- [ ] Check console: No "Failed to load grass contour" errors
- [ ] Verify no fallback random positioning logs
- [ ] All sheep bottoms touch grass surface

---

## Summary

**Root causes**:
1. ⚠️ Async race condition causing fallback to random positioning
2. ⚠️ Wrong bottom position calculation (using middle instead of bottom)
3. Potential coordinate transformation issues (needs verification)

**Primary fix**: Make `getRandomPositionInDiamond()` async and fix bottom calculation

**Success criteria**: All sheep spawn with bottoms inside the green grass area, zero spawns outside
