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
