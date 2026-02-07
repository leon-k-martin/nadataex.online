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
