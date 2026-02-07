// ===== INTERACTIVE ELEMENTS =====

// Water ripple on click
function initRipples() {
    const container = document.getElementById('ripple-container');
    if (!container) return;

    document.addEventListener('click', (e) => {
        if (e.target.closest('a, button, .faq-question, .nav-links, .product-card, .lang-toggle')) return;

        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        container.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    });
}

// Mobile hamburger menu
function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('nav-links');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
}

// Header — always fixed, no hide on scroll
function initHeaderBehavior() {
    // Header stays fixed via CSS, no scroll-hide behavior
}
