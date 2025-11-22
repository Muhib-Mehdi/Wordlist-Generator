// ============================================
// Custom Cursor Implementation
// ============================================

'use strict';

const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
const rippleContainer = document.getElementById('rippleContainer');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let trailX = 0;
let trailY = 0;

// Trail positions array for smooth trailing effect
const trailPositions = [];
const MAX_TRAIL_LENGTH = 8;

// Check if device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// Initialize cursor
if (!isMobile) {
    initCursor();
}

// ============================================
// Cursor Movement
// ============================================

function initCursor() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Add hover effect to clickable elements (including dynamically added ones)
    function addHoverEffects() {
        const hoverElements = document.querySelectorAll('[data-cursor-hover], a, button, input[type="range"], input[type="number"]');
        hoverElements.forEach(el => {
            // Remove existing listeners to avoid duplicates
            el.removeEventListener('mouseenter', handleMouseEnter);
            el.removeEventListener('mouseleave', handleMouseLeave);
            
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
        });
    }
    
    function handleMouseEnter() {
        cursor.classList.add('hover');
    }
    
    function handleMouseLeave() {
        cursor.classList.remove('hover');
    }
    
    addHoverEffects();
    
    // Re-add hover effects when quantum page becomes active
    const quantumPage = document.getElementById('quantumPage');
    if (quantumPage) {
        const observer = new MutationObserver(() => {
            if (quantumPage.classList.contains('active')) {
                setTimeout(addHoverEffects, 100);
            }
        });
        observer.observe(quantumPage, { attributes: true });
    }

    // Click ripple effect
    document.addEventListener('click', (e) => {
        createRipple(e.clientX, e.clientY);
    });

    // Animate cursor with smooth trailing
    animateCursor();
}

function animateCursor() {
    // Smooth cursor movement with easing
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    // Trail movement (more delay)
    trailX += (mouseX - trailX) * 0.08;
    trailY += (mouseY - trailY) * 0.08;

    // Update cursor position
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Update trail position
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    cursorTrail.style.opacity = '0.6';

    // Store trail positions
    trailPositions.push({ x: cursorX, y: cursorY, opacity: 1 });
    if (trailPositions.length > MAX_TRAIL_LENGTH) {
        trailPositions.shift();
    }

    // Fade trail positions
    trailPositions.forEach((pos, index) => {
        pos.opacity = Math.max(0, pos.opacity - 0.15);
    });

    requestAnimationFrame(animateCursor);
}

// ============================================
// Ripple Effect
// ============================================

function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    rippleContainer.appendChild(ripple);
    
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

// ============================================
// Particle Background Animation
// ============================================

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const PARTICLE_COUNT = 50;

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class
class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 234, 255, ${this.opacity})`;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 234, 255, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Initialize particles
function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}

initParticles();

// Animate particles
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connections between nearby particles
    particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = `rgba(0, 234, 255, ${0.1 * (1 - distance / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// ============================================
// Mobile Touch Ripple Effect
// ============================================

if (isMobile) {
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        createTouchRipple(touch.clientX, touch.clientY);
    });

    document.addEventListener('click', (e) => {
        createTouchRipple(e.clientX, e.clientY);
    });
}

function createTouchRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    document.body.appendChild(ripple);
    
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

// ============================================
// Performance Optimization
// ============================================

// Throttle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeCanvas();
        initParticles();
    }, 250);
});

// ============================================
// Page Transition
// ============================================

const mainContainer = document.getElementById('mainContainer');
const quantumPage = document.getElementById('quantumPage');
const exploreButton = document.getElementById('exploreButton');
const backButton = document.getElementById('backButton');

if (exploreButton) {
    exploreButton.addEventListener('click', () => {
        mainContainer.style.opacity = '0';
        mainContainer.style.pointerEvents = 'none';
        
        setTimeout(() => {
            quantumPage.style.display = 'block';
            setTimeout(() => {
                quantumPage.classList.add('active');
            }, 10);
        }, 300);
    });
}

if (backButton) {
    backButton.addEventListener('click', () => {
        quantumPage.classList.remove('active');
        
        setTimeout(() => {
            quantumPage.style.display = 'none';
            mainContainer.style.opacity = '1';
            mainContainer.style.pointerEvents = 'all';
        }, 500);
    });
}

