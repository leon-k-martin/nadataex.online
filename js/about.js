// ===== ABOUT SECTION — loads content/about.md =====

async function loadAbout() {
    const container = document.getElementById('about-content');
    const toggle = document.getElementById('lang-toggle');
    if (!container) return;

    try {
        const response = await fetch('content/about.md?v=' + Date.now());
        if (!response.ok) {
            console.error('About fetch failed:', response.status, response.statusText);
            container.innerHTML = '<p style="color: var(--deep-blue);">Error loading content. Please refresh.</p>';
            throw new Error('Failed to load about.md');
        }

        const markdown = await response.text();
        if (!markdown || markdown.trim().length === 0) {
            console.error('About.md is empty');
            container.innerHTML = '<p style="color: var(--deep-blue);">Content unavailable.</p>';
            return;
        }
        
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

        // Auto-fit font size so text fills the box without overflow
        // Small delay to let layout settle before measuring
        requestAnimationFrame(() => {
            fitAboutText(container);
        });
        window.addEventListener('resize', () => fitAboutText(container));

        if (toggle) {
            toggle.addEventListener('click', () => {
                const showingDe = container.classList.toggle('show-de');
                toggle.textContent = showingDe ? 'en' : 'de';
                // Re-fit after language toggle since text length differs
                requestAnimationFrame(() => fitAboutText(container));
            });
        }
    } catch (err) {
        console.error('Error loading about:', err);
    }
}

// Dynamically scale font-size so about text fits its container without overflow.
// ALL text must always be visible — font shrinks as far as needed.
function fitAboutText(el) {
    const MIN_FONT = 0.35;  // rem — absolute minimum
    const MAX_FONT = 1.5;   // rem — ideal maximum
    let lo = MIN_FONT;
    let hi = MAX_FONT;

    // Temporarily allow overflow so we can measure true content size
    const origOverflow = el.style.overflow;
    el.style.overflow = 'auto';

    function isOverflowing() {
        // Multi-column overflow shows as scrollWidth > clientWidth
        // Normal overflow shows as scrollHeight > clientHeight
        return el.scrollHeight > el.clientHeight + 2 ||
               el.scrollWidth > el.clientWidth + 2;
    }

    // Binary search for the largest font-size that doesn't overflow
    for (let i = 0; i < 25; i++) {
        const mid = (lo + hi) / 2;
        el.style.fontSize = mid + 'rem';
        el.style.lineHeight = mid > 0.7 ? '1.7' : '1.5';
        // Force layout recalc
        void el.offsetHeight;
        if (isOverflowing()) {
            hi = mid;
        } else {
            lo = mid;
        }
    }

    // Use the last safe size
    el.style.fontSize = lo + 'rem';
    el.style.lineHeight = lo > 0.7 ? '1.7' : '1.5';
    // Restore overflow to hidden so text is never clipped by scroll
    el.style.overflow = 'hidden';
}
