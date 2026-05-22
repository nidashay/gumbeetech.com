// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            updateActiveNav();
        }
    });
});

// Update active navigation link on scroll
function updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

updateActiveNav();

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all service cards and stat cards
document.querySelectorAll('.service-card, .stat-card, .info-card').forEach(card => {
    observer.observe(card);
});

// CTA Button ripple effect
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
}

// Form submission handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;

        // Create mailto link
        const mailtoLink = `mailto:clintongethix@gmail.com?subject=New Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;

        // Open email client
        window.location.href = mailtoLink;

        // Show success feedback
        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Message Sent! ✓';
        submitButton.style.background = 'linear-gradient(135deg, #00d4ff, #00a3cc)';

        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.style.background = '';
            this.reset();
        }, 3000);
    });
}

// Parallax effect for hero section
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.bubble');
        parallaxElements.forEach((el, index) => {
            el.style.transform = `translateY(${scrolled * 0.5 + (index * 10)}px)`;
        });
    });
}

// Add scroll animations to bubble elements
const bubbles = document.querySelectorAll('.bubble');
bubbles.forEach((bubble, index) => {
    const randomDuration = 4 + Math.random() * 2;
    bubble.style.animationDuration = randomDuration + 's';
    bubble.style.animationDelay = (index * 0.3) + 's';
});

// Enhanced hover effect for service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
        this.querySelector('.service-icon').style.animation = 'bounce 0.6s ease-out';
    });

    card.addEventListener('mouseleave', function() {
        this.querySelector('.service-icon').style.animation = '';
    });
});

// Animated counter for stats
const animateCounter = (element, target, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
};

// Start counter animation when visible
const statCards = document.querySelectorAll('.stat-card h3');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.textContent);
            animateCounter(entry.target, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statCards.forEach(card => {
    statsObserver.observe(card);
});

// Mobile menu responsiveness (optional enhancement)
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Close menu if it was open (for future mobile menu implementation)
            document.body.scrollIntoView({ behavior: 'smooth' });
        });
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modals (if implemented)
    }
});

// Prevent multiple form submissions
let isFormSubmitting = false;
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        if (isFormSubmitting) {
            e.preventDefault();
            return;
        }
        isFormSubmitting = true;
        setTimeout(() => {
            isFormSubmitting = false;
        }, 3000);
    });
}

// Log page performance
window.addEventListener('load', function() {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page Load Time: ' + pageLoadTime + 'ms');
});

// Animate elements on load
window.addEventListener('load', function() {
    document.querySelectorAll('[class*="animate"]').forEach(el => {
        el.style.opacity = '1';
    });
});
