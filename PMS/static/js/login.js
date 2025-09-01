// Login Page JavaScript
class LoginManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.roleTabs = document.querySelectorAll('.role-tab');
        this.demoFillBtns = document.querySelectorAll('.demo-fill-btn');

        this.currentRole = 'organization'; // Default role
        this.isLoading = false;

        // Add hidden input for role if not present
        if (this.loginForm && !this.loginForm.querySelector('input[name="role"]')) {
            const roleInput = document.createElement('input');
            roleInput.type = 'hidden';
            roleInput.name = 'role';
            roleInput.value = this.currentRole;
            this.loginForm.appendChild(roleInput);
        }

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.loadSavedCredentials();
        this.switchRole(this.currentRole);
    }

    setupEventListeners() {
        // Role tab switching
        this.roleTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchRole(tab.dataset.role));
        });

        // Password toggle
        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Demo credential buttons
        this.demoFillBtns.forEach(btn => {
            btn.addEventListener('click', () => this.fillDemoCredentials(btn));
        });

        // Form submission
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Real-time validation
        [this.emailInput, this.passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            }
        });
    }

    setupFormValidation() {
        if (this.emailInput) {
            this.emailInput.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.showFieldError(this.emailInput, 'Please enter a valid email address');
            });
        }

        if (this.passwordInput) {
            this.passwordInput.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.showFieldError(this.passwordInput, 'Password must be at least 6 characters long');
            });
        }
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;

        const icon = this.passwordToggle.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';

        this.passwordToggle.style.transform = 'scale(0.8)';
        setTimeout(() => this.passwordToggle.style.transform = 'scale(1)', 100);
    }

    typeText(element, text, callback) {
        let i = 0;
        element.value = '';
        const typeInterval = setInterval(() => {
            element.value += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(typeInterval);
                if (callback) callback();
            }
        }, 50);
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        if (field === this.emailInput) {
            if (!value) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!this.isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
        } else if (field === this.passwordInput) {
            if (!value) {
                errorMessage = 'Password is required';
                isValid = false;
            } else if (value.length < 6) {
                errorMessage = 'Password must be at least 6 characters long';
                isValid = false;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
            field.classList.add('success');
            setTimeout(() => field.classList.remove('success'), 2000);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;

        field.parentElement.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.isLoading) return;

        const emailValid = this.validateField(this.emailInput);
        const passwordValid = this.validateField(this.passwordInput);

        if (!emailValid || !passwordValid) {
            window.animationManager?.showNotification?.('Please fix the errors and try again', 'error');
            return;
        }

        // Update role before submission
        const roleInput = this.loginForm.querySelector('input[name="role"]');
        if (roleInput) {
            roleInput.value = this.currentRole;
        }

        this.setLoadingState(true);
        this.loginForm.submit();
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        const submitBtn = this.loginForm.querySelector('.btn-login');

        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    }

    saveCredentials(email) {
        window.utils?.storage?.set('savedEmail', email);
    }

    clearSavedCredentials() {
        window.utils?.storage?.remove('savedEmail');
    }

    loadSavedCredentials() {
        const savedEmail = window.utils?.storage?.get('savedEmail');
        if (savedEmail && this.emailInput) {
            this.emailInput.value = savedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }

    // Role switching
    switchRole(role) {
        this.currentRole = role;
        this.roleTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.role === role);
        });

        // Update hidden role input value
        const roleInput = this.loginForm.querySelector('input[name="role"]');
        if (roleInput) {
            roleInput.value = role;
        }
    }

    // Fill demo credentials
    fillDemoCredentials(btn) {
        const role = btn.dataset.role;
        let email = '';
        let password = '';

        if (role === 'admin') {
            email = 'admin@reservemyspot.com';
            password = 'admin123';
        } else if (role === 'organization') {
            email = 'org@example.com';
            password = 'org123456';
        }

        this.switchRole(role);

        this.typeText(this.emailInput, email, () => {
            this.typeText(this.passwordInput, password, () => {
                document.getElementById('rememberMe').checked = false;
                this.loginForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            });
        });
    }
}

// Initialize login manager
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();

    // Floating label effect
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => {
            if (!input.value) input.parentElement.classList.remove('focused');
        });
        if (input.value) input.parentElement.classList.add('focused');
    });

    // Role tab hover effect
    const roleTabsContainer = document.querySelector('.role-tabs');
    if (roleTabsContainer) {
        roleTabsContainer.addEventListener('mouseover', e => {
            if (e.target.classList.contains('role-tab') && !e.target.classList.contains('active')) {
                e.target.style.transform = 'scale(1.02)';
            }
        });
        roleTabsContainer.addEventListener('mouseout', e => {
            if (e.target.classList.contains('role-tab') && !e.target.classList.contains('active')) {
                e.target.style.transform = 'scale(1)';
            }
        });
    }
});
