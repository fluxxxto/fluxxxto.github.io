// Copyright 2024 fluxxxto.github.io \\

let currentSlide = 0;
const autoScrollInterval = 5000; 
let manualNavigationTimeout;

function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    if (n >= slides.length) {
        currentSlide = 0;
    } else if (n < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = n;
    }

    const slider = document.querySelector('.slider');
    const slideWidth = slides[currentSlide].clientWidth;

    clearTimeout(manualNavigationTimeout);
    manualNavigationTimeout = setTimeout(() => {
        startAutoScroll();
    }, 5000);

    slider.style.transition = 'transform 0.5s ease-in-out';
    slider.style.transform = `translateX(${-slideWidth * currentSlide}px)`;
}

function startAutoScroll() {
    setInterval(function () {
        showSlide(currentSlide + 1);
    }, autoScrollInterval);
}


showSlide(currentSlide);
startAutoScroll();
