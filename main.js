// Open Lab - Main JavaScript File
// Handles all interactive features, animations, and platform demos

// Global variables
let particleSystem;
let annotationCanvas, annotationCtx;
let currentTool = 'bbox';
let annotations = [];
let isDrawing = false;
let startX, startY;
let currentImageIndex = 0;

// Demo images for annotation
const demoImages = [
    'resources/data-visualization.jpg',
    'resources/annotation-workspace.jpg',
    'resources/case-study-1.jpg'
];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeParticleSystem();
    initializeTypedText();
    initializeCounters();
    initializeAnnotationDemo();
    initializeProgressChart();
    initializeScrollReveal();
    initializePartnerCarousel();
    initializeNavigation();
});

// Particle system for hero background
function initializeParticleSystem() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    new p5(function(p) {
        let particles = [];
        const numParticles = 50;
        
        p.setup = function() {
            p.createCanvas(window.innerWidth, window.innerHeight, canvas);
            
            // Create particles
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(2, 4),
                    opacity: p.random(0.3, 0.8)
                });
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Update and draw particles
            particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = p.width;
                if (particle.x > p.width) particle.x = 0;
                if (particle.y < 0) particle.y = p.height;
                if (particle.y > p.height) particle.y = 0;
                
                // Draw particle
                p.fill(0, 212, 170, particle.opacity * 255);
                p.noStroke();
                p.circle(particle.x, particle.y, particle.size);
                
                // Draw connections to nearby particles
                particles.forEach(other => {
                    const distance = p.dist(particle.x, particle.y, other.x, other.y);
                    if (distance < 100) {
                        const alpha = p.map(distance, 0, 100, 0.3, 0);
                        p.stroke(0, 212, 170, alpha * 255);
                        p.strokeWeight(1);
                        p.line(particle.x, particle.y, other.x, other.y);
                    }
                });
            });
        };
        
        p.windowResized = function() {
            p.resizeCanvas(window.innerWidth, window.innerHeight);
        };
    });
}

// Typed text animation for hero
function initializeTypedText() {
    const typedElement = document.getElementById('typed-text');
    if (!typedElement) return;
    
    const typed = new Typed('#typed-text', {
        strings: [
            'Transform Raw Data into AI Excellence',
            'Scale Your Data Annotation Pipeline',
            'Build Better AI Models Faster'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: false
    });
}

// Animated counters for metrics
function initializeCounters() {
    const counters = [
        { id: 'counter-1', target: 10, suffix: 'M+' },
        { id: 'counter-2', target: 99.5, suffix: '%' },
        { id: 'counter-3', target: 50, suffix: '%' }
    ];
    
    counters.forEach(counter => {
        const element = document.getElementById(counter.id);
        if (!element) return;
        
        anime({
            targets: { value: 0 },
            value: counter.target,
            duration: 2000,
            delay: 1000,
            easing: 'easeOutExpo',
            update: function(anim) {
                const value = anim.animatables[0].target.value;
                element.textContent = Math.round(value * 10) / 10 + counter.suffix;
            }
        });
    });
}

// Interactive annotation demo
function initializeAnnotationDemo() {
    annotationCanvas = document.getElementById('annotation-canvas');
    if (!annotationCanvas) return;
    
    annotationCtx = annotationCanvas.getContext('2d');
    const demoImage = document.getElementById('demo-image');
    
    // Set canvas size to match image
    function resizeCanvas() {
        annotationCanvas.width = demoImage.offsetWidth;
        annotationCanvas.height = demoImage.offsetHeight;
        redrawAnnotations();
    }
    
    demoImage.onload = resizeCanvas;
    window.addEventListener('resize', resizeCanvas);
    
    // Canvas event listeners
    annotationCanvas.addEventListener('mousedown', startAnnotation);
    annotationCanvas.addEventListener('mousemove', drawAnnotation);
    annotationCanvas.addEventListener('mouseup', endAnnotation);
    annotationCanvas.addEventListener('mouseout', endAnnotation);
    
    // Tool selection
    document.getElementById('bbox-tool')?.addEventListener('click', () => setTool('bbox'));
    document.getElementById('polygon-tool')?.addEventListener('click', () => setTool('polygon'));
    document.getElementById('clear-canvas')?.addEventListener('click', clearAnnotations);
    
    // Image navigation
    document.getElementById('prev-image')?.addEventListener('click', () => navigateImage(-1));
    document.getElementById('next-image')?.addEventListener('click', () => navigateImage(1));
    
    // Initialize metrics animation
    animateMetrics();
}

function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('#bbox-tool, #polygon-tool').forEach(btn => {
        btn.classList.remove('bg-accent-teal');
        btn.classList.add('bg-gray-600');
    });
    
    const activeBtn = document.getElementById(tool === 'bbox' ? 'bbox-tool' : 'polygon-tool');
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-600');
        activeBtn.classList.add('bg-accent-teal');
    }
}

function startAnnotation(e) {
    isDrawing = true;
    const rect = annotationCanvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
}

function drawAnnotation(e) {
    if (!isDrawing) return;
    
    const rect = annotationCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    redrawAnnotations();
    
    // Draw temporary annotation
    annotationCtx.strokeStyle = '#00d4aa';
    annotationCtx.lineWidth = 2;
    annotationCtx.setLineDash([5, 5]);
    
    if (currentTool === 'bbox') {
        const width = currentX - startX;
        const height = currentY - startY;
        annotationCtx.strokeRect(startX, startY, width, height);
    }
}

