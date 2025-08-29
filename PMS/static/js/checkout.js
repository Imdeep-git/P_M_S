// Checkout/Token Verification JavaScript
class CheckoutManager {
    constructor() {
        this.verificationForm = document.getElementById('verificationForm');
        this.verificationTabs = document.querySelectorAll('.verification-tab');
        this.inputMethods = document.querySelectorAll('.input-method');
        this.tokenInput = document.getElementById('tokenInput');
        this.pinDigits = document.querySelectorAll('.pin-digit');
        this.verifyBtn = document.querySelector('.verify-btn');
        
        this.currentMethod = 'token';
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPinInputs();
    }

    setupEventListeners() {
        // Tab switching
        this.verificationTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchMethod(tab.dataset.method));
        });

        // Form submission
        if (this.verificationForm) {
            this.verificationForm.addEventListener('submit', (e) => this.handleVerification(e));
        }

        // Token input formatting
        if (this.tokenInput) {
            this.tokenInput.addEventListener('input', (e) => this.formatTokenInput(e));
            this.tokenInput.addEventListener('paste', (e) => this.handleTokenPaste(e));
        }

        // Add visual feedback for inputs
        [this.tokenInput, ...this.pinDigits].forEach(input => {
            if (input) {
                input.addEventListener('focus', () => this.handleInputFocus(input));
                input.addEventListener('blur', () => this.handleInputBlur(input));
            }
        });
    }

    setupPinInputs() {
        this.pinDigits.forEach((digit, index) => {
            digit.addEventListener('input', (e) => this.handlePinInput(e, index));
            digit.addEventListener('keydown', (e) => this.handlePinKeydown(e, index));
            digit.addEventListener('paste', (e) => this.handlePinPaste(e, index));
        });
    }

    switchMethod(method) {
        this.currentMethod = method;

        // Update tabs
        this.verificationTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.method === method);
        });

        // Update input methods
        this.inputMethods.forEach(inputMethod => {
            inputMethod.classList.toggle('active', inputMethod.dataset.method === method);
        });

        // Clear previous inputs
        this.clearInputs();

        // Add switch animation
        const activeInput = document.querySelector(`.input-method[data-method="${method}"]`);
        if (activeInput) {
            activeInput.style.opacity = '0';
            activeInput.style.transform = 'translateX(20px)';
            setTimeout(() => {
                activeInput.style.transition = 'all 0.3s ease-out';
                activeInput.style.opacity = '1';
                activeInput.style.transform = 'translateX(0)';
            }, 50);
        }
    }

    formatTokenInput(e) {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        e.target.value = value.slice(0, 9);
        
        // Visual feedback for valid length
        if (value.length === 9) {
            e.target.classList.add('valid');
        } else {
            e.target.classList.remove('valid');
        }
    }

    handleTokenPaste(e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
        this.tokenInput.value = pastedData.slice(0, 9);
        this.formatTokenInput({ target: this.tokenInput });
    }

    handlePinInput(e, index) {
        const value = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = value;

        if (value) {
            e.target.classList.add('filled');
            // Move to next digit
            if (index < 3) {
                this.pinDigits[index + 1].focus();
            }
        } else {
            e.target.classList.remove('filled');
        }

        this.updatePinValidation();
    }

    handlePinKeydown(e, index) {
        // Handle backspace
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            this.pinDigits[index - 1].focus();
        }

        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            this.pinDigits[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < 3) {
            this.pinDigits[index + 1].focus();
        }
    }

    handlePinPaste(e, index) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
        
        for (let i = 0; i < Math.min(pastedData.length, 4 - index); i++) {
            if (this.pinDigits[index + i]) {
                this.pinDigits[index + i].value = pastedData[i];
                this.pinDigits[index + i].classList.add('filled');
            }
        }
        
        this.updatePinValidation();
    }

    updatePinValidation() {
        const pinValue = Array.from(this.pinDigits).map(digit => digit.value).join('');
        
        if (pinValue.length === 4) {
            this.pinDigits.forEach(digit => digit.classList.add('valid'));
        } else {
            this.pinDigits.forEach(digit => digit.classList.remove('valid'));
        }
    }

    handleInputFocus(input) {
        input.style.transform = 'scale(1.02)';
    }

    handleInputBlur(input) {
        input.style.transform = 'scale(1)';
    }

    clearInputs() {
        if (this.tokenInput) {
            this.tokenInput.value = '';
            this.tokenInput.classList.remove('valid');
        }
        
        this.pinDigits.forEach(digit => {
            digit.value = '';
            digit.classList.remove('filled', 'valid');
        });
    }

    async handleVerification(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const verificationData = this.getVerificationData();
        
        if (!this.validateInput(verificationData)) {
            this.showError('Please enter a valid token or PIN code');
            return;
        }

        this.setLoadingState(true);

        try {
            await this.verifyAccess(verificationData);
            this.showSuccess(verificationData);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    getVerificationData() {
        if (this.currentMethod === 'token') {
            return {
                method: 'token',
                value: this.tokenInput.value.trim()
            };
        } else {
            return {
                method: 'pin',
                value: Array.from(this.pinDigits).map(digit => digit.value).join('')
            };
        }
    }

    validateInput(data) {
        if (data.method === 'token') {
            return data.value.length === 9;
        } else {
            return data.value.length === 4 && /^\d{4}$/.test(data.value);
        }
    }

    async verifyAccess(data) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo validation
        const validTokens = ['ABC123XYZ', 'DEF456UVW', 'GHI789RST'];
        const validPins = ['1234', '5678', '9012'];
        
        if (data.method === 'token' && !validTokens.includes(data.value)) {
            throw new Error('Invalid token. Please check your booking confirmation.');
        }
        
        if (data.method === 'pin' && !validPins.includes(data.value)) {
            throw new Error('Invalid PIN code. Please check your booking confirmation.');
        }

        // Simulate booking lookup
        return {
            bookingId: 'BK' + Date.now(),
            customerName: 'John Doe',
            vehicleNumber: 'KA01AB1234',
            location: 'Downtown Plaza',
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.verifyBtn.classList.add('loading');
            this.verifyBtn.disabled = true;
            this.verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        } else {
            this.verifyBtn.classList.remove('loading');
            this.verifyBtn.disabled = false;
            this.verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify Access';
        }
    }

    showSuccess(data) {
        const container = document.querySelector('.verification-card');
        
        container.innerHTML = `
            <div class="verification-success">
                <div class="success-icon" style="font-size: 3rem; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="margin-bottom: 1rem;">Access Verified!</h2>
                <p style="margin-bottom: 2rem; opacity: 0.9;">
                    Your ${data.method === 'token' ? 'token' : 'PIN'} has been successfully verified.
                </p>
                <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem;">Booking Details</h4>
                    <div style="text-align: left; display: flex; flex-direction: column; gap: 0.5rem;">
                        <div><strong>Booking ID:</strong> BK${Date.now()}</div>
                        <div><strong>Customer:</strong> John Doe</div>
                        <div><strong>Vehicle:</strong> KA01AB1234</div>
                        <div><strong>Location:</strong> Downtown Plaza</div>
                        <div><strong>Valid Until:</strong> ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                    <a href="index.html" class="btn btn-secondary" style="background: rgba(255,255,255,0.2); border: none;">
                        <i class="fas fa-home"></i> Back to Home
                    </a>
                    <a href="book_slot.html" class="btn btn-primary" style="background: rgba(255,255,255,0.9); color: var(--success-color);">
                        <i class="fas fa-plus"></i> Book Another Slot
                    </a>
                </div>
            </div>
        `;

        window.animationManager.showNotification('Access verified successfully!', 'success');
    }

    showError(message) {
        // Remove existing error
        const existingError = document.querySelector('.verification-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'verification-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 1.2rem; margin-bottom: 0.5rem;"></i>
            <div>${message}</div>
        `;

        this.verificationForm.appendChild(errorDiv);

        // Shake the form
        this.verificationForm.style.animation = 'shake 0.5s ease-out';
        setTimeout(() => {
            this.verificationForm.style.animation = '';
        }, 500);

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);

        window.animationManager.showNotification(message, 'error');
    }

    fillDemoCode(code, method) {
        this.switchMethod(method);
        
        setTimeout(() => {
            if (method === 'token') {
                this.tokenInput.value = code;
                this.formatTokenInput({ target: this.tokenInput });
            } else {
                code.split('').forEach((digit, index) => {
                    if (this.pinDigits[index]) {
                        this.pinDigits[index].value = digit;
                        this.pinDigits[index].classList.add('filled');
                    }
                });
                this.updatePinValidation();
            }
            
            window.animationManager.showNotification(`Demo ${method} filled!`, 'success');
        }, 300);
    }

    showBookingLookup() {
        // Create booking lookup modal
        const modalHTML = `
            <div class="booking-lookup-modal" onclick="this.remove()">
                <div class="lookup-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Find My Booking</h3>
                        <button class="modal-close" onclick="this.closest('.booking-lookup-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Enter your booking details to retrieve your access codes:</p>
                        <form class="lookup-form">
                            <div class="form-group">
                                <label>Booking ID or Phone Number</label>
                                <input type="text" placeholder="BK1234567890 or +1234567890" class="form-input">
                            </div>
                            <div class="form-group">
                                <label>Vehicle Number</label>
                                <input type="text" placeholder="KA01AB1234" class="form-input">
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> Find Booking
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles if not present
        if (!document.querySelector('.lookup-modal-styles')) {
            const styles = document.createElement('style');
            styles.className = 'lookup-modal-styles';
            styles.textContent = `
                .booking-lookup-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 3000;
                    animation: fadeIn 0.3s ease-out;
                }
                .lookup-content {
                    background: var(--bg-primary);
                    border-radius: 1rem;
                    max-width: 400px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-secondary);
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .lookup-form .form-group {
                    margin-bottom: 1rem;
                }
                .lookup-form label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                .lookup-form .form-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }
                .lookup-form .btn {
                    width: 100%;
                    margin-top: 1rem;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Initialize checkout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();

    // Add some interactive features
    const verificationCard = document.querySelector('.verification-card');
    if (verificationCard) {
        verificationCard.addEventListener('mouseenter', () => {
            verificationCard.style.transform = 'translateY(-5px)';
        });
        
        verificationCard.addEventListener('mouseleave', () => {
            verificationCard.style.transform = 'translateY(0)';
        });
    }

    // Add floating animation to header icon
    const headerIcon = document.querySelector('.header-icon');
    if (headerIcon) {
        setInterval(() => {
            headerIcon.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                headerIcon.style.transform = 'translateY(0)';
            }, 1000);
        }, 3000);
    }
});