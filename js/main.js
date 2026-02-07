// ===== MAIN — initializes all modules =====

document.addEventListener('DOMContentLoaded', () => {
    // Force video autoplay (Safari needs explicit .play())
    const vid = document.querySelector('.water-video');
    if (vid) {
        vid.muted = true;
        vid.playbackRate = 0.5;
        vid.play().catch(() => {});
    }

    loadAbout();
    loadFAQ();
    loadProducts();
    loadProcessPhotos();
    loadReviews();
    initRipples();
    initMobileMenu();
    initHeaderBehavior();
});
