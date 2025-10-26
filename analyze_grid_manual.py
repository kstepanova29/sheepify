#!/usr/bin/env python3
"""
Manually extract the grid positions from spawnblocks.tiff
Based on visual inspection, the grid appears to be 7x6 with some spots blocked by windmill
"""

from PIL import Image
import numpy as np
import cv2
import json

# Load the image
img_pil = Image.open('spawnblocks.tiff')
img_pil_rgb = img_pil.convert('RGB')
img_np = np.array(img_pil_rgb)
img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

print(f"Image dimensions: {img_cv.shape}")

# Based on visual inspection of the grid pattern
# The grid starts around the green grass area and forms a diamond/rectangular pattern
# Let's manually define the grid based on the visual pattern

# Looking at the image, I can see:
# - The grid has roughly 7 columns and 6-7 rows
# - It forms a diamond/rectangular pattern on the isometric platform
# - Each cell appears to be roughly the same size

# Let's detect the individual green squares more carefully
hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)

# Green detection - be more specific
green_low = np.array([40, 50, 50])
green_high = np.array([80, 255, 255])
green_mask = cv2.inRange(hsv, green_low, green_high)

# Apply morphological operations to clean up
kernel = np.ones((3,3), np.uint8)
green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel)
green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel)

# Find contours
contours, _ = cv2.findContours(green_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Filter contours by area to get only the grid squares
grid_blocks = []
MIN_AREA = 5000  # Minimum area for a grid square
MAX_AREA = 50000  # Maximum area for a grid square

for contour in contours:
    area = cv2.contourArea(contour)
    if MIN_AREA < area < MAX_AREA:
        x, y, w, h = cv2.boundingRect(contour)
        # Filter by aspect ratio - grid squares should be roughly square-ish in screen space
        aspect = w / h if h > 0 else 0
        if 0.5 < aspect < 3.0:  # Allow for isometric distortion
            grid_blocks.append({
                'x': x,
                'y': y,
                'width': w,
                'height': h,
                'center_x': x + w//2,
                'center_y': y + h//2,
                'area': area
            })

# Sort blocks by position (top-left to bottom-right)
grid_blocks.sort(key=lambda b: (b['y'] // 50, b['x']))

print(f"\nFound {len(grid_blocks)} grid blocks for sheep spawning")

# Create visualization
vis = img_cv.copy()
for i, block in enumerate(grid_blocks):
    # Draw rectangles
    cv2.rectangle(vis, (block['x'], block['y']),
                  (block['x'] + block['width'], block['y'] + block['height']),
                  (0, 255, 0), 3)
    # Add numbers - make them more visible
    cv2.putText(vis, str(i+1), (block['center_x']-15, block['center_y']+10),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 0, 255), 3)

# Save results
cv2.imwrite('grid_blocks_detected.png', vis)
cv2.imwrite('green_mask_clean.png', green_mask)

# Also create a clean version showing just the centers
centers_img = np.zeros_like(img_cv)
for block in grid_blocks:
    cv2.circle(centers_img, (block['center_x'], block['center_y']), 10, (0, 255, 255), -1)

cv2.imwrite('grid_centers.png', centers_img)

print(f"\nGrid block centers (for spawn positions):")
for i, block in enumerate(grid_blocks):
    print(f"  Spot {i+1}: ({block['center_x']}, {block['center_y']})")

# Save the grid positions to JSON for use in the game
grid_data = {
    'total_spots': len(grid_blocks),
    'image_dimensions': {'width': img_cv.shape[1], 'height': img_cv.shape[0]},
    'spots': [
        {
            'id': i,
            'center': {'x': block['center_x'], 'y': block['center_y']},
            'bounds': {
                'x': block['x'],
                'y': block['y'],
                'width': block['width'],
                'height': block['height']
            }
        }
        for i, block in enumerate(grid_blocks)
    ]
}

with open('sheep_spawn_grid.json', 'w') as f:
    json.dump(grid_data, f, indent=2)

print(f"\n✓ Saved {len(grid_blocks)} spawn positions to sheep_spawn_grid.json")
print("\nVisualization files created:")
print("- grid_blocks_detected.png: Shows all detected spawn blocks with numbers")
print("- green_mask_clean.png: Binary mask of green areas")
print("- grid_centers.png: Just the center points for spawn positions")