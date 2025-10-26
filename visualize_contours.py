#!/usr/bin/env python3
"""
Visualize the green contours that are used for sheep spawning
"""

import cv2 as cv
import numpy as np
import json

# Load the current grass contour from the JSON file
try:
    with open('utils/grass_contour.json', 'r') as f:
        contour_points = json.load(f)
    contour = np.array(contour_points, dtype=np.int32)
    print(f"Loaded grass_contour.json with {len(contour_points)} points")
except Exception as e:
    print(f"Error loading contour: {e}")
    contour = None

# Load both windmill frames to show contours on them
images_to_process = [
    ('farm-windmill-1.png', 'contour_vis_windmill1.png'),
    ('farm-windmill-2.png', 'contour_vis_windmill2.png'),
    ('blockofdirt.png', 'contour_vis_blockofdirt.png')
]

for input_file, output_file in images_to_process:
    try:
        # Load the image
        img = cv.imread(input_file)
        if img is None:
            print(f"Skipping {input_file} - not found")
            continue

        # Create a visualization copy
        vis = img.copy()

        # Method 1: Draw the loaded contour from JSON (in red)
        if contour is not None:
            cv.drawContours(vis, [contour], -1, (0, 0, 255), 3)  # Red thick line

        # Method 2: Also detect green areas fresh to compare (in blue)
        hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
        hsv_green_low = (35, 40, 40)
        hsv_green_high = (90, 255, 255)
        green_mask = cv.inRange(hsv, np.array(hsv_green_low), np.array(hsv_green_high))

        # Find contours in current image
        current_contours, _ = cv.findContours(green_mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
        if current_contours:
            largest = max(current_contours, key=cv.contourArea)
            cv.drawContours(vis, [largest], -1, (255, 0, 0), 2)  # Blue thin line

        # Add a semi-transparent green overlay on the detected area
        overlay = vis.copy()
        mask_colored = cv.cvtColor(green_mask, cv.COLOR_GRAY2BGR)
        mask_colored[:, :, 0] = 0  # Remove blue channel
        mask_colored[:, :, 2] = 0  # Remove red channel
        overlay = cv.addWeighted(vis, 0.7, mask_colored, 0.3, 0)

        # Add legend
        cv.putText(overlay, "Red = Stored Contour (grass_contour.json)", (50, 50),
                   cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv.putText(overlay, "Blue = Fresh Detection", (50, 90),
                   cv.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        cv.putText(overlay, "Green Tint = HSV Green Areas", (50, 130),
                   cv.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Save the visualization
        cv.imwrite(output_file, overlay)
        print(f"✓ Created {output_file}")

        # Also save just the mask for clarity
        mask_output = output_file.replace('.png', '_mask.png')
        cv.imwrite(mask_output, green_mask)
        print(f"  Saved mask to {mask_output}")

    except Exception as e:
        print(f"✗ Error processing {input_file}: {e}")

print("\nContour visualizations created!")
print("Red lines show the stored contour from grass_contour.json")
print("Blue lines show freshly detected green areas")
print("Green tint shows all pixels detected as green by HSV threshold")