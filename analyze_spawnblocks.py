#!/usr/bin/env python3
"""
Analyze spawnblocks.tiff to understand the grid layout for sheep spawning
"""

from PIL import Image
import numpy as np
import cv2

# Load and convert the TIFF image
img_pil = Image.open('spawnblocks.tiff')
img_pil_rgb = img_pil.convert('RGB')
img_np = np.array(img_pil_rgb)
img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

# Save as PNG for viewing
cv2.imwrite('spawnblocks_view.png', img_cv)
print(f"Image dimensions: {img_cv.shape}")

# First detect the light blue grid lines
# Then find the green squares within
hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)

# Light blue detection - adjust for the specific blue in the image
# This blue appears to be around H=100-110 in OpenCV scale
blue_low = np.array([95, 150, 150])
blue_high = np.array([115, 255, 255])
blue_mask = cv2.inRange(hsv, blue_low, blue_high)

# Green detection for the spawn squares
green_low = np.array([35, 40, 40])
green_high = np.array([85, 255, 255])
green_mask = cv2.inRange(hsv, green_low, green_high)

# Find contours of the green spawn squares
# We'll look for green areas that are surrounded by blue (the grid)
contours, _ = cv2.findContours(green_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
print(f"Found {len(contours)} green regions")

# Also check blue regions for debugging
blue_contours, _ = cv2.findContours(blue_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
print(f"Found {len(blue_contours)} blue grid regions")

# Analyze each grid block
grid_blocks = []
for i, contour in enumerate(contours):
    x, y, w, h = cv2.boundingRect(contour)
    area = cv2.contourArea(contour)
    if area > 100:  # Filter out noise
        grid_blocks.append({
            'id': i,
            'x': x,
            'y': y,
            'width': w,
            'height': h,
            'center_x': x + w//2,
            'center_y': y + h//2,
            'area': area
        })

# Sort blocks by position (top to bottom, left to right)
grid_blocks.sort(key=lambda b: (b['y'] // 50, b['x']))

print(f"\nFound {len(grid_blocks)} grid blocks for sheep spawning:")
print("First 5 blocks:")
for block in grid_blocks[:5]:
    print(f"  Block at ({block['center_x']}, {block['center_y']}) - Size: {block['width']}x{block['height']}")

print("\nLast 5 blocks:")
for block in grid_blocks[-5:]:
    print(f"  Block at ({block['center_x']}, {block['center_y']}) - Size: {block['width']}x{block['height']}")

# Create visualization
vis = img_cv.copy()
for i, block in enumerate(grid_blocks):
    # Draw rectangles around each spawn block
    cv2.rectangle(vis, (block['x'], block['y']),
                  (block['x'] + block['width'], block['y'] + block['height']),
                  (0, 255, 0), 2)
    # Add numbers
    cv2.putText(vis, str(i+1), (block['center_x']-10, block['center_y']+5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

cv2.imwrite('spawnblocks_analysis.png', vis)
cv2.imwrite('spawnblocks_blue_mask.png', blue_mask)
cv2.imwrite('spawnblocks_green_mask.png', green_mask)

print(f"\nSaved visualizations:")
print("- spawnblocks_view.png: Original image")
print("- spawnblocks_analysis.png: Grid blocks numbered")
print("- spawnblocks_blue_mask.png: Detected blue grid")
print("- spawnblocks_green_mask.png: Detected green spawn areas")

# Calculate grid layout
if grid_blocks:
    # Find grid dimensions
    x_coords = sorted(set(b['x'] for b in grid_blocks))
    y_coords = sorted(set(b['y'] for b in grid_blocks))

    print(f"\nGrid layout:")
    print(f"  Columns: {len(x_coords)}")
    print(f"  Rows: {len(y_coords)}")
    print(f"  Total spots: {len(grid_blocks)}")

    # Average block size
    avg_width = sum(b['width'] for b in grid_blocks) / len(grid_blocks)
    avg_height = sum(b['height'] for b in grid_blocks) / len(grid_blocks)
    print(f"  Average block size: {avg_width:.1f} x {avg_height:.1f} pixels")