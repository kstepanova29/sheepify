#!/usr/bin/env python3
"""
Convert farm+windmill TIFF files to PNG format for React Native
"""

from PIL import Image
import os

def convert_tiff_to_png(input_file, output_file):
    """Convert a TIFF image to PNG format"""
    try:
        # Open the TIFF image
        img = Image.open(input_file)

        # Convert to RGB if necessary (TIFF might have different modes)
        if img.mode != 'RGB' and img.mode != 'RGBA':
            img = img.convert('RGBA')

        # Save as PNG
        img.save(output_file, 'PNG', optimize=True)

        # Get file sizes for comparison
        input_size = os.path.getsize(input_file) / (1024 * 1024)  # MB
        output_size = os.path.getsize(output_file) / (1024 * 1024)  # MB

        print(f"✓ Converted {input_file} -> {output_file}")
        print(f"  Input size: {input_size:.2f} MB")
        print(f"  Output size: {output_size:.2f} MB")
        print(f"  Dimensions: {img.size}")

    except Exception as e:
        print(f"✗ Error converting {input_file}: {e}")
        return False

    return True

# Convert both windmill frames
files_to_convert = [
    ('farm+windmill-1.tiff', 'farm-windmill-1.png'),
    ('farm+windmill-2.tiff', 'farm-windmill-2.png')
]

for input_file, output_file in files_to_convert:
    if os.path.exists(input_file):
        convert_tiff_to_png(input_file, output_file)
    else:
        print(f"✗ File not found: {input_file}")