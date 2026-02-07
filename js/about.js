// ===== ABOUT SECTION — loads content/about.md =====

async function loadAbout() {
    const container = document.getElementById('about-content');
    const toggle = document.getElementById('lang-toggle');
    if (!container) return;

    try {
        const response = await fetch('content/about.md?v=' + Date.now());
        if (!response.ok) throw new Error('Failed to load about.md');

        const markdown = await response.text();
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
        fitAboutText(container);
        window.addEventListener('resize', () => fitAboutText(container));

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

// Dynamically scale font-size so about text fits its container without overflow
function fitAboutText(el) {
    let lo = 0.5;   // rem min
    let hi = 1.6;   // rem max

    function isOverflowing(element) {
        return element.scrollHeight > element.clientHeight + 1 ||
               element.scrollWidth > element.clientWidth + 1;
    }

    // Binary search for the largest font-size that doesn't overflow
    for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        el.style.fontSize = mid + 'rem';
        if (isOverflowing(el)) {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    el.style.fontSize = lo + 'rem';
}
