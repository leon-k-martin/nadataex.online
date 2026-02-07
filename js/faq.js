// ===== FAQ SECTION — loads content/faq.md =====

async function loadFAQ() {
    const container = document.getElementById('faq-accordion');
    if (!container) return;

    try {
        const response = await fetch('content/faq.md');
        if (!response.ok) throw new Error('Failed to load faq.md');

        const markdown = await response.text();

        // Parse Q&A pairs: **Q: ...** followed by A: ...
        const pairs = [];
        const lines = markdown.split('\n');
        let currentQ = null;

        for (const line of lines) {
            const qMatch = line.match(/^\*\*Q:\s*(.+?)\*\*$/);
            const aMatch = line.match(/^A:\s*(.+)$/);

            if (qMatch) {
                currentQ = qMatch[1];
            } else if (aMatch && currentQ) {
                pairs.push({ q: currentQ, a: aMatch[1] });
                currentQ = null;
            }
        }

        if (pairs.length === 0) {
            container.innerHTML = '<p style="color: var(--cream); opacity: 0.6; text-transform: none;">FAQ coming soon...</p>';
            return;
        }

        container.innerHTML = pairs.map((pair) => {
            const tilt = ((Math.random() - 0.5) * 3).toFixed(1);
            return `
                <div class="faq-item" style="--tilt: ${tilt}deg">
                    <div class="faq-question" onclick="toggleFAQ(this)">${pair.q}</div>
                    <div class="faq-answer">${pair.a}</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading FAQ:', err);
    }
}

function toggleFAQ(el) {
    const item = el.parentElement;
    document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) other.classList.remove('open');
    });
    item.classList.toggle('open');
}
