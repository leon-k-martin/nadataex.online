# Copilot Instructions – nadatäx.online

## Project Overview
Single-page website for **NADAtäx upcycling**, a one-woman upcycling label based in Berlin-Moabit. The site should be playful, interactive, and evoke early 2000s web aesthetics with a water/floating theme.

**Source of truth:** [plan.md](../plan.md) contains the complete spec, content inventory, and design direction.

## Architecture
- **Framework:** Vanilla HTML + CSS + JavaScript (no build step)
- **Structure:** One-pager with scroll sections: Hero → Designs → About → Stockists → FAQ → Contact
- **Hosting target:** Static hosting (Netlify, GitHub Pages)
- **Package manager:** Use `uv` for Python dependencies (venv at `.venv/`)

## Key Assets & Locations
| Asset | Path |
|-------|------|
| Logo | `nada_logo.png`, `nada_logo_sub.png` |
| Product photos | `static/img/products/*.jpeg` |
| Process photos | `static/img/process/*.jpeg` |
| Custom cursor | `static/cursor/scissor.cur` |
| About text | `content/about.md` |
| FAQ content | `content/faq.md` |
| Reviews data | `content/reviews.json` |

**Adding new content:** Drop files into the appropriate folder. Code should dynamically discover assets rather than hardcode counts.

## Design Conventions
- **Colors:** Deep blue `#0818a8` (text/headings, from logo), water blue `#4A90D9` (background/highlights), cream `#F5F0E8` (cards), red `#C13A3A` (accents/stitching lines)
- **Typography:** Monospace (`'Courier New'`) with slight imperfections — rotations, offsets for hand-crafted feel
- **Background:** Animated water surface (CSS gradients/waves)
- **Layout quirks:** Stitching-line dashed borders, tilted elements (2-5°), floating/bobbing cards, wave dividers between sections, NO glows or heavy gradients
- **Interactivity:** Scissor/needle cursor, floating product cards, water ripple on click, review ticker at bottom

## Do Not
- Add build tools, bundlers, or frameworks unless explicitly requested
- Use generic stock imagery — only use provided assets in `static/`
- Remove the water/floating theme — it's core to the site's identity
- Use rigid grid layouts — keep things organic and scattered
