/**
 * Utility functions for spawning sheep at random positions within the GREEN grass contour.
 * Uses the same HSV thresholding and contour detection as checkcoloure.py
 */

// We'll store the contour once it's loaded
let grassContour: [number, number][] | null = null;
const contourPromise = new Promise<[number, number][]>((resolve) => {
  // Load the contour data from the JSON file we extracted
  try {
    const contourData = require('./grass_contour.json');
    grassContour = contourData;
    console.log('[SheepSpawner] Grass contour loaded successfully:', contourData.length, 'points');
    resolve(contourData);
  } catch (e) {
    console.error('[SheepSpawner] Failed to load grass contour:', e);
    resolve([]);
  }
});

/**
 * Check if a point is inside the grass contour using ray casting algorithm
 * This is equivalent to cv.pointPolygonTest() in OpenCV
 */
const isPointInGrassContour = (x: number, y: number): boolean => {
  if (!grassContour || grassContour.length === 0) return false;

  const contour = grassContour;
  let inside = false;

  for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
    const xi = contour[i][0];
    const yi = contour[i][1];
    const xj = contour[j][0];
    const yj = contour[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Convert platform coordinates to image pixel coordinates
 */
const toImageCoords = (
  x: number,
  y: number,
  platformWidth: number,
  platformHeight: number
): [number, number] => {
  const imageWidth = 2485;
  const imageHeight = 1893;

  const imageX = Math.round((x / platformWidth) * imageWidth);
  const imageY = Math.round((y / platformHeight) * imageHeight);

  return [imageX, imageY];
};

/**
 * Generate a random position within the grass contour
 * The sheep bottom will be at (x, y + sheepSize) to ensure bottom is inside contour
 *
 * IMPORTANT: This is an async function that waits for the contour to load
 */
export const getRandomPositionInDiamond = async (
  platformWidth: number,
  platformHeight: number,
  sheepSize: number = 60
): Promise<{ x: number; y: number }> => {
  // Wait for contour to load - this fixes the race condition!
  await contourPromise;

  let x = 0, y = 0;
  let attempts = 0;
  const maxAttempts = 100;

  // Rejection sampling: keep trying until sheep bottom is inside grass contour
  if (!grassContour || grassContour.length === 0) {
    console.error('[SheepSpawner] Contour not available, using fallback positioning');
    // Fallback only if contour truly failed to load
    x = Math.random() * platformWidth;
    y = Math.random() * platformHeight;
  } else {
    do {
      x = Math.random() * platformWidth;
      y = Math.random() * platformHeight;

      // Move the sheep UP by its height + extra offset so it sits on top of the grass
      const offsetY = y - sheepSize - 100; // Extra 100px offset

      // Check if ALL FOUR CORNERS of the OFFSET sheep are inside the contour
      // This ensures the entire sheep sprite is within the grass area
      const topLeft = toImageCoords(x, offsetY, platformWidth, platformHeight);
      const topRight = toImageCoords(x + sheepSize, offsetY, platformWidth, platformHeight);
      const bottomLeft = toImageCoords(x, offsetY + sheepSize, platformWidth, platformHeight);
      const bottomRight = toImageCoords(x + sheepSize, offsetY + sheepSize, platformWidth, platformHeight);

      const allCornersInside =
        isPointInGrassContour(topLeft[0], topLeft[1]) &&
        isPointInGrassContour(topRight[0], topRight[1]) &&
        isPointInGrassContour(bottomLeft[0], bottomLeft[1]) &&
        isPointInGrassContour(bottomRight[0], bottomRight[1]);

      if (allCornersInside) {
        // Use the OFFSET position for the sheep
        x = x;
        y = offsetY;
        console.log('[SheepSpawner] Found valid position (all corners inside, offset applied):', {
          x: Math.round(x),
          y: Math.round(y),
          topLeft,
          bottomRight
        });
        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      console.warn('[SheepSpawner] Max attempts reached, using last position');
    }
  }

  // Clamp to ensure sheep doesn't go out of bounds
  x = Math.max(sheepSize / 2, Math.min(platformWidth - sheepSize / 2, x));
  y = Math.max(sheepSize / 2, Math.min(platformHeight - sheepSize / 2, y));

  return { x, y };
};

// Load contour on module load
contourPromise.then((contour) => {
  grassContour = contour;
});