function endAnnotation(e) {
    if (!isDrawing) return;
    
    const rect = annotationCanvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    if (currentTool === 'bbox') {
        const annotation = {
            type: 'bbox',
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width: Math.abs(endX - startX),
            height: Math.abs(endY - startY),
            color: '#00d4aa'
        };
        annotations.push(annotation);
    }
    
    isDrawing = false;
    redrawAnnotations();
    updateMetrics();
}

function redrawAnnotations() {
    annotationCtx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
    
    annotations.forEach(annotation => {
        annotationCtx.strokeStyle = annotation.color;
        annotationCtx.lineWidth = 2;
        annotationCtx.setLineDash([]);
        
        if (annotation.type === 'bbox') {
            annotationCtx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        }
    });
}

function clearAnnotations() {
    annotations = [];
    redrawAnnotations();
    updateMetrics();
}

function navigateImage(direction) {
    currentImageIndex = (currentImageIndex + direction + demoImages.length) % demoImages.length;
    const demoImage = document.getElementById('demo-image');
    if (demoImage) {
        demoImage.src = demoImages[currentImageIndex];
        clearAnnotations();
    }
}

function updateMetrics() {
    // Simulate metric updates based on annotations
    const accuracy = Math.min(99.5, 95 + annotations.length * 0.5);
    const speed = Math.max(1.2, 3.5 - annotations.length * 0.1);
    const quality = Math.min(99.9, 95 + annotations.length * 0.3);
    
    // Update metric displays
    const accuracyElement = document.getElementById('accuracy-metric');
    const speedElement = document.getElementById('speed-metric');
    const qualityElement = document.getElementById('quality-metric');
    
    if (accuracyElement) accuracyElement.textContent = accuracy.toFixed(1) + '%';
    if (speedElement) speedElement.textContent = speed.toFixed(1) + 's/image';
    if (qualityElement) qualityElement.textContent = quality.toFixed(1) + '%';
    
    // Update progress bars
    const accuracyBar = document.getElementById('accuracy-bar');
    const speedBar = document.getElementById('speed-bar');
    const qualityBar = document.getElementById('quality-bar');
    
    if (accuracyBar) accuracyBar.style.width = accuracy + '%';
    if (speedBar) speedBar.style.width = (100 - (speed - 1) * 40) + '%';
    if (qualityBar) qualityBar.style.width = quality + '%';
}

function animateMetrics() {
    // Animate metrics periodically
    setInterval(() => {
        if (annotations.length > 0) {
            updateMetrics();
        }
    }, 2000);
}

// Progress chart initialization
function initializeProgressChart() {
    const chartElement = document.getElementById('progress-chart');
    if (!chartElement) return;
    
    const chart = echarts.init(chartElement);
    
    const option = {
        backgroundColor: 'transparent',
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisLine: { lineStyle: { color: '#6b7280' } },
            axisLabel: { color: '#9ca3af' }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#6b7280' } },
            axisLabel: { color: '#9ca3af' },
            splitLine: { lineStyle: { color: '#374151' } }
        },
        series: [{
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line',
            smooth: true,
            lineStyle: { color: '#00d4aa', width: 3 },
            itemStyle: { color: '#00d4aa' },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: 'rgba(0, 212, 170, 0.3)' },
                        { offset: 1, color: 'rgba(0, 212, 170, 0.05)' }
                    ]
                }
            }
        }]
    };
    
    chart.setOption(option);
    
    // Animate chart data periodically
    setInterval(() => {
        const newData = option.series[0].data.map(value => 
            value + Math.random() * 200 - 100
        );
        chart.setOption({
            series: [{
                data: newData
            }]
        });
    }, 3000);
}

// Scroll reveal animation
function initializeScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Partner carousel
function initializePartnerCarousel() {
    const carousel = document.getElementById('partner-carousel');
    if (!carousel) return;
    
    new Splide('#partner-carousel', {
        type: 'loop',
        perPage: 4,
        perMove: 1,
        autoplay: true,
        interval: 2000,
        arrows: false,
        pagination: false,
        gap: '2rem',
        breakpoints: {
            768: {
                perPage: 2
            },
            480: {
                perPage: 1
            }
        }
    }).mount();
}

// Navigation functionality
function initializeNavigation() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('button.md\\:hidden');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // CTA button handlers
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Start Free Trial')) {
            btn.addEventListener('click', () => showComingSoon('Free Trial'));
        } else if (btn.textContent.includes('Watch Demo')) {
            btn.addEventListener('click', () => showComingSoon('Demo'));
        } else if (btn.textContent.includes('Schedule Demo')) {
            btn.addEventListener('click', () => showComingSoon('Demo Scheduling'));
        } else if (btn.textContent.includes('Get Demo')) {
            btn.addEventListener('click', () => showComingSoon('Demo'));
        }
    });
}

function toggleMobileMenu() {
    // Mobile menu implementation
    console.log('Mobile menu toggled');
}

function showComingSoon(feature) {
    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-deep-slate rounded-xl p-8 max-w-md mx-4 text-center">
            <h3 class="text-2xl font-bold mb-4 text-white">Coming Soon!</h3>
            <p class="text-gray-400 mb-6">
                Our ${feature} feature is currently in development. 
                We'll notify you as soon as it's available!
            </p>
            <button onclick="this.closest('.fixed').remove()" 
                    class="btn-primary px-6 py-3 rounded-lg text-white font-semibold">
                Got it!
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Remove modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
window.addEventListener('resize', debounce(() => {
    // Handle resize events
    if (typeof particleSystem !== 'undefined' && particleSystem.windowResized) {
        particleSystem.windowResized();
    }
}, 250));

// Export functions for global access
window.OpenLab = {
    showComingSoon,
    toggleMobileMenu
};