// ===== MAIN — initializes all modules =====

document.addEventListener('DOMContentLoaded', () => {
    // Force video autoplay (Safari needs explicit .play())
    const vid = document.querySelector('.water-video');
    if (vid) {
        vid.muted = true;
        vid.playbackRate = 0.5;
        vid.play().catch(() => {});
    }

    initSlideshow();
    loadAbout();
    loadFAQ();
    loadProducts();
    loadProcessPhotos();
    loadReviews();
    initRipples();
    initMobileMenu();
    initHeaderBehavior();
    initContactForm();
    initViewToggle();
    initFAQToggle();
    initLightbox();
    initScrollHint();
    initThemeToggle();
    initCursorTouch();

    // Randomize float delays after all dynamic content is loaded
    setTimeout(initFloats, 100);
});

// ===== SCROLL HINT =====
function initScrollHint() {
    const scrollHint = document.getElementById('scroll-hint');
    const productGrid = document.getElementById('product-grid');

    if (!scrollHint || !productGrid) return;

    let hasScrolled = false;
    let armed = false; // only hide after an intentional user interaction

    // Always show hint on load; hide only after intent + scroll
    scrollHint.classList.remove('hidden');

    const hideHintIfNeeded = () => {
        if (hasScrolled || !armed) return;
        if (productGrid.scrollLeft > 30) {
            hasScrolled = true;
            scrollHint.classList.add('hidden');
        }
    };

    // Arm hiding only after user intent
    ['pointerdown', 'wheel', 'touchstart'].forEach(evt => {
        productGrid.addEventListener(evt, () => {
            armed = true;
        }, { passive: true });
    });

    productGrid.addEventListener('scroll', hideHintIfNeeded, { passive: true });
}

// ===== CURSOR TOUCH/CROSS-DEVICE =====
function initCursorTouch() {
    let openTimeout;
    const closeCursor = () => {
        if (openTimeout) clearTimeout(openTimeout);
        document.body.classList.add('cursor-closed');
    };
    const openCursor = (delay = 0) => {
        if (openTimeout) clearTimeout(openTimeout);
        openTimeout = setTimeout(() => {
            document.body.classList.remove('cursor-closed');
        }, delay);
    };

    // Pointer events cover mouse, pen, touch. Give tap a brief linger before reopening.
    document.addEventListener('pointerdown', closeCursor, { passive: true });
    document.addEventListener('pointerup', () => openCursor(180), { passive: true });
    document.addEventListener('pointercancel', () => openCursor(0), { passive: true });
    document.addEventListener('pointerleave', () => openCursor(0), { passive: true });
}
