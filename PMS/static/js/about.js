// About Page JavaScript
class AboutPage {
    constructor() {
        this.init();
    }

    init() {
        this.animateStats();
        this.setupScrollAnimations();
        this.setupInteractiveElements();
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    animateNumber(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format numbers with commas
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const elementsToAnimate = document.querySelectorAll(`
            .feature-card,
            .step-item,
            .benefit-category,
            .highlight-item,
            .mission-text h3,
            .mission-text p
        `);

        elementsToAnimate.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.animationDelay = `${index * 0.1}s`;
            observer.observe(element);
        });
    }

    setupInteractiveElements() {
        // Add interactive hover effects to floating cards
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.05)';
                card.style.background = 'rgba(255, 255, 255, 0.25)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.background = 'rgba(255, 255, 255, 0.15)';
            });
        });

        // Add click effects to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(37, 99, 235, 0.3);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                const rect = card.getBoundingClientRect();
                const size = 50;
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (rect.width / 2 - size / 2) + 'px';
                ripple.style.top = (rect.height / 2 - size / 2) + 'px';
                
                card.style.position = 'relative';
                card.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add parallax effect to sections
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const hero = document.querySelector('.hero-section');
            const cta = document.querySelector('.cta-section');
            
            if (hero) {
                hero.style.transform = `translateY(${scrollY * 0.3}px)`;
            }
            
            if (cta) {
                const ctaTop = cta.offsetTop;
                const windowHeight = window.innerHeight;
                if (scrollY + windowHeight > ctaTop) {
                    const parallaxValue = (scrollY + windowHeight - ctaTop) * -0.2;
                    cta.style.transform = `translateY(${parallaxValue}px)`;
                }
            }
        });

        // Add step animation on hover
        const stepItems = document.querySelectorAll('.step-item');
        stepItems.forEach((step, index) => {
            step.addEventListener('mouseenter', () => {
                const stepNumber = step.querySelector('.step-number');
                const stepVisual = step.querySelector('.step-visual');
                
                stepNumber.style.transform = 'scale(1.2) rotate(10deg)';
                stepVisual.style.transform = 'scale(1.1) rotate(-5deg)';
                
                // Add glow effect
                step.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.2)';
                step.style.transform = 'translateY(-5px)';
            });

            step.addEventListener('mouseleave', () => {
                const stepNumber = step.querySelector('.step-number');
                const stepVisual = step.querySelector('.step-visual');
                
                stepNumber.style.transform = '';
                stepVisual.style.transform = '';
                step.style.boxShadow = '';
                step.style.transform = '';
            });
        });

        // Add smooth scrolling to CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-actions .btn');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Add click animation
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
        });

        // Add typing effect to hero title
        this.addTypingEffect();

        // Add progress indicator
        this.addProgressIndicator();
    }

    addTypingEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid white';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        // Start typing after a delay
        setTimeout(typeWriter, 1000);
    }

    addProgressIndicator() {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--primary-color);
            z-index: 9999;
            transition: width 0.25s ease;
            box-shadow: 0 0 10px var(--primary-color);
        `;
        document.body.appendChild(progressBar);

        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // Add smooth reveal animations for benefit items
    setupBenefitAnimations() {
        const benefitItems = document.querySelectorAll('.benefit-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInLeft 0.6s ease-out forwards';
                    observer.unobserve(entry.target);
                }
            });
        });

        benefitItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.animationDelay = `${index * 0.1}s`;
            observer.observe(item);
        });
    }
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .feature-card {
        cursor: pointer;
    }

    .step-item {
        transition: all 0.3s ease;
    }

    .floating-card {
        cursor: pointer;
    }

    /* Smooth transitions for all interactive elements */
    .feature-icon,
    .step-number,
    .step-visual,
    .benefit-item {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initialize About page functionality
document.addEventListener('DOMContentLoaded', () => {
    new AboutPage();
});