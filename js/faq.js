// ===== FAQ SECTION — loads content/faq.md =====

async function loadFAQ() {
    const container = document.getElementById('faq-cards');
    const toggle = document.getElementById('faq-lang-toggle');
    if (!container) return;

    try {
        const response = await fetch('content/faq.md');
        if (!response.ok) throw new Error('Failed to load faq.md');

        const markdown = await response.text();

        // Check if there are language sections separated by ---
        const langSections = markdown.split(/\n---\n/);
        const enText = langSections[0] || '';
        const deText = langSections[1] || '';

        // Parse sections: ## title followed by paragraphs
        const parseSections = (text) => {
            const sections = [];
            const lines = text.split('\n');
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
            return sections;
        };

        const enSections = parseSections(enText);
        const deSections = parseSections(deText);

        if (enSections.length === 0) {
            container.innerHTML = '<p style="color: var(--deep-blue); opacity: 0.6; text-transform: none;">faq coming soon...</p>';
            return;
        }

        // Random tilts for each card
        const tilts = [-2.5, 1.8, -1.2, 2.8, -3.2, 1.5];

        const renderSections = (sections, langClass) => {
            return sections.map((section, i) => {
                const tilt = tilts[i % tilts.length];
                const content = section.content.map(p => `<p>${p}</p>`).join('');
                return `
                    <div class="faq-card faq-card-${langClass} float float-sm" style="--tilt: ${tilt}deg">
                        <h3>${section.title}</h3>
                        ${content}
                </div>
            `;
        }).join('');
        };

        let html = renderSections(enSections, 'en');
        if (deSections.length > 0) {
            html += renderSections(deSections, 'de');
        }

        container.innerHTML = html;

        // Re-init float delays for newly rendered cards
        if (typeof initFloats === 'function') initFloats();

        // Setup language toggle
        const images = document.getElementById('faq-images');
        if (toggle && images) {
            const hasGermanContent = deSections.length > 0;
            let showingText = false; // Start with images visible

            toggle.addEventListener('click', () => {
                showingText = !showingText;
                toggle.textContent = showingText ? 'en' : 'de';

                if (showingText) {
                    // Show text cards, hide images
                    container.style.display = '';
                    images.style.display = 'none';
                    // Only apply show-de class if German content exists
                    if (hasGermanContent) {
                        container.classList.add('show-de');
                    }
                    requestAnimationFrame(() => adjustFaqLayout());
                } else {
                    // Show English images, hide text
                    container.style.display = 'none';
                    images.style.display = '';
                    container.classList.remove('show-de');
                }
            });
        }

        adjustFaqLayout();
        window.addEventListener('resize', debounce(adjustFaqLayout, 150));
    } catch (err) {
        console.error('Error loading FAQ:', err);
        container.innerHTML = '<p style="color: var(--deep-blue);">Error loading FAQ</p>';
    }
}

// ===== FAQ LAYOUT MANAGEMENT =====

function initFAQToggle() {
    // Adjust layout on init
    const cards = document.getElementById('faq-cards');
    const images = document.getElementById('faq-images');
    if (!cards || !images) return;

    // Show images by default (English), hide text cards
    cards.style.display = 'none';
    images.style.display = '';

    // No need to adjust images - they use natural CSS flex-wrap

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

// Unified layout adjuster for both FAQ images and cards to avoid X+1 orphans
function adjustFaqLayout() {
    // Only adjust text cards - let images use natural CSS flex-wrap
    adjustFaqFlexItems('faq-cards', '.faq-card', 260);
}

function adjustFaqFlexItems(containerId, itemSelector, minWidth) {
    const container = document.getElementById(containerId);
    if (!container || container.style.display === 'none') return;

    const items = container.querySelectorAll(itemSelector);
    const count = items.length;
    if (count === 0) return;

    const containerWidth = container.clientWidth || container.offsetWidth;
    if (containerWidth <= 0) return;

    // Calculate how many items fit per row
    const gap = 20; // approximate gap
    let perRow = Math.floor(containerWidth / (minWidth + gap));
    perRow = Math.max(1, Math.min(perRow, count));

    // Avoid single orphan: if count % perRow === 1, reduce perRow
    while (perRow > 1 && count % perRow === 1) {
        perRow -= 1;
    }

    // Calculate flex-basis to fit perRow items
    const flexBasis = `calc(${100 / perRow}% - ${gap}px)`;

    items.forEach(item => {
        item.style.flexBasis = flexBasis;
    });
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
