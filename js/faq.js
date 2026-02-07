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
