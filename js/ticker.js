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

    // Track which dividers currently have an active testimonial
    const busyDividers = new Set();

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
        if (!svg) return Promise.resolve();
        const originalPath = svg.querySelector('path');
        if (!originalPath) return Promise.resolve();

        // Mark this divider as busy
        busyDividers.add(divider);

        // Pick review (avoid repeat)
        let idx;
        do { idx = Math.floor(Math.random() * reviews.length); }
        while (idx === lastIndex && reviews.length > 1);
        lastIndex = idx;

        // Get actual rendered dimensions
        const rect = divider.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height || 50;

        // Extract wave curve and rescale from 1200×60 viewBox to actual pixel size
        const fullD = originalPath.getAttribute('d');
        const waveD = fullD.replace(/\s*L[\d.,\s]+Z\s*$/i, '');
        const scaleX = w / 1200;
        const scaleY = h / 60;
        const scaledD = waveD.replace(/(\d+\.?\d*)/g, (match, num, offset, str) => {
            // Determine if this number is an X or Y coordinate
            // In SVG path data, coordinates alternate X,Y
            return match; // We'll use a transform instead
        });

        // Create an overlay SVG with correct aspect ratio
        const NS = 'http://www.w3.org/2000/svg';
        const overlaySvg = document.createElementNS(NS, 'svg');
        overlaySvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        overlaySvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        overlaySvg.style.cssText = `
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none; overflow: visible; z-index: 2;
        `;

        const pathId = 'wave-tp-' + Date.now();

        // Create guide path scaled to actual pixels
        const guidePath = document.createElementNS(NS, 'path');
        guidePath.setAttribute('id', pathId);
        guidePath.setAttribute('d', waveD);
        guidePath.setAttribute('fill', 'none');
        guidePath.setAttribute('stroke', 'none');
        guidePath.setAttribute('transform', `scale(${scaleX}, ${scaleY})`);

        const defs = document.createElementNS(NS, 'defs');
        defs.appendChild(guidePath);
        overlaySvg.appendChild(defs);

        // Use deep blue; cream on blue theme
        const isBlue = document.body.classList.contains('theme-blue');
        const fillColor = isBlue ? '#F5F0E8' : '#0818a8';

        // Font size: readable on mobile too
        const fontSize = Math.max(10, Math.min(14, w * 0.028));

        const textEl = document.createElementNS(NS, 'text');
        textEl.setAttribute('font-size', fontSize);
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
        overlaySvg.appendChild(textEl);
        divider.appendChild(overlaySvg);

        // Animate startOffset from 100% → -100%  &  fade in/out
        const duration = Math.max(10000, w * 30); // scale duration to width
        const startTime = performance.now();

        return new Promise((resolve) => {
            function animate(now) {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);

                const offset = 100 - t * 200;
                tp.setAttribute('startOffset', offset + '%');

                let opacity = 0.85;
                if (t < 0.06) opacity = (t / 0.06) * 0.85;
                else if (t > 0.88) opacity = ((1 - t) / 0.12) * 0.85;
                textEl.setAttribute('opacity', opacity);

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    overlaySvg.remove();
                    busyDividers.delete(divider);
                    resolve();
                }
            }

            requestAnimationFrame(animate);
        });
    }

    // Schedule recurring testimonials
    function scheduleNext() {
        const delay = 4000 + Math.random() * 4000;
        setTimeout(async () => {
            if (visibleDividers.size > 0) {
                // Only pick dividers that are visible AND not already showing a testimonial
                const available = Array.from(visibleDividers).filter(d => !busyDividers.has(d));
                if (available.length > 0) {
                    let pick;
                    do { pick = available[Math.floor(Math.random() * available.length)]; }
                    while (pick === dividers[lastDivider] && available.length > 1);
                    lastDivider = dividers.indexOf(pick);
                    showTestimonial(pick);
                }
            }
            scheduleNext();
        }, delay);
    }

    // First one after 1.5s
    setTimeout(scheduleNext, 1500);
}
