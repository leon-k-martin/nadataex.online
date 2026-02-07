// ===== INTERACTIVE ELEMENTS =====

// Water ripple on click
function initRipples() {
    const container = document.getElementById('ripple-container');
    if (!container) return;

    document.addEventListener('mousedown', (e) => {
        if (e.target.closest('a, button, .faq-question, .nav-links, .product-card, .lang-toggle')) return;

        // Create multiple concentric ripples from the same point (like a stone in water)
        const numRipples = 3;
        
        for (let i = 0; i < numRipples; i++) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            
            // All ripples start from the exact same point
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            
            // Stagger the animation start time to create wave effect
            ripple.style.animationDelay = (i * 0.25) + 's';
            
            container.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        }
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

// Contact form handler — Formspree integration
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const button = form.querySelector('button');
        const originalText = button.textContent;
        
        // Show loading state
        button.textContent = 'sending...';
        button.disabled = true;
        
        try {
            // Submit to Formspree
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success feedback
                button.textContent = 'sent! ✓';
                button.style.background = 'var(--water-blue)';
                form.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                    button.disabled = false;
                }, 3000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            // Error feedback
            button.textContent = 'error — try again';
            button.style.background = 'var(--red)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
        }
    });
}
