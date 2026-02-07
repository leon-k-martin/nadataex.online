# NADAtäx Upcycling — Website Plan

## Brand Profile
NADAtäx upcycling is a one-woman label based in Berlin-Moabit. What began with a single tarpaulin she couldn't bring herself to throw away has grown into a practice of careful making and thoughtful reuse. From that first piece, a series of backpacks was born — each one shaped by hand, each a response to the question: what can this become?

Those first backpack designs found their homes at Vintage Safari in Nuremberg, and since then a quiet journey has unfolded: new bag styles sold through Vintage Safari, Frau Wunderwald in Berlin and House of Orange in Dresden, and directly via Instagram. Alongside everyday bags, NADAtäx occasionally makes costumes for theatre productions, each garment grounded in the same ethos of reuse and imagination.

Central to everything NADAtäx does is a simple idea: materials that have lived once can be given a new life — without erasing their history. Instead of new textiles, she works with what already exists, letting texture, wear, and character guide each piece. This approach acknowledges the value in what others might overlook, and challenges the cycle of waste that defines so much of contemporary fashion.

NADAtäx doesn't follow trends. It makes what feels necessary — quietly, sustainably, and with close attention to both material and maker.

---

## Content & Assets

### 🎒 Designs / Products
**Display Strategy:** Showcase key pieces with photos. Group by category (bags, backpacks, costumes, accessories). Each item can have multiple photos and a short description.

| Category | Examples | Notes |
|----------|----------|-------|
| Backpacks | Tarpaulin series (original line) | Hero products |
| Bags | Various styles | Sold at Vintage Safari, Frau Wunderwald, House of Orange |
| Costumes | Theatre productions | Occasional commissions |
| Accessories | TBD | Future expansion |

### 📸 Photos
Location: `static/img/products/*.jpeg` and `static/img/process/*.jpeg`
- Product shots (individual pieces)
- Process/workshop photos (making-of, materials)

### 🏪 Stockists / Where to Buy
| Shop | Location | Status |
|------|----------|--------|
| Vintage Safari | Nuremberg | Active |
| Frau Wunderwald | Berlin | Active |
| House of Orange | Dresden | Active |
| Instagram | @nadataex | Direct sales |

### 💬 Reviews / Testimonials
Collected buyer feedback — displayed as a floating ticker bar at the bottom of the page ("swimming by" feel on the water).

### 📄 About / Bio Text
See Brand Profile above. Content stored in `content/about.md` (EN + DE separated by `---`, like nohub).

*(TODO: add German translation to `content/about.md`)*

---

## Website Architecture

### Framework: Single-Page HTML (Vanilla JS + CSS)
**Why:** Lightweight, fast, no build step needed, easy to host anywhere (Netlify, GitHub Pages).

**Domains:** `nadataex-upcycling.de` or `nadataex.de`

### Page Structure (Scroll Sections)
```
┌─────────────────────────────────────────┐
│  HEADER (fixed)                         │
│  - Logo centered                        │
│  - Nav links left: Designs, About,      │
│    FAQ, Contact                         │
│  - Mobile: wave-shaped hamburger menu   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  HERO                                   │
│  - Full logo (nada_logo.png)            │
│  - Tagline                              │
│  - Interactive element (scissors cursor │
│    or fabric/thread animation)          │
│  - Water ripple background starts here  │
└─────────────────────────────────────────┘
          ↓ scroll (floating on water)
┌─────────────────────────────────────────┐
│  DESIGNS                                │
│  - Product showcase grid                │
│  - Cards "floating" on water surface    │
│  - Click to expand / see details        │
│  - Filter by category (bags, backpacks, │
│    costumes)                            │
└─────────────────────────────────────────┘
          ↓ scroll
┌─────────────────────────────────────────┐
│  ABOUT                                  │
│  - Bio text (EN/DE toggle like nohub)   │
│  - Process photos in scattered collage  │
│  - "Materials have memory" vibe         │
└─────────────────────────────────────────┘
          ↓ scroll
┌─────────────────────────────────────────┐
│  STOCKISTS                              │
│  - Where to buy (shop cards)            │
│  - Links to Instagram / shops           │
└─────────────────────────────────────────┘
          ↓ scroll
┌─────────────────────────────────────────┐
│  FAQ                                    │
│  - Expandable Q&A (accordion style)     │
│  - Materials, care, custom orders, etc. │
└─────────────────────────────────────────┘
          ↓ scroll
┌─────────────────────────────────────────┐
│  CONTACT                                │
│  - Email / Instagram links              │
│  - Simple contact form (optional)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  FLOATING REVIEW TICKER (fixed bottom)  │
│  - Buyer testimonials scrolling by      │
│  - "Swimming" on the water surface      │
│  - Always visible, subtle, non-blocking │
└─────────────────────────────────────────┘
```

---

## Design Direction

### Visual Style: "Floating Workshop" — Early 2000s Web × Waterworld
Like a craft workshop adrift on water. Playful, handmade, slightly chaotic — but warm and intentional. Inspired by early internet aesthetics (Geocities, hand-coded HTML) with a modern twist.

**Moodboard:** `MOODYBOARD-NADATÄX.pdf`

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Blue (logo) | `#0818a8` | Primary text, headings, accents |
| Water Blue (light) | `#4A90D9` | Water background, highlights |
| White / Cream | `#F5F0E8` | Card backgrounds, text on dark |
| Warm Grey | `#8B8680` | Secondary text, borders |
| Accent (thread red) | `#C13A3A` | CTAs, interactive highlights, stitching lines |

