/**
 * Grid-based sheep spawning system
 * Each sheep occupies exactly one grid slot from predefined positions
 */

// Load the fixed grid positions
const gridData = require('./sheep_grid_positions.json');

// Track which spots are currently occupied (by spot ID)
const occupiedSpots = new Set<number>();

/**
 * Get the next available grid position for spawning a sheep
 * Returns null if all spots are occupied
 */
export const getNextGridPosition = (
  platformWidth: number,
  platformHeight: number
): { x: number; y: number; gridSpotId: number } | null => {
  // Find all unoccupied spots
  const availableSpots = gridData.spots.filter(
    (spot: any) => !occupiedSpots.has(spot.id)
  );

  // If no spots available, return null
  if (availableSpots.length === 0) {
    console.log('[SheepSpawner] All grid spots are occupied!');
    return null;
  }

  // Randomly select an available spot
  const randomIndex = Math.floor(Math.random() * availableSpots.length);
  const selectedSpot = availableSpots[randomIndex];

  // Mark this spot as occupied
  occupiedSpots.add(selectedSpot.id);

  // Convert from image coordinates to platform coordinates
  const imageWidth = gridData.imageDimensions.width;
  const imageHeight = gridData.imageDimensions.height;

  const x = (selectedSpot.x / imageWidth) * platformWidth;
  const y = (selectedSpot.y / imageHeight) * platformHeight;

  // Adjust for sheep sprite centering (sheep sprite is 60x60)
  const sheepSize = 60;
  const adjustedX = x - sheepSize / 2;
  const adjustedY = y - sheepSize / 2;

  console.log(`[SheepSpawner] Assigned grid spot ${selectedSpot.id} at (${Math.round(adjustedX)}, ${Math.round(adjustedY)})`);

  return {
    x: adjustedX,
    y: adjustedY,
    gridSpotId: selectedSpot.id
  };
};

/**
 * Free up a grid spot when a sheep is removed
 */
export const freeGridSpot = (gridSpotId: number): void => {
  if (occupiedSpots.has(gridSpotId)) {
    occupiedSpots.delete(gridSpotId);
    console.log(`[SheepSpawner] Freed grid spot ${gridSpotId}`);
  }
};

/**
 * Reset all grid spots (clear all sheep)
 */
export const resetAllGridSpots = (): void => {
  occupiedSpots.clear();
  console.log('[SheepSpawner] All grid spots have been reset');
};

/**
 * Check if there are any available spots
 */
export const hasAvailableSpots = (): boolean => {
  return occupiedSpots.size < gridData.totalSpots;
};

/**
 * Get the number of occupied spots
 */
export const getOccupiedCount = (): number => {
  return occupiedSpots.size;
};

/**
 * Get the total number of spots
 */
export const getTotalSpots = (): number => {
  return gridData.totalSpots;
};

// For backward compatibility - redirect old function to new one
export const getRandomPositionInDiamond = async (
  platformWidth: number,
  platformHeight: number
): Promise<{ x: number; y: number; gridSpotId?: number } | null> => {
  const position = getNextGridPosition(platformWidth, platformHeight);
  if (!position) {
    // Return center of platform as fallback when grid is full
    return {
      x: platformWidth / 2,
      y: platformHeight / 2
    };
  }
  return position;
};