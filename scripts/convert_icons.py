#!/usr/bin/env python3
"""
Convert hand-drawn icons: remove white background and recolor to nadatäx blue
"""

from PIL import Image
import sys
from pathlib import Path

# nadatäx deep blue color
TARGET_COLOR = (8, 24, 168)  # #0818a8

def convert_icon(input_path, output_path):
    """
    Convert icon: remove white background, recolor black lines to deep blue
    """
    img = Image.open(input_path).convert('RGBA')
    data = img.getdata()

    new_data = []
    for item in data:
        r, g, b, a = item

        # Calculate brightness (0-255)
        brightness = (r + g + b) / 3

        # If pixel is bright (white/light gray), make transparent
        if brightness > 240:
            new_data.append((255, 255, 255, 0))
        # If pixel is dark (the drawn lines), recolor to deep blue
        elif brightness < 180:
            # Preserve the original alpha/darkness by adjusting alpha
            darkness = 1 - (brightness / 255)
            alpha = int(255 * darkness)
            new_data.append((*TARGET_COLOR, alpha))
        # Medium tones (anti-aliasing), interpolate
        else:
            # Blend between transparent and colored
            opacity = (240 - brightness) / 60  # 0 to 1
            alpha = int(255 * opacity)
            new_data.append((*TARGET_COLOR, alpha))

    img.putdata(new_data)

    # Resize to reasonable web size (if larger)
    if img.width > 200 or img.height > 200:
        img.thumbnail((200, 200), Image.Resampling.LANCZOS)

    img.save(output_path, 'PNG')
    print(f"✓ Converted {input_path.name} → {output_path.name}")

def main():
    base_dir = Path(__file__).parent.parent
    source_dir = base_dir / 'Symbole und Texturen'
    icons_dir = base_dir / 'static' / 'img' / 'icons'

    # Map source files to output files
    icon_map = {
        'home.png': 'home.png',
        'instagram.png': 'instagram.png',
        'message.png': 'contact.png',
    }

    icons_dir.mkdir(parents=True, exist_ok=True)

    converted_count = 0

    # Convert each icon
    for source_name, output_name in icon_map.items():
        source = source_dir / source_name
        output = icons_dir / output_name

        if source.exists():
            try:
                convert_icon(source, output)
                converted_count += 1
            except Exception as e:
                print(f"✗ Error converting {source_name}: {e}")
        else:
            print(f"✗ Source not found: {source}")

    if converted_count == 0:
        print(f"\nNo icons found in {source_dir}")
        print("Expected files:")
        print("  - home.png")
        print("  - instagram.png")
        print("  - message.png")
    else:
        print(f"\n✓ Converted {converted_count} icon(s)")
        print(f"Saved to: {icons_dir}")

if __name__ == '__main__':
    main()