### Water Theme Implementation
- **Background:** Animated water surface (CSS gradients/animation or subtle SVG wave)
- **Sections float:** Content cards sit "on top" of water, with subtle shadow/reflection
- **Wave dividers:** Between sections, use SVG wave shapes instead of straight lines
- **Parallax:** Slow-moving water layers at different scroll speeds
- **Review ticker:** Testimonials "swim by" at the bottom like floating messages in bottles

### Typography
- **Primary:** `'Courier New'` or similar monospace — raw, typewriter feel (like nohub)
- **Accent:** Hand-drawn or stitch-style font for headings (optional, web-safe fallback)
- **Lowercase everything** — casual, approachable vibe (like nohub)
- **Slight rotations & offsets** for hand-crafted imperfection

### Layout Quirks
- Elements float and bob gently (CSS animation, small vertical oscillation)
- Stitching-line borders (dashed lines that look like thread)
- Tilted elements (2-5° rotations, like nohub)
- NO glows, NO heavy gradients — flat or watercolor-wash only
- Product cards look like postcards or Polaroids floating on water
- Scattered, organic layout (not rigid grid)

### Interactive Elements
1. **Custom Cursor**
   - Scissor or needle cursor (generate via script, see `scripts/`)
   - Cursor changes on hover over interactive elements (e.g., scissors "cut" on click)

2. **Floating / Bobbing Elements**
   - Product cards gently bob up and down (CSS keyframe animation)
   - Elements drift very slightly on scroll (parallax)

3. **Water Ripple on Click**
   - Clicking anywhere on the water background creates a CSS ripple effect
   - Optional: splash sound on click

4. **Review Ticker**
   - Fixed bar at bottom of viewport
   - Testimonials scroll by horizontally like floating bottles
   - Subtle wave animation on the ticker bar itself

5. **Mobile Wave Menu**
   - Hamburger menu lines are replaced with blue wave shapes
   - Menu opens with a water-splash animation

6. **Product Cards**
   - Hover: card lifts slightly, shadow grows (like lifting off water)
   - Click: expands to detail view with multiple photos

---

## Technical Implementation

### File Structure
```
/
├── index.html              # Single page
├── style.css               # All styles
├── script.js               # Interactivity
├── plan.md                 # This file (source of truth)
├── static/
│   ├── img/
│   │   ├── nada_logo.png   # Main logo
│   │   ├── nada_logo_sub.png # Logo with subline
│   │   ├── water-bg.svg    # Water background pattern
│   │   ├── wave-divider.svg # Section wave divider
│   │   ├── products/       # Product photos (*.jpeg)
│   │   └── process/        # Workshop/process photos (*.jpeg)
│   └── cursor/
│       └── scissor.cur     # Custom cursor file
├── content/
│   ├── about.md            # Bio text (EN + DE, separated by ---)
│   ├── faq.md              # FAQ entries
│   └── reviews.json        # Testimonials data
├── scripts/
│   └── create-cursor.sh    # Script to generate custom cursor
├── .github/
│   └── copilot-instructions.md
└── favicon.ico
```

**Extensibility:** Add new product photos by dropping files into `static/img/products/`. Code should dynamically discover and display all assets (use manifest.json or directory listing).

### Performance Considerations
- Lazy load images (especially product photos)
- Compress images (WebP where possible, JPEG fallback)
- Water animation: use CSS transforms (GPU-accelerated), not JS
- Debounce scroll listeners
- Review ticker: CSS animation only (no JS interval)

### Hosting
- **GitHub Pages** or **Netlify** (free, static)
- Custom domain: `nadataex-upcycling.de` or `nadataex.de`
- CNAME file for custom domain

### Package Manager
- Use `uv` for any Python tooling (venv at `.venv/`)
- No build step for the website itself

---

## TODO / Next Steps
- [ ] Write tagline
- [ ] Write hero copy / pitch text
- [ ] Write FAQ content → `content/faq.md`
- [ ] Write German bio translation → `content/about.md`
- [ ] Gather product photos → `static/img/products/`
- [ ] Gather process/workshop photos → `static/img/process/`
- [ ] Collect buyer testimonials → `content/reviews.json`
- [ ] Generate scissor/needle cursor → `scripts/create-cursor.sh`
- [ ] Design favicon from logo
- [ ] Create water background SVG/CSS
- [ ] Create wave divider SVG
- [ ] Build HTML/CSS/JS prototype
- [ ] Test on mobile devices
- [ ] Deploy to hosting

## Growing the Site
- **Products:** Add `*.jpeg` to `static/img/products/`
- **Process photos:** Add `*.jpeg` to `static/img/process/`
- **Reviews:** Add entries to `content/reviews.json`
- **FAQ:** Add entries to `content/faq.md`
- Code should auto-discover new assets without hardcoded counts

---

## Inspiration & References
- **nohub.online** — Sister project, same dev approach (vanilla HTML/CSS/JS, one-pager, early 2000s aesthetic, playful interactivity)
- Early 2000s web / Geocities
- Handmade craft market stalls
- Floating market vibes (Bangkok, Amsterdam)
- Message in a bottle aesthetics