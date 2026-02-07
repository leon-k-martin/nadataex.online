// ===== REVIEW TICKER — loads content/reviews.json =====

async function loadReviews() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    let reviews = [];
    try {
        const res = await fetch('content/reviews.json');
        if (res.ok) reviews = await res.json();
    } catch {}

    if (reviews.length === 0 || (reviews.length === 1 && reviews[0].text.includes('placeholder'))) {
        const ticker = document.getElementById('review-ticker');
        if (ticker) ticker.style.display = 'none';
        return;
    }

    // Duplicate for seamless infinite scroll
    const items = [...reviews, ...reviews].map(r => {
        const author = r.author ? ` — ${r.author}` : '';
        return `<span class="ticker-item">${r.text}${author}</span>`;
    }).join('');

    track.innerHTML = items;

    requestAnimationFrame(() => {
        const trackWidth = track.scrollWidth / 2;
        const speed = Math.max(15, trackWidth / 50);
        track.style.animationDuration = `${speed}s`;
    });
}
