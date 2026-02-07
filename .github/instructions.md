# Design Rules — nadatäx.online

These are hard rules. Do not deviate without explicit user approval.

## Gallery / Product Grid

### Default view (horizontal scroll)
- **No gaps** between images — `gap: 0` always.
- Images scroll horizontally in a single row.

### Mosaic view (toggle)
- **Horizontal scroll** must be kept — never switch to vertical scroll/wrap.
- **No gaps** between images — `gap: 0` always.
- Images must keep their natural aspect ratio — NO heavy cropping.
- Use `width: auto; height: 100%` so images scale to row height naturally.
- Images are distributed into horizontal rows (flex rows inside a flex column).
- **No rotation / no float animation** in mosaic mode.

### General image rules
- Preserve the actual image aspect ratio as much as possible — avoid heavy cropping.
- Float/bob animation IS wanted on product cards in both scroll and mosaic views.
- When converting/processing images, always bake EXIF orientation into pixel data (`ImageOps.exif_transpose`) so no 90° rotation issues occur.
- Never use `image-orientation: none` in CSS.
- Filenames with spaces must be wrapped in `encodeURI()`.

## Layout
- Sections (`#designs`, `#about`) should fit within one viewport height where possible.
- Content that overflows should scroll internally (`overflow-y: auto`), not break out of the section.

## Styling
- Colors: deep blue `#0818a8`, water blue `#4A90D9`, cream `#F5F0E8`, red `#C13A3A`
- Font: Roboto (Google Fonts)
- Dashed borders, slight tilts (2-5°), floating/bobbing animations
- No glows, no heavy gradients
- Water/floating theme is core

## Tech
- Vanilla HTML/CSS/JS only — no frameworks, no build step
- Images are WebP in `static/img/products/webp/`
- Manifests (`manifest.json`) for dynamic file discovery
- Use `clamp()` for responsive sizing
- **Use `uv` for Python dependencies** — venv lives at `.venv/`
- Run Python via `.venv/bin/python`
