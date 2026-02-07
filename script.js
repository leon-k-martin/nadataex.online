// ===== ABOUT SECTION (MARKDOWN) =====
async function loadAbout() {
    const container = document.getElementById('about-content');
    const toggle = document.getElementById('lang-toggle');
    if (!container) return;

    try {
        const response = await fetch('content/about.md');
        if (!response.ok) throw new Error('Failed to load about.md');

        const markdown = await response.text();

        // Split by horizontal rule into EN / DE sections
        const sections = markdown.split(/\n---\n/);

        const toHtml = (text) => {
            return text
                .trim()
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .split(/\n\n+/)
                .filter(p => p.trim())
                .map(p => `<p>${p.replace(/\n/g, ' ')}</p>`)
                .join('');
        };

        let html = `<div class="about-text-en">${toHtml(sections[0])}</div>`;
        if (sections[1]) {
            html += `<div class="about-text-de">${toHtml(sections[1])}</div>`;
        }

        container.innerHTML = html;

        // Setup language toggle
        if (toggle) {
            toggle.addEventListener('click', () => {
                const showingDe = container.classList.toggle('show-de');
                toggle.textContent = showingDe ? 'en' : 'de';
            });
        }
    } catch (err) {
        console.error('Error loading about:', err);
    }
}

// ===== FAQ SECTION =====
async function loadFAQ() {
    const container = document.getElementById('faq-accordion');
    if (!container) return;

    try {
        const response = await fetch('content/faq.md');
        if (!response.ok) throw new Error('Failed to load faq.md');

        const markdown = await response.text();

        // Parse Q&A pairs: lines starting with **Q: ...** followed by A: ...
        const pairs = [];
        const lines = markdown.split('\n');
        let currentQ = null;

        for (const line of lines) {
            const qMatch = line.match(/^\*\*Q:\s*(.+?)\*\*$/);
            const aMatch = line.match(/^A:\s*(.+)$/);

            if (qMatch) {
                currentQ = qMatch[1];
            } else if (aMatch && currentQ) {
                pairs.push({ q: currentQ, a: aMatch[1] });
                currentQ = null;
            }
        }

        if (pairs.length === 0) {
            container.innerHTML = '<p style="color: var(--cream); opacity: 0.6; text-transform: none;">FAQ coming soon...</p>';
            return;
        }

        container.innerHTML = pairs.map((pair, i) => {
            const tilt = ((Math.random() - 0.5) * 3).toFixed(1);
            return `
                <div class="faq-item" style="--tilt: ${tilt}deg">
                    <div class="faq-question" onclick="toggleFAQ(this)">${pair.q}</div>
                    <div class="faq-answer">${pair.a}</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading FAQ:', err);
    }
}

function toggleFAQ(el) {
    const item = el.parentElement;
    // Close others
    document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) other.classList.remove('open');
    });
    item.classList.toggle('open');
}

// ===== PRODUCT PHOTOS =====
async function loadProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    // Try manifest first
    let photos = [];
    try {
        const res = await fetch('static/img/products/manifest.json');
        if (res.ok) {
            const data = await res.json();
            photos = Array.isArray(data) ? data : (data.photos || []);
        }
    } catch {}

    // If no manifest, try sequential discovery
    if (photos.length === 0) {
        for (let i = 1; i <= 50; i++) {
            const path = `static/img/products/product${i}.jpeg`;
            try {
                const res = await fetch(path, { method: 'HEAD' });
                if (res.ok) {
                    photos.push(path);
                } else {
                    break;
                }
            } catch {
                break;
            }
        }
    }

    // Normalize paths
    photos = photos.map(p => p.startsWith('static/') ? p : `static/img/products/${p}`);

    if (photos.length === 0) {
        // Show placeholders
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

// ===== PROCESS PHOTOS =====
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

// ===== REVIEW TICKER =====
async function loadReviews() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    let reviews = [];
    try {
        const res = await fetch('content/reviews.json');
        if (res.ok) {
            reviews = await res.json();
        }
    } catch {}

    if (reviews.length === 0 || (reviews.length === 1 && reviews[0].text.includes('placeholder'))) {
        // Hide ticker if no real reviews
        const ticker = document.getElementById('review-ticker');
        if (ticker) ticker.style.display = 'none';
        document.body.style.paddingBottom = '0';
        return;
    }

    // Duplicate reviews for seamless loop
    const items = [...reviews, ...reviews].map(r => {
        const author = r.author ? ` — ${r.author}` : '';
        return `<span class="ticker-item">${r.text}${author}</span>`;
    }).join('');

    track.innerHTML = items;

    // Adjust animation speed based on content width
    requestAnimationFrame(() => {
        const trackWidth = track.scrollWidth / 2;
        const speed = Math.max(15, trackWidth / 50);
        track.style.animationDuration = `${speed}s`;
    });
}

// ===== WATER RIPPLE ON CLICK =====
function initRipples() {
    const container = document.getElementById('ripple-container');
    if (!container) return;

    document.addEventListener('click', (e) => {
        // Don't ripple on interactive elements
        if (e.target.closest('a, button, .faq-question, .nav-links, .product-card, .lang-toggle')) return;

        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        container.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('nav-links');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
}

// ===== SMOOTH SCROLL HEADER HIDE =====
function initHeaderBehavior() {
    const header = document.getElementById('main-header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    }, { passive: true });

    header.style.transition = 'transform 0.3s ease';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadAbout();
    loadFAQ();
    loadProducts();
    loadProcessPhotos();
    loadReviews();
    initRipples();
    initMobileMenu();
    initHeaderBehavior();
});
