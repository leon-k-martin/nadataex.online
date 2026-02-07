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

    // Randomize float delays after all dynamic content is loaded
    setTimeout(initFloats, 100);
});

// ===== SCROLL HINT =====
function initScrollHint() {
    const scrollHint = document.getElementById('scroll-hint');
    const productGrid = document.getElementById('product-grid');

    if (!scrollHint || !productGrid) return;

    let hasScrolled = false;

    productGrid.addEventListener('scroll', () => {
        if (!hasScrolled && productGrid.scrollLeft > 10) {
            hasScrolled = true;
            scrollHint.classList.add('hidden');
            // Store in sessionStorage so it stays hidden
            sessionStorage.setItem('designsScrolled', 'true');
        }
    });

    // Check if user has already scrolled in this session
    if (sessionStorage.getItem('designsScrolled') === 'true') {
        scrollHint.classList.add('hidden');
    }
}
