// ===== PRODUCT PHOTOS — discovers from static/img/products/ =====

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
            const path = `static/img/products/product${i}.jpeg`;
            try {
                const res = await fetch(path, { method: 'HEAD' });
                if (res.ok) photos.push(path);
                else break;
            } catch { break; }
        }
    }

    photos = photos.map(p => p.startsWith('static/') ? p : `static/img/products/${p}`);

    if (photos.length === 0) {
        grid.innerHTML = `
            <div class="product-card" style="--tilt: -2deg; --bob-delay: 0s; --bob-speed: 4.2s;">
                <div class="product-placeholder">add photos to<br>static/img/products/</div>
            </div>
            <div class="product-card" style="--tilt: 1.5deg; --bob-delay: 0.5s; --bob-speed: 4.8s;">
                <div class="product-placeholder">add photos to<br>static/img/products/</div>
            </div>
            <div class="product-card" style="--tilt: -1deg; --bob-delay: 1s; --bob-speed: 3.8s;">
                <div class="product-placeholder">add photos to<br>static/img/products/</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = photos.map((photo, i) => {
        const tilt = ((Math.random() - 0.5) * 6).toFixed(1);
        const delay = (i * 0.3).toFixed(1);
        const speed = (3.5 + Math.random() * 2).toFixed(1);
        return `
            <div class="product-card" style="--tilt: ${tilt}deg; --bob-delay: ${delay}s; --bob-speed: ${speed}s;">
                <img src="${photo}" alt="NADAtäx design" loading="lazy">
            </div>
        `;
    }).join('');
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

    photos = photos.map(p => p.startsWith('static/') ? p : `static/img/process/${p}`);
    if (photos.length === 0) return;

    collage.innerHTML = photos.map((photo, i) => {
        const rotation = ((Math.random() - 0.5) * 14).toFixed(1);
        const delay = (i * 0.4).toFixed(1);
        const speed = (4 + Math.random() * 3).toFixed(1);
        return `<img src="${photo}" alt="making-of" class="process-photo" loading="lazy"
            style="--rotation: ${rotation}deg; --bob-delay: ${delay}s; --bob-speed: ${speed}s;">`;
    }).join('');
}
