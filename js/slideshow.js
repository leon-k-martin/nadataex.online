// ===== HERO SLIDESHOW — cycles through product photos =====

const SLIDESHOW_IMAGES = [
    'static/img/products/webp/DSC02201.webp',
    'static/img/products/webp/DSC03345.webp',
    'static/img/products/webp/DSC03353.webp',
    'static/img/products/webp/DSC03380.webp',
    'static/img/products/webp/DSC03384.webp',
    'static/img/products/webp/DSC03579.webp',
    'static/img/products/webp/DSC03584.webp',
    'static/img/products/webp/DSC03601.webp',
    'static/img/products/webp/DSC03612.webp',
    'static/img/products/webp/DSC03632.webp',
    'static/img/products/webp/DSC03635.webp',
    'static/img/products/webp/DSC03674.webp',
    'static/img/products/webp/DSC03753.webp',
    'static/img/products/webp/DSC03754.webp',
    'static/img/products/webp/DSC03833.webp'
];

let currentSlide = 0;
let slideInterval = null;

function initSlideshow() {
    const container = document.getElementById('hero-slideshow');
    if (!container) return;

    // Create img elements for all slideshow images
    SLIDESHOW_IMAGES.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'NADAtäx product';
        if (i === 0) img.classList.add('active');
        container.appendChild(img);
    });

    // Start automatic slideshow (change every 4 seconds)
    slideInterval = setInterval(nextSlide, 4000);
}

function nextSlide() {
    const container = document.getElementById('hero-slideshow');
    if (!container) return;

    const images = container.querySelectorAll('img');
    if (images.length === 0) return;

    // Remove active from current
    images[currentSlide].classList.remove('active');

    // Move to next slide
    currentSlide = (currentSlide + 1) % images.length;

    // Add active to new current
    images[currentSlide].classList.add('active');
}
