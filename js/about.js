// ===== ABOUT SECTION — loads content/about.md =====

async function loadAbout() {
    const container = document.getElementById('about-content');
    const toggle = document.getElementById('lang-toggle');
    if (!container) return;

    try {
        const response = await fetch('content/about.md');
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
