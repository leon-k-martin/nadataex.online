#!/usr/bin/env python3
"""
Convert product & process JPEGs to WebP with correct orientation.

- Reads EXIF orientation and bakes it into pixel data (no 90° rotation issues)
- Resizes to max 1200px on longest side
- Saves as WebP at quality 80
- Regenerates manifest.json for each directory

Usage:
    .venv/bin/python scripts/convert_images.py
"""

import json
import os
import glob
from PIL import Image, ImageOps


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CONVERSIONS = [
    {
        "src": os.path.join(ROOT, "static/img/products"),
        "dst": os.path.join(ROOT, "static/img/products/webp"),
    },
    {
        "src": os.path.join(ROOT, "static/img/process"),
        "dst": os.path.join(ROOT, "static/img/process"),
    },
]

MAX_SIZE = 1200
QUALITY = 80


def convert_directory(src_dir, dst_dir):
    os.makedirs(dst_dir, exist_ok=True)

    source_files = []
    for ext in ("*.JPG", "*.jpg", "*.jpeg", "*.JPEG", "*.png", "*.PNG"):
        source_files.extend(glob.glob(os.path.join(src_dir, ext)))

    if not source_files:
        print(f"  No source images found in {src_dir}")
        return []

    webp_names = []
    for f in sorted(source_files):
        basename = os.path.splitext(os.path.basename(f))[0]
        out_name = basename + ".webp"
        out_path = os.path.join(dst_dir, out_name)

        img = Image.open(f)
        # Bake EXIF orientation into pixels — prevents 90° rotation
        img = ImageOps.exif_transpose(img)
        # Resize keeping aspect ratio
        img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
        # Ensure RGB
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        img.save(out_path, "WEBP", quality=QUALITY)
        webp_names.append(out_name)
        print(f"  {os.path.basename(f)} -> {out_name} ({img.size[0]}x{img.size[1]})")

    return webp_names


def write_manifest(directory, filenames):
    manifest_path = os.path.join(directory, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(filenames, f, indent=2)
    print(f"  Wrote {manifest_path} ({len(filenames)} files)")


def main():
    for conv in CONVERSIONS:
        src, dst = conv["src"], conv["dst"]
        print(f"\n=== Converting {src} -> {dst} ===")
        names = convert_directory(src, dst)
        if names:
            write_manifest(dst, names)

    print("\nDone.")


if __name__ == "__main__":
    main()
