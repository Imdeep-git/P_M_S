// Login Page JavaScript
class LoginManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.roleTabs = document.querySelectorAll('.role-tab');
        this.demoFillBtns = document.querySelectorAll('.demo-fill-btn');

        this.currentRole = 'admin';
        this.isLoading = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.loadSavedCredentials();
        this.switchRole(this.currentRole); // ✅ ensures Admin active at start
    }

    setupEventListeners() {
        // Role tab switching
      const roleTabs = document.querySelectorAll('.role-tab');

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all
      roleTabs.forEach(btn => btn.classList.remove('active'));

      // Add active to clicked button
      tab.classList.add('active');

      // Example: show which one was clicked
      console.log("Active role:", tab.dataset.role);
    });
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
        // Custom validation messages
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

        // Add animation
        this.passwordToggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            this.passwordToggle.style.transform = 'scale(1)';
        }, 100);
    }


    typeText(element, text, callback) {
        let i = 0;
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
        if (existingError) {
            existingError.remove();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isLoading) return;

        // Validate all fields
        const emailValid = this.validateField(this.emailInput);
        const passwordValid = this.validateField(this.passwordInput);

        if (!emailValid || !passwordValid) {
            window.animationManager.showNotification('Please fix the errors and try again', 'error');
            return;
        }

        const formData = {
            email: this.emailInput.value.trim(),
            password: this.passwordInput.value,
            role: this.currentRole,
            rememberMe: document.getElementById('rememberMe')?.checked || false
        };

        this.setLoadingState(true);

        try {
            // Simulate API call
            await this.simulateLogin(formData);

            // Save credentials if remember me is checked
            if (formData.rememberMe) {
                this.saveCredentials(formData.email);
            } else {
                this.clearSavedCredentials();
            }

            // Show success message
            window.animationManager.showNotification('Login successful! Redirecting...', 'success');

            // Redirect based on role
            setTimeout(() => {
                if (formData.role === 'admin') {
                    window.location.href = 'admin_dashboard.html';
                } else {
                    window.location.href = 'org_dashboard.html';
                }
            }, 1500);

        } catch (error) {
            window.animationManager.showNotification(error.message, 'error');
            this.setLoadingState(false);
        }
    }

    async simulateLogin(credentials) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check demo credentials
        const validCredentials = [
            { email: 'admin@reservemyspot.com', password: 'admin123', role: 'admin' },
            { email: 'org@example.com', password: 'org123456', role: 'organization' }
        ];

        const isValid = validCredentials.some(cred =>
            cred.email === credentials.email &&
            cred.password === credentials.password &&
            cred.role === credentials.role
        );

        if (!isValid) {
            throw new Error('Invalid email or password. Please try again.');
        }

        // Store user data in session
        window.utils.storage.set('user', {
            email: credentials.email,
            role: credentials.role,
            loginTime: new Date().toISOString()
        });
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        const submitBtn = this.loginForm.querySelector('.btn-login');
        const submitIcon = submitBtn.querySelector('i');

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
        window.utils.storage.set('savedEmail', email);
    }

    clearSavedCredentials() {
        window.utils.storage.remove('savedEmail');
    }

    loadSavedCredentials() {
        const savedEmail = window.utils.storage.get('savedEmail');
        if (savedEmail && this.emailInput) {
            this.emailInput.value = savedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();

    // Add some interactive features
    const roleTabsContainer = document.querySelector('.role-tabs');
    if (roleTabsContainer) {
        roleTabsContainer.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('role-tab') && !e.target.classList.contains('active')) {
                e.target.style.transform = 'scale(1.02)';
            }
        });

        roleTabsContainer.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('role-tab') && !e.target.classList.contains('active')) {
                e.target.style.transform = 'scale(1)';
            }
        });
    }

    // Add floating label effect
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
});
