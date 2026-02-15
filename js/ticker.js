// ===== FLOATING TESTIMONIALS — text rides on wave divider curves =====

async function loadReviews() {
    let reviews = [];
    try {
        const res = await fetch('content/reviews.json');
        if (res.ok) reviews = await res.json();
    } catch {}

    if (reviews.length === 0) return;

    // Collect wave dividers (skip hero — too prominent)
    const allDividers = Array.from(document.querySelectorAll('.wave-divider'));
    const dividers = allDividers.slice(1);
    if (dividers.length === 0) return;

    let lastIndex = -1;
    let lastDivider = -1;

    // Track visible dividers
    const visibleDividers = new Set();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) visibleDividers.add(e.target);
            else visibleDividers.delete(e.target);
        });
    }, { threshold: 0.1 });
    dividers.forEach(d => observer.observe(d));

    function showTestimonial(divider) {
        const svg = divider.querySelector('svg');
        if (!svg) return;
        const originalPath = svg.querySelector('path');
        if (!originalPath) return;

        // Pick review (avoid repeat)
        let idx;
        do { idx = Math.floor(Math.random() * reviews.length); }
        while (idx === lastIndex && reviews.length > 1);
        lastIndex = idx;

        // Extract wave curve only (strip the fill-closing L...Z)
        const fullD = originalPath.getAttribute('d');
        const waveD = fullD.replace(/\s*L[\d.,\s]+Z\s*$/i, '');

        // Unique ID for this path
        const pathId = 'wave-tp-' + Date.now();

        // Create invisible path for text to follow
        const NS = 'http://www.w3.org/2000/svg';
        const guidePath = document.createElementNS(NS, 'path');
        guidePath.setAttribute('id', pathId);
        guidePath.setAttribute('d', waveD);
        guidePath.setAttribute('fill', 'none');
        guidePath.setAttribute('stroke', 'none');

        // Use deep blue; cream on blue theme
        const isBlue = document.body.classList.contains('theme-blue');
        const fillColor = isBlue ? '#F5F0E8' : '#0818a8';

        // Create text element
        const textEl = document.createElementNS(NS, 'text');
        textEl.setAttribute('font-size', '11');
        textEl.setAttribute('font-family', "'Courier New', monospace");
        textEl.setAttribute('font-style', 'italic');
        textEl.setAttribute('fill', fillColor);
        textEl.setAttribute('opacity', '0');
        textEl.setAttribute('dy', '-4');

        const tp = document.createElementNS(NS, 'textPath');
        tp.setAttribute('href', '#' + pathId);
        tp.setAttribute('startOffset', '100%');
        tp.textContent = '\u201E' + reviews[idx].text + '\u201C';

        textEl.appendChild(tp);

        // Add defs for path, then the text
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS(NS, 'defs');
            svg.insertBefore(defs, svg.firstChild);
        }
        defs.appendChild(guidePath);
        svg.appendChild(textEl);

        // Animate startOffset from 100% → -100%  &  fade in/out
        const duration = 16000;
        const startTime = performance.now();

        function animate(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);

            // Move from 100% to -100%
            const offset = 100 - t * 200;
            tp.setAttribute('startOffset', offset + '%');

            // Gentle fade in/out
            let opacity = 0.55;
            if (t < 0.06) opacity = (t / 0.06) * 0.55;
            else if (t > 0.88) opacity = ((1 - t) / 0.12) * 0.55;
            textEl.setAttribute('opacity', opacity);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                textEl.remove();
                guidePath.remove();
            }
        }

        requestAnimationFrame(animate);
    }

    // Schedule recurring testimonials
    function scheduleNext() {
        const delay = 4000 + Math.random() * 4000;
        setTimeout(() => {
            if (visibleDividers.size > 0) {
                // Pick a visible divider (avoid repeat)
                const visible = Array.from(visibleDividers);
                let pick;
                do { pick = visible[Math.floor(Math.random() * visible.length)]; }
                while (pick === dividers[lastDivider] && visible.length > 1);
                lastDivider = dividers.indexOf(pick);
                showTestimonial(pick);
            }
            scheduleNext();
        }, delay);
    }

    // First one after 1.5s
    setTimeout(scheduleNext, 1500);
}
