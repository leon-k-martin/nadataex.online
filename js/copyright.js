// ===== COPYRIGHT LABELS — reads from content/copyrights.json =====
// Adds photographer credit overlays to product photos.
// The data file maps photographer names to filename stems (no extension).
// This module observes the DOM so it works even when photos are loaded
// dynamically or the view is toggled between scroll/mosaic.

let _copyrightMap = null; // filename-stem → photographer name

/**
 * Load the copyright mapping from content/copyrights.json
 * Builds a Map: lowercase filename stem → photographer name
 */
async function loadCopyrights() {
    if (_copyrightMap) return _copyrightMap;
    try {
        const res = await fetch('content/copyrights.json');
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        _copyrightMap = new Map();
        for (const entry of data) {
            for (const file of entry.files) {
                _copyrightMap.set(file.toLowerCase(), entry.photographer);
            }
        }
    } catch (e) {
        console.warn('Could not load copyrights:', e);
        _copyrightMap = new Map();
    }
    return _copyrightMap;
}

/**
 * Extract the filename stem from a full image src/path
 * e.g. "static/img/products/webp/nadataex033.webp" → "nadataex033"
 */
function getStem(src) {
    if (!src) return '';
    const decoded = decodeURIComponent(src);
    const filename = decoded.split('/').pop();          // "nadataex033.webp"
    const stem = filename.replace(/\.[^.]+$/, '');       // "nadataex033"
    return stem.toLowerCase();
}

/**
 * Apply copyright labels to all product cards currently in the DOM.
 * Safe to call repeatedly — skips cards that already have a label.
 * Adds mouseenter listener to flip label to top when bottom is clipped.
 */
function applyCopyrightLabels() {
    if (!_copyrightMap || _copyrightMap.size === 0) return;

    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (card.querySelector('.photo-credit')) return;          // already labelled

        const img = card.querySelector('img');
        if (!img) return;

        const stem = getStem(img.getAttribute('src'));
        const photographer = _copyrightMap.get(stem);
        if (!photographer) return;

        const label = document.createElement('span');
        label.className = 'photo-credit';
        label.textContent = `© ${photographer}`;
        card.appendChild(label);

        // Dynamically flip label position when bottom is clipped
        card.addEventListener('mouseenter', () => {
            const cardRect = card.getBoundingClientRect();
            const viewportH = window.innerHeight;

            // Check against viewport
            let bottomClipped = cardRect.bottom > viewportH - 20;

            // Also check against the closest scrollable grid container
            if (!bottomClipped) {
                const grid = card.closest('.product-grid');
                if (grid) {
                    const gridRect = grid.getBoundingClientRect();
                    bottomClipped = cardRect.bottom > gridRect.bottom - 5;
                }
            }

            label.classList.toggle('credit-top', bottomClipped);
        });
    });
}

/**
 * Apply copyright overlay inside the lightbox when it shows a credited photo.
 */
function applyLightboxCredit() {
    if (!_copyrightMap || _copyrightMap.size === 0) return;

    const wrap = document.getElementById('lightbox-img-wrap');
    const lbImg = document.getElementById('lightbox-img');
    if (!wrap || !lbImg) return;

    // Remove any existing credit
    const existing = wrap.querySelector('.lightbox-credit');
    if (existing) existing.remove();

    const stem = getStem(lbImg.getAttribute('src'));
    const photographer = _copyrightMap.get(stem);
    if (!photographer) return;

    const label = document.createElement('span');
    label.className = 'lightbox-credit';
    label.textContent = `© ${photographer}`;
    wrap.appendChild(label);
}

/**
 * Initialise the copyright system:
 * 1. Load data
 * 2. Apply labels to existing cards
 * 3. Watch for dynamic changes (view toggle, lazy load)
 * 4. Watch lightbox image changes
 */
async function initCopyrights() {
    await loadCopyrights();
    if (_copyrightMap.size === 0) return;

    // Initial pass
    applyCopyrightLabels();

    // Re-apply whenever the product grid changes (view toggle, load)
    const grid = document.getElementById('product-grid');
    if (grid) {
        const observer = new MutationObserver(() => {
            requestAnimationFrame(applyCopyrightLabels);
        });
        observer.observe(grid, { childList: true, subtree: true });
    }

    // Watch lightbox image src changes to update credit
    const lbImg = document.getElementById('lightbox-img');
    if (lbImg) {
        const imgObserver = new MutationObserver(() => {
            requestAnimationFrame(applyLightboxCredit);
        });
        imgObserver.observe(lbImg, { attributes: true, attributeFilter: ['src'] });
    }

    // Also apply when lightbox opens
    const lb = document.getElementById('lightbox');
    if (lb) {
        const lbObserver = new MutationObserver(() => {
            if (lb.classList.contains('open')) {
                requestAnimationFrame(applyLightboxCredit);
            }
        });
        lbObserver.observe(lb, { attributes: true, attributeFilter: ['class'] });
    }
}
