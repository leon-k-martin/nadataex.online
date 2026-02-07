// ===== FLOAT — randomize delays for organic feel =====

function initFloats() {
    document.querySelectorAll('.float').forEach(el => {
        // Random delay between 0s and 3s so elements don't bob in sync
        const delay = (Math.random() * 3).toFixed(2);
        el.style.setProperty('--float-delay', delay + 's');

        // Slight speed variation (±20%) for extra randomness
        const baseSpeed = parseFloat(
            getComputedStyle(el).getPropertyValue('--float-speed') || '4'
        );
        const speed = (baseSpeed * (0.8 + Math.random() * 0.4)).toFixed(2);
        el.style.setProperty('--float-speed', speed + 's');
    });
}
