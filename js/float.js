// ===== FLOAT — randomize delays for organic feel =====

function initFloats() {
    // Use negative delays to stagger — starts each element at a random
    // point in its cycle, no visible pop-in or restart
    document.querySelectorAll('.float').forEach(el => {
        const offset = -(Math.random() * 4).toFixed(2);
        el.style.animationDelay = offset + 's';
    });
}
