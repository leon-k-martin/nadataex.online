// ===== PRODUCT PHOTOS — discovers from static/img/products/ =====

// Mosaic: number of rows (adjusts by screen width)
function getMosaicRows() {
    if (window.innerWidth >= 769) return 3;
    return 2;
}

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

    if (isMosaic) {
        // Split photos into rows distributed evenly
        const numRows = getMosaicRows();
        const rows = Array.from({ length: numRows }, () => []);
        _productPhotos.forEach((photo, i) => {
            rows[i % numRows].push({ photo, index: i });
        });

        grid.innerHTML = rows.map(row =>
            `<div class="mosaic-row">` +
            row.map(({ photo, index }) =>
                `<div class="product-card" data-index="${index}">
                    <img src="${photo}" alt="NADAtäx design" loading="lazy">
                </div>`
            ).join('') +
            `</div>`
        ).join('');
    } else {
        grid.innerHTML = _productPhotos.map((photo, i) => `
            <div class="product-card" data-index="${i}">
                <img src="${photo}" alt="NADAtäx design" loading="lazy">
            </div>
        `).join('');
    }

    // Attach lightbox click handlers
    grid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.dataset.index, 10);
            openLightbox(idx);
        });
    });
}

// ===== LIGHTBOX =====
let _lightboxIndex = 0;

function openLightbox(index) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lb || !img || _productPhotos.length === 0) return;
    _lightboxIndex = index;
    img.src = _productPhotos[_lightboxIndex];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
}

function lightboxNav(dir) {
    if (_productPhotos.length === 0) return;
    _lightboxIndex = (_lightboxIndex + dir + _productPhotos.length) % _productPhotos.length;
    document.getElementById('lightbox-img').src = _productPhotos[_lightboxIndex];
}

function initLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); lightboxNav(-1); });
    document.getElementById('lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); lightboxNav(1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxNav(-1);
        if (e.key === 'ArrowRight') lightboxNav(1);
    });
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
