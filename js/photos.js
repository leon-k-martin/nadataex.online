// ===== PRODUCT PHOTOS — discovers from static/img/products/ =====

// Mosaic size pattern — some cards span 2 rows for variety
// dense packing ensures no holes
const MOSAIC_PATTERN = [
    '', '', 'mosaic-tall', '',
    '', '', '', '',
    'mosaic-tall', '', '', '',
];

let _productPhotos = []; // cached after first load

async function loadProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    let photos = [];

    // Try manifest first
    try {
        const res = await fetch('static/img/products/manifest.json');
        if (res.ok) {
            const data = await res.json();
            photos = Array.isArray(data) ? data : (data.photos || []);
        }
    } catch {}

    // Fallback: try sequential discovery
    if (photos.length === 0) {
        for (let i = 1; i <= 50; i++) {
            const path = `static/img/products/webp/product${i}.webp`;
            try {
                const res = await fetch(path, { method: 'HEAD' });
                if (res.ok) photos.push(path);
                else break;
            } catch { break; }
        }
    }

    // Shuffle photos for variety on each load
    for (let i = photos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [photos[i], photos[j]] = [photos[j], photos[i]];
    }

    photos = photos.map(p => {
        const full = p.startsWith('static/') ? p : `static/img/products/webp/${p}`;
        return encodeURI(full);
    });

    _productPhotos = photos;
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    const isMosaic = grid.classList.contains('mosaic');

    if (_productPhotos.length === 0) {
        grid.innerHTML = `
            <div class="product-card">
                <div class="product-placeholder">add photos to<br>static/img/products/</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = _productPhotos.map((photo, i) => {
        const sizeClass = isMosaic ? MOSAIC_PATTERN[i % MOSAIC_PATTERN.length] : '';
        return `
            <div class="product-card ${sizeClass}">
                <img src="${photo}" alt="NADAtäx design" loading="lazy">
            </div>
        `;
    }).join('');
}

// SVG icons for view toggle
const ICON_SCROLL = '<svg width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="4" width="16" height="10" rx="1" fill="currentColor"/></svg>';
const ICON_MOSAIC = '<svg width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor"/><rect x="10" y="1" width="7" height="7" rx="1" fill="currentColor"/><rect x="1" y="10" width="7" height="7" rx="1" fill="currentColor"/><rect x="10" y="10" width="7" height="7" rx="1" fill="currentColor"/></svg>';

// Toggle between scroll and mosaic view
function initViewToggle() {
    const toggle = document.getElementById('view-toggle');
    const section = document.getElementById('designs');
    const grid = document.getElementById('product-grid');
    if (!toggle || !section || !grid) return;

    // Start showing mosaic icon (click to switch TO mosaic)
    toggle.innerHTML = ICON_MOSAIC;

    toggle.addEventListener('click', () => {
        const goMosaic = !grid.classList.contains('mosaic');
        grid.classList.toggle('mosaic', goMosaic);
        section.classList.toggle('mosaic-view', goMosaic);
        // Show the icon of the OTHER view (what you'd switch to)
        toggle.innerHTML = goMosaic ? ICON_SCROLL : ICON_MOSAIC;
        renderProducts();
    });
}

// ===== PROCESS PHOTOS — discovers from static/img/process/ =====

async function loadProcessPhotos() {
    const collage = document.getElementById('process-collage');
    if (!collage) return;

    let photos = [];

    try {
        const res = await fetch('static/img/process/manifest.json');
        if (res.ok) {
            const data = await res.json();
            photos = Array.isArray(data) ? data : (data.photos || []);
        }
    } catch {}

    if (photos.length === 0) {
        for (let i = 1; i <= 30; i++) {
            const path = `static/img/process/process${i}.jpeg`;
            try {
                const res = await fetch(path, { method: 'HEAD' });
                if (res.ok) photos.push(path);
                else break;
            } catch { break; }
        }
    }

    photos = photos.map(p => {
        const full = p.startsWith('static/') ? p : `static/img/process/${p}`;
        return encodeURI(full);
    });
    if (photos.length === 0) return;

    collage.innerHTML = photos.map((photo, i) => {
        const rotation = ((Math.random() - 0.5) * 14).toFixed(1);
        return `<img src="${photo}" alt="making-of" class="process-photo float" loading="lazy"
            style="--rotation: ${rotation}deg;">`;
    }).join('');
}
