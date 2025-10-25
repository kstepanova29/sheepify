/**
 * Utility functions for spawning sheep at random positions within the diamond grass block
 */

export interface DiamondBounds {
  vertices: Array<{ x: number; y: number }>;
}

/**
 * Check if a point is inside the diamond-shaped grass block
 * Diamond vertices (as % of farmPlatform):
 * - Top: (0.493, 0.000)
 * - Left: (0.000, 0.426)
 * - Bottom-Left: (0.001, 0.584)
 * - Bottom: (0.533, 0.999)
 * - Bottom-Right: (0.999, 0.587)
 * - Right: (0.999, 0.427)
 */
export const isPointInDiamond = (
  x: number,
  y: number,
  platformWidth: number,
  platformHeight: number
): boolean => {
  // Convert to platform coordinates (0-1)
  const px = x / platformWidth;
  const py = y / platformHeight;

  // Diamond boundary checks using the hexagon vertices
  // Top half (y < 0.5)
  if (py < 0.5) {
    // Left side of top half: line from (0, 0.426) to (0.493, 0)
    const leftBound = 0.426 + (0.493 - 0) * (py - 0.426) / (0 - 0.426);
    if (px < leftBound) return false;

    // Right side of top half: line from (0.999, 0.427) to (0.493, 0)
    const rightBound = 0.999 - (0.999 - 0.493) * (py - 0.427) / (0 - 0.427);
    if (px > rightBound) return false;
  }
  // Bottom half (y >= 0.5)
  else {
    // Left side of bottom half: line from (0, 0.426) to (0.001, 0.584) to (0.533, 0.999)
    if (py < 0.584) {
      const leftBound = 0 + 0.001 * (py - 0.426) / (0.584 - 0.426);
      if (px < leftBound) return false;
    } else {
      const leftBound = 0.001 + (0.533 - 0.001) * (py - 0.584) / (0.999 - 0.584);
      if (px < leftBound) return false;
    }

    // Right side of bottom half: line from (0.999, 0.427) to (0.999, 0.587) to (0.533, 0.999)
    if (py < 0.587) {
      const rightBound = 0.999;
      if (px > rightBound) return false;
    } else {
      const rightBound = 0.999 - (0.999 - 0.533) * (py - 0.587) / (0.999 - 0.587);
      if (px > rightBound) return false;
    }
  }

  return true;
};

/**
 * Generate a random position within the diamond grass block
 * Uses rejection sampling to ensure the point is within the diamond
 */
export const getRandomPositionInDiamond = (
  platformWidth: number,
  platformHeight: number,
  sheepSize: number = 60
): { x: number; y: number } => {
  let x, y;
  let attempts = 0;
  const maxAttempts = 100;

  // Rejection sampling: keep trying until we get a point inside the diamond
  do {
    x = Math.random() * platformWidth;
    y = Math.random() * platformHeight;
    attempts++;
  } while (
    !isPointInDiamond(x, y, platformWidth, platformHeight) &&
    attempts < maxAttempts
  );

  // Clamp to ensure sheep doesn't go out of bounds
  x = Math.max(sheepSize / 2, Math.min(platformWidth - sheepSize / 2, x));
  y = Math.max(sheepSize / 2, Math.min(platformHeight - sheepSize / 2, y));

  return { x, y };
};
