// Register Organization JavaScript
class RegistrationManager {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.steps = document.querySelectorAll('.form-step');
        this.progressSteps = document.querySelectorAll('.progress-steps .step');
        this.stepLines = document.querySelectorAll('.step-line');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.submitBtn = document.getElementById('submitBtn');
        
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordValidation();
        this.updateStepDisplay();
    }

    setupEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousStep());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextStep());
        }


        // Password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => this.togglePassword(toggle));
        });

        // Real-time validation
        const inputs = document.querySelectorAll('[data-validate]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Password strength monitoring
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.updatePasswordStrength());
        }

        // Confirm password validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
        }

        
    }

    setupPasswordValidation() {
        const passwordInput = document.getElementById('password');
        const strengthDiv = document.getElementById('passwordStrength');
        
        if (passwordInput && strengthDiv) {
            // Create strength bars
            for (let i = 0; i < 4; i++) {
                const bar = document.createElement('div');
                bar.className = 'strength-bar';
                strengthDiv.appendChild(bar);
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
            }
        }
    }

    updateStepDisplay() {
        // Update form steps
        this.steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update progress steps
        this.progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
            step.classList.toggle('completed', index + 1 < this.currentStep);
        });

        // Update step lines
        this.stepLines.forEach((line, index) => {
            line.classList.toggle('completed', index + 1 < this.currentStep);
        });

        // Update navigation buttons
        this.prevBtn.style.display = this.currentStep === 1 ? 'none' : 'flex';
        this.nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'flex';
        this.submitBtn.style.display = this.currentStep === this.totalSteps ? 'flex' : 'none';

        // Add animation to current step
        const activeStep = document.querySelector('.form-step.active');
        if (activeStep) {
            activeStep.style.opacity = '0';
            activeStep.style.transform = 'translateX(20px)';
            setTimeout(() => {
                activeStep.style.transition = 'all 0.3s ease-out';
                activeStep.style.opacity = '1';
                activeStep.style.transform = 'translateX(0)';
            }, 50);
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('[data-validate]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Additional validation for step 3 (password matching)
        if (this.currentStep === 3) {
            if (!this.validatePasswordMatch()) {
                isValid = false;
            }
        }

        if (!isValid) {
            window.animationManager.showNotification('Please fix the errors before proceeding', 'error');
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const rules = field.getAttribute('data-validate').split('|');
        let isValid = true;
        let errorMessage = '';

        for (const rule of rules) {
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
            } else if (ruleName === 'number' && value && isNaN(value)) {
                errorMessage = 'Please enter a valid number';
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

    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmField = document.getElementById('confirmPassword');

        if (confirmPassword && password !== confirmPassword) {
            this.displayFieldValidation(confirmField, false, 'Passwords do not match');
            return false;
        } else if (confirmPassword) {
            this.displayFieldValidation(confirmField, true, '');
            return true;
        }
        return true;
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
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.textContent = errorMessage;
                field.parentElement.appendChild(errorDiv);
            }
        }
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    updatePasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthDiv = document.getElementById('passwordStrength');
        const bars = strengthDiv.querySelectorAll('.strength-bar');
        
        const strength = this.calculatePasswordStrength(password);
        const strengthLevel = strength < 2 ? 'weak' : strength < 4 ? 'medium' : 'strong';
        
        // Update strength bars
        bars.forEach((bar, index) => {
            bar.classList.toggle('filled', index < strength);
        });
        
        // Update strength class
        strengthDiv.className = `password-strength ${strengthLevel}`;
        strengthDiv.setAttribute('data-strength', strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1));
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return Math.min(strength, 4);
    }

    togglePassword(toggle) {
        const targetId = toggle.getAttribute('data-target');
        const targetInput = document.getElementById(targetId);
        const icon = toggle.querySelector('i');
        
        if (targetInput.type === 'password') {
            targetInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            targetInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
        
        // Add animation
        toggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            toggle.style.transform = 'scale(1)';
        }, 100);
    }

   

    saveCurrentStepData() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                this.formData[input.name] = input.checked;
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    async handleSubmit(e) {
        
        if (!this.validateCurrentStep()) {
            return;
        }

        this.saveCurrentStepData();
        this.setLoadingState(true);

        try {
            // Simulate API call
            await this.submitRegistration(this.formData);
            this.showSuccessMessage();
        } catch (error) {
            window.animationManager.showNotification(error.message, 'error');
            this.setLoadingState(false);
        }
    }

    async submitRegistration(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if organization already exists (simulation)
        if (data.email === 'existing@example.com') {
            throw new Error('An organization with this email already exists');
        }

        // Store registration data
        window.utils.storage.set('registrationData', {
            ...data,
            registrationDate: new Date().toISOString(),
            status: 'pending_approval'
        });
    }

    setLoadingState(loading) {
        const submitBtn = this.submitBtn;
        
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Register Organization';
        }
    }

    showSuccessMessage() {
        const container = document.querySelector('.register-container');
        container.innerHTML = `
            <div class="success-animation">
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <h2 style="color: var(--text-primary); margin-bottom: 1rem;">Registration Successful!</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    Thank you for registering your organization with Reserve My Spot. 
                    Your application is now under review and you will receive a confirmation email shortly.
                </p>
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Next Steps:</h4>
                    <ul style="text-align: left; color: var(--text-secondary); max-width: 400px; margin: 0 auto;">
                        <li style="margin-bottom: 0.5rem;">Check your email for confirmation</li>
                        <li style="margin-bottom: 0.5rem;">Admin review (1-2 business days)</li>
                        <li style="margin-bottom: 0.5rem;">Account activation notification</li>
                        <li>Access to organization dashboard</li>
                    </ul>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-home"></i> Back to Home
                    </a>
                    <a href="login.html" class="btn btn-secondary">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                </div>
            </div>
        `;
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

// Initialize registration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationManager();

    // Add interactive features
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

    // Add hover effects to progress steps
    const progressSteps = document.querySelectorAll('.progress-steps .step');
    progressSteps.forEach((step, index) => {
        step.addEventListener('mouseenter', () => {
            if (!step.classList.contains('active')) {
                step.style.transform = 'scale(1.05)';
            }
        });

        step.addEventListener('mouseleave', () => {
            step.style.transform = 'scale(1)';
        });
    });
});

