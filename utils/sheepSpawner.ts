/**
 * Utility functions for spawning sheep at random positions within the hexagon grass block
 * Uses the actual contour vertices from the blockofdirt.png image
 */

export interface DiamondBounds {
  vertices: Array<{ x: number; y: number }>;
}

/**
 * Ray casting algorithm to check if a point is inside a polygon
 * Works with any convex or concave polygon
 */
const pointInPolygon = (
  point: { x: number; y: number },
  vertices: Array<{ x: number; y: number }>
): boolean => {
  let inside = false;
  let p1 = vertices[vertices.length - 1];

  for (let i = 0; i < vertices.length; i++) {
    const p2 = vertices[i];
    if (
      point.y > Math.min(p1.y, p2.y) &&
      point.y <= Math.max(p1.y, p2.y) &&
      point.x <= Math.max(p1.x, p2.x)
    ) {
      if (p1.y !== p2.y) {
        const xinters =
          ((point.y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
        if (p1.x === p2.x || point.x <= xinters) {
          inside = !inside;
        }
      }
    }
    p1 = p2;
  }
  return inside;
};

/**
 * Check if a point is inside the hexagon-shaped grass block
 * Uses the actual contour vertices detected from the image
 * Vertices in pixels (from contour detection):
 * - (162, 776) - left
 * - (164, 970) - bottom-left
 * - (1312, 1479) - bottom
 * - (2315, 974) - bottom-right
 * - (2315, 777) - right
 * - (1225, 254) - top
 */
export const isPointInDiamond = (
  x: number,
  y: number,
  platformWidth: number,
  platformHeight: number
): boolean => {
  // Platform image dimensions
  const imageWidth = 2485;
  const imageHeight = 1893;

  // Platform position in image (matches farmPlatform style)
  const platformImageX = imageWidth * 0.065; // left: SCREEN_WIDTH * 0.08 -> 162/2485 ≈ 0.065
  const platformImageY = imageHeight * 0.134; // top: SCREEN_HEIGHT * 0.28 -> 254/1893 ≈ 0.134

  // Scale factors from image pixels to platform pixels
  const scaleX = platformWidth / (imageWidth * 0.868); // width percentage
  const scaleY = platformHeight / (imageHeight * 0.648); // height percentage

  // Convert screen coordinates to image coordinates
  const imageX = x / scaleX + platformImageX;
  const imageY = y / scaleY + platformImageY;

  // Hexagon vertices from contour detection
  const vertices = [
    { x: 162, y: 776 },      // left
    { x: 164, y: 970 },      // bottom-left
    { x: 1312, y: 1479 },    // bottom
    { x: 2315, y: 974 },     // bottom-right
    { x: 2315, y: 777 },     // right
    { x: 1225, y: 254 },     // top
  ];

  return pointInPolygon({ x: imageX, y: imageY }, vertices);
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
