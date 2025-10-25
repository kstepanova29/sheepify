/**
 * Utility functions for spawning sheep at random positions within the GREEN grass contour.
 * Uses OpenCV contour detection to ensure sheep bottom spawns only inside the green area.
 */

import grassContour from './grass_contour.json';

const GRASS_CONTOUR: [number, number][] = grassContour;

/**
 * Check if a point is inside the grass contour using ray casting algorithm
 * This is equivalent to cv.pointPolygonTest() in OpenCV
 */
export const isPointInGrassContour = (x: number, y: number): boolean => {
  const contour = GRASS_CONTOUR;
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
 * The sheep bottom will be at (x, y + sheepSize/2) to ensure bottom is inside contour
 */
export const getRandomPositionInDiamond = (
  platformWidth: number,
  platformHeight: number,
  sheepSize: number = 60
): { x: number; y: number } => {
  let x = 0, y = 0;
  let attempts = 0;
  const maxAttempts = 100;

  // Rejection sampling: keep trying until sheep bottom is inside grass contour
  do {
    x = Math.random() * platformWidth;
    y = Math.random() * platformHeight;

    // Check if the bottom of the sheep (y + sheepSize/2) is inside the contour
    const [imageX, imageY] = toImageCoords(x, y + sheepSize / 2, platformWidth, platformHeight);

    if (isPointInGrassContour(imageX, imageY)) {
      break;
    }

    attempts++;
  } while (attempts < maxAttempts);

  // Clamp to ensure sheep doesn't go out of bounds
  x = Math.max(sheepSize / 2, Math.min(platformWidth - sheepSize / 2, x));
  y = Math.max(sheepSize / 2, Math.min(platformHeight - sheepSize / 2, y));

  return { x, y };
};
