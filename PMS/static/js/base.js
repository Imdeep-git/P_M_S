// Base JavaScript - Global functionality
class ThemeManager {
    constructor() {
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.body = document.body;
        this.init();
    }

    init() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Add event listener to toggle button
        if (this.darkModeToggle) {
            this.darkModeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        this.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (this.darkModeToggle) {
            const icon = this.darkModeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }

    toggleTheme() {
        const currentTheme = this.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

class NavigationManager {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking on nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
    }
}

class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        // Add fade-in animation to elements when they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe all cards and form elements
        const elementsToAnimate = document.querySelectorAll('.card, .form-group, .btn');
        elementsToAnimate.forEach(el => observer.observe(el));
    }

    // Smooth scroll to element
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Add loading animation
    showLoading(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        
        return () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }

    // Success notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add notification styles if they don't exist
        if (!document.querySelector('.notification-styles')) {
            const styles = document.createElement('style');
            styles.className = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 0.5rem;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 2000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 400px;
                    box-shadow: var(--shadow-heavy);
                }
                .notification-success { background-color: var(--success-color); }
                .notification-error { background-color: var(--error-color); }
                .notification-warning { background-color: var(--warning-color); }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    margin-left: auto;
                    padding: 0.25rem;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

class FormValidator {
    constructor() {
        this.validators = {
            required: (value) => value.trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value),
            minLength: (value, min) => value.length >= min,
            maxLength: (value, max) => value.length <= max,
            number: (value) => !isNaN(value) && isFinite(value),
            vehicleNumber: (value) => /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(value.replace(/\s/g, ''))
        };
    }

    validateField(field, rules) {
        const value = field.value;
        const errors = [];

        for (const rule of rules) {
            const [ruleName, ...params] = rule.split(':');
            const validator = this.validators[ruleName];

            if (validator && !validator(value, ...params)) {
                errors.push(this.getErrorMessage(ruleName, field.name, params));
            }
        }

        this.displayFieldError(field, errors);
        return errors.length === 0;
    }

    validateForm(form) {
        const fields = form.querySelectorAll('[data-validate]');
        let isValid = true;

        fields.forEach(field => {
            const rules = field.getAttribute('data-validate').split('|');
            if (!this.validateField(field, rules)) {
                isValid = false;
            }
        });

        return isValid;
    }

    displayFieldError(field, errors) {
        // Remove existing error message
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (errors.length > 0) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = errors[0];
            errorDiv.style.cssText = `
                color: var(--error-color);
                font-size: 0.875rem;
                margin-top: 0.25rem;
                animation: fadeIn 0.3s ease-in;
            `;
            field.parentElement.appendChild(errorDiv);
        } else {
            field.classList.remove('error');
        }
    }

    getErrorMessage(rule, fieldName, params) {
        const messages = {
            required: `${fieldName} is required`,
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid phone number',
            minLength: `${fieldName} must be at least ${params[0]} characters`,
            maxLength: `${fieldName} must not exceed ${params[0]} characters`,
            number: 'Please enter a valid number',
            vehicleNumber: 'Please enter a valid vehicle number (e.g., KA01AB1234)'
        };
        return messages[rule] || `Invalid ${fieldName}`;
    }
}

// Initialize global managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.navigationManager = new NavigationManager();
    window.animationManager = new AnimationManager();
    window.formValidator = new FormValidator();

    // Add real-time form validation
    document.addEventListener('input', (e) => {
        const field = e.target;
        if (field.hasAttribute('data-validate')) {
            const rules = field.getAttribute('data-validate').split('|');
            window.formValidator.validateField(field, rules);
        }
    });

    // Handle form submissions
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.hasAttribute('data-validate-form')) {
            e.preventDefault();
            if (window.formValidator.validateForm(form)) {
                // Form is valid, you can proceed with submission
                console.log('Form is valid, ready to submit');
            }
        }
    });
});

// Utility functions
window.utils = {
    // Generate random token/PIN
    generateToken: () => Math.random().toString(36).substr(2, 9).toUpperCase(),
    generatePin: () => Math.floor(1000 + Math.random() * 9000),

    // Format date
    formatDate: (date) => new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date),

    // Debounce function for search
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Local storage helpers
    storage: {
        get: (key) => {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch {
                return localStorage.getItem(key);
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch {
                localStorage.setItem(key, value);
            }
        },
        remove: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
    }
};