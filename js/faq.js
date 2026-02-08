// ===== FAQ SECTION — loads content/faq.md =====

async function loadFAQ() {
    const container = document.getElementById('faq-cards');
    if (!container) return;

    try {
        const response = await fetch('content/faq.md');
        if (!response.ok) throw new Error('Failed to load faq.md');

        const markdown = await response.text();

        // Parse sections: ## title followed by paragraphs
        const sections = [];
        const lines = markdown.split('\n');
        let currentSection = null;

        for (const line of lines) {
            const headerMatch = line.match(/^##\s+(.+)$/);

            if (headerMatch) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = { title: headerMatch[1], content: [] };
            } else if (currentSection && line.trim()) {
                currentSection.content.push(line);
            }
        }

        // Add the last section
        if (currentSection) {
            sections.push(currentSection);
        }

        if (sections.length === 0) {
            container.innerHTML = '<p style="color: var(--deep-blue); opacity: 0.6; text-transform: none;">faq coming soon...</p>';
            return;
        }

        // Random tilts for each card
        const tilts = [-2.5, 1.8, -1.2, 2.8, -3.2, 1.5];

        container.innerHTML = sections.map((section, i) => {
            const tilt = tilts[i % tilts.length];
            const content = section.content.map(p => `<p>${p}</p>`).join('');
            return `
                <div class="faq-card float float-sm" style="--tilt: ${tilt}deg">
                    <h3>${section.title}</h3>
                    ${content}
                </div>
            `;
        }).join('');

        adjustFaqGridColumns();
        window.addEventListener('resize', debounce(adjustFaqGridColumns, 150));
    } catch (err) {
        console.error('Error loading FAQ:', err);
    }
}

// ===== FAQ VIEW TOGGLE — switch between text cards and image tiles =====

function initFAQToggle() {
    const toggle = document.getElementById('faq-view-toggle');
    const cards = document.getElementById('faq-cards');
    const images = document.getElementById('faq-images');
    if (!toggle || !cards || !images) return;

    // SVG icons for the two states
    const gridIcon = '<svg width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor"/><rect x="10" y="1" width="7" height="7" rx="1" fill="currentColor"/><rect x="1" y="10" width="7" height="7" rx="1" fill="currentColor"/><rect x="10" y="10" width="7" height="7" rx="1" fill="currentColor"/></svg>';
    const textIcon = '<svg width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="3" width="16" height="2" rx="1" fill="currentColor"/><rect x="1" y="8" width="12" height="2" rx="1" fill="currentColor"/><rect x="1" y="13" width="14" height="2" rx="1" fill="currentColor"/></svg>';

    let showingImages = true;

    toggle.addEventListener('click', () => {
        showingImages = !showingImages;
        if (showingImages) {
            cards.style.display = 'none';
            images.style.display = '';
            toggle.innerHTML = textIcon;
            toggle.title = 'show text';
        } else {
            cards.style.display = '';
            images.style.display = 'none';
            toggle.innerHTML = gridIcon;
            toggle.title = 'show images';
            // Re-adjust columns now that cards are visible
            requestAnimationFrame(() => adjustFaqGridColumns());
        }
    });

    // Click-to-enlarge FAQ tiles using the existing lightbox
    const tiles = images.querySelectorAll('.faq-tile');
    const faqSrcs = Array.from(tiles).map(img => img.src);

    tiles.forEach((tile, i) => {
        tile.style.cursor = 'pointer';
        tile.addEventListener('click', () => {
            openFAQLightbox(i, faqSrcs);
        });
    });
}

// Keep bottom row from having a single orphan card by adjusting column count dynamically
function adjustFaqGridColumns() {
    const grid = document.getElementById('faq-cards');
    if (!grid) return;
    const cards = grid.querySelectorAll('.faq-card');
    const count = cards.length;
    if (count === 0) return;

    // Use grid width, but fall back to parent section width if grid is hidden (display:none)
    let containerWidth = grid.clientWidth;
    if (containerWidth === 0) {
        const section = grid.closest('section') || grid.parentElement;
        containerWidth = section ? section.clientWidth - 40 : window.innerWidth - 40; // 40 = section padding
    }
    if (containerWidth <= 0) return;

    const targetMin = 260;
    const maxCols = Math.min(5, count);

    let cols = Math.max(1, Math.min(maxCols, Math.floor(containerWidth / targetMin)));
    cols = Math.min(cols, count);

    // Avoid 1-card remainder by stepping down until remainder != 1 or cols == 1
    while (cols > 1 && count % cols === 1) {
        cols -= 1;
    }

    // Safety: ensure width fit
    while (cols > 1 && containerWidth / cols < targetMin - 1) {
        cols -= 1;
    }

    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
}

// Lightweight debounce helper
function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

function openFAQLightbox(index, sources) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lb || !img || sources.length === 0) return;

    // Temporarily override lightbox nav to use FAQ sources
    let faqIdx = index;
    img.src = sources[faqIdx];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Store references for nav override
    lb._faqSources = sources;
    lb._faqIndex = faqIdx;
    lb._isFAQ = true;
}
