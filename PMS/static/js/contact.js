// Contact Page JavaScript
class ContactManager {
    constructor() {
        this.contactForm = document.getElementById('contactForm');
        this.messageTextarea = document.getElementById('message');
        this.charCount = document.getElementById('charCount');
        this.submitBtn = document.querySelector('.submit-btn');
        
        this.isLoading = false;
        this.maxChars = 1000;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupCharacterCounter();
    }

    setupEventListeners() {
        // Form submission
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Real-time validation
        const inputs = document.querySelectorAll('[data-validate]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
        }

        // Subject change handler
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) {
            subjectSelect.addEventListener('change', () => this.handleSubjectChange());
        }

        // Add floating label effects
        this.setupFloatingLabels();
    }

    setupFormValidation() {
        // Custom validation messages
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.showFieldError(emailInput, 'Please enter a valid email address');
            });
        }

        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.showFieldError(phoneInput, 'Please enter a valid phone number');
            });
        }
    }

    setupCharacterCounter() {
        if (this.messageTextarea && this.charCount) {
            this.messageTextarea.addEventListener('input', () => {
                const currentLength = this.messageTextarea.value.length;
                this.charCount.textContent = currentLength;
                
                const counterContainer = this.charCount.parentElement;
                
                if (currentLength > this.maxChars) {
                    counterContainer.classList.add('over-limit');
                    counterContainer.classList.remove('near-limit');
                    this.messageTextarea.value = this.messageTextarea.value.substring(0, this.maxChars);
                    this.charCount.textContent = this.maxChars;
                } else if (currentLength > this.maxChars * 0.8) {
                    counterContainer.classList.add('near-limit');
                    counterContainer.classList.remove('over-limit');
                } else {
                    counterContainer.classList.remove('near-limit', 'over-limit');
                }
            });
        }
    }

    setupFloatingLabels() {
        const formInputs = document.querySelectorAll('.form-input');
        formInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });

            // Check if input has value on load
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const rules = field.getAttribute('data-validate');
        
        if (!rules) return true;
        
        const ruleList = rules.split('|');
        let isValid = true;
        let errorMessage = '';

        for (const rule of ruleList) {
            const [ruleName, ...params] = rule.split(':');
            
            if (ruleName === 'required' && !value) {
                errorMessage = `${this.getFieldLabel(field)} is required`;
                isValid = false;
                break;
            } else if (ruleName === 'email' && value && !this.isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
                break;
            } else if (ruleName === 'phone' && value && !this.isValidPhone(value)) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
                break;
            } else if (ruleName === 'minLength' && value && value.length < parseInt(params[0])) {
                errorMessage = `${this.getFieldLabel(field)} must be at least ${params[0]} characters`;
                isValid = false;
                break;
            }
        }

        // Special validation for checkbox
        if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
            errorMessage = 'This field is required';
            isValid = false;
        }

        this.displayFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    displayFieldValidation(field, isValid, errorMessage) {
        this.clearFieldError(field);
        
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('success');
            setTimeout(() => field.classList.remove('success'), 2000);
        } else {
            field.classList.remove('success');
            field.classList.add('error');
            
            if (errorMessage) {
                this.showFieldError(field, errorMessage);
            }
        }
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentElement.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d+)/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d+)/, '($1) $2');
        }
        
        e.target.value = value;
    }

    handleSubjectChange() {
        const subjectSelect = document.getElementById('subject');
        const messageTextarea = document.getElementById('message');
        
        if (!subjectSelect || !messageTextarea) return;
        
        const subject = subjectSelect.value;
        const templates = {
            support: 'I am experiencing an issue with...',
            billing: 'I have a question about my billing/payment...',
            booking: 'I need help with my booking...',
            partnership: 'I am interested in partnering with Reserve My Spot...',
            feedback: 'I would like to provide feedback about...'
        };
        
        if (templates[subject] && !messageTextarea.value) {
            messageTextarea.placeholder = templates[subject];
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        // Validate all fields
        const inputs = this.contactForm.querySelectorAll('[data-validate]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            window.animationManager.showNotification('Please fix the errors and try again', 'error');
            return;
        }

        // Collect form data
        const formData = new FormData(this.contactForm);
        const contactData = Object.fromEntries(formData.entries());
        
        this.setLoadingState(true);

        try {
            await this.submitContactForm(contactData);
            this.showSuccessMessage();
        } catch (error) {
            window.animationManager.showNotification(error.message, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async submitContactForm(data) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate form submission
        console.log('Contact form submitted:', data);
        
        // Store submission data
        const submission = {
            id: 'CONTACT_' + Date.now(),
            ...data,
            submittedAt: new Date().toISOString(),
            status: 'received'
        };
        
        window.utils.storage.set(`contact_${submission.id}`, submission);
        
        return submission;
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Message...';
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
    }

    showSuccessMessage() {
        const formSection = document.querySelector('.contact-form-section');
        
        formSection.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for contacting us. We've received your message and will get back to you within 24 hours.</p>
                <div style="margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-envelope"></i> Send Another Message
                    </button>
                    <a href="index.html" class="btn btn-secondary" style="margin-left: 1rem;">
                        <i class="fas fa-home"></i> Back to Home
                    </a>
                </div>
            </div>
        `;

        window.animationManager.showNotification('Your message has been sent successfully!', 'success');
    }

    // FAQ functionality
    toggleFAQ(button) {
        const faqItem = button.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
        
        // Add animation effect
        button.style.transform = 'scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    getFieldLabel(field) {
        const label = field.closest('.form-group').querySelector('.form-label');
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/\D/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    }
}

// Initialize contact manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contactManager = new ContactManager();

    // Add interactive animations
    const contactMethods = document.querySelectorAll('.contact-method');
    contactMethods.forEach((method, index) => {
        method.style.opacity = '0';
        method.style.transform = 'translateY(20px)';
        setTimeout(() => {
            method.style.transition = 'all 0.6s ease-out';
            method.style.opacity = '1';
            method.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Add hover effects to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = '';
        });
    });

    // Add click effect to emergency number
    const emergencyNumber = document.querySelector('.emergency-number');
    if (emergencyNumber) {
        emergencyNumber.addEventListener('click', () => {
            window.animationManager.showNotification('Calling emergency support...', 'info');
        });
    }

    // Add scroll animations for FAQ items
    const faqItems = document.querySelectorAll('.faq-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    });

    faqItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.animationDelay = `${index * 0.1}s`;
        observer.observe(item);
    });
});