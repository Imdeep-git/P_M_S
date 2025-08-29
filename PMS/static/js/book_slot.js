// Book Slot Page JavaScript
class BookingManager {
    constructor() {
        this.availableSlots = [];
        this.selectedSlot = null;
        this.bookingForm = document.getElementById('bookingForm');
        this.locationSearch = document.getElementById('locationSearch');
        this.vehicleTypeFilter = document.getElementById('vehicleTypeFilter');
        this.availableSlotsContainer = document.getElementById('availableSlots');
        this.selectedSlotInfo = document.getElementById('selectedSlotInfo');
        
        this.init();
    }

    init() {
        this.loadAvailableSlots();
        this.setupEventListeners();
        this.setDefaultDates();
        this.renderSlots();
    }

    loadAvailableSlots() {
        // Sample available slots data
        this.availableSlots = [
            {
                id: 1,
                name: "Downtown Plaza",
                address: "123 Main Street, Downtown",
                type: "4W",
                availableSlots: 15,
                totalSlots: 50,
                pricePerHour: 5.00,
                features: ["24/7 Security", "CCTV", "Covered"],
                distance: "0.2 km",
                status: "available"
            },
            {
                id: 2,
                name: "City Mall Parking",
                address: "456 Shopping Blvd",
                type: "4W",
                availableSlots: 25,
                totalSlots: 100,
                pricePerHour: 3.50,
                features: ["Mall Access", "Security", "EV Charging"],
                distance: "0.8 km",
                status: "available"
            },
            {
                id: 3,
                name: "Metro Station - 2W",
                address: "789 Transit Ave",
                type: "2W",
                availableSlots: 8,
                totalSlots: 30,
                pricePerHour: 2.00,
                features: ["Metro Access", "Covered", "24/7"],
                distance: "0.3 km",
                status: "limited"
            },
            {
                id: 4,
                name: "Business District",
                address: "101 Corporate Plaza",
                type: "4W",
                availableSlots: 30,
                totalSlots: 75,
                pricePerHour: 6.00,
                features: ["Business Hours", "Security", "Valet"],
                distance: "2.1 km",
                status: "available"
            },
            {
                id: 5,
                name: "University Campus - 2W",
                address: "University Avenue",
                type: "2W",
                availableSlots: 45,
                totalSlots: 80,
                pricePerHour: 1.50,
                features: ["Student Discount", "24/7", "Security"],
                distance: "3.5 km",
                status: "available"
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        if (this.locationSearch) {
            this.locationSearch.addEventListener('input', 
                window.utils.debounce(() => this.filterSlots(), 300)
            );
        }

        // Vehicle type filter
        if (this.vehicleTypeFilter) {
            this.vehicleTypeFilter.addEventListener('change', () => this.filterSlots());
        }

        // Form submission
        if (this.bookingForm) {
            this.bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));
        }

        // Date/time change listeners
        ['startDate', 'startTime', 'endDate', 'endTime'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.calculateDuration());
            }
        });

        // Vehicle number formatting
        const vehicleNumberInput = document.getElementById('vehicleNumber');
        if (vehicleNumberInput) {
            vehicleNumberInput.addEventListener('input', (e) => this.formatVehicleNumber(e));
        }

        // Phone number formatting
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
        }

        // Check for pre-selected slot from URL
        const urlParams = new URLSearchParams(window.location.search);
        const slotId = urlParams.get('slot');
        if (slotId) {
            setTimeout(() => this.selectSlot(parseInt(slotId)), 500);
        }
    }

    setDefaultDates() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);
        
        // Set minimum date to today
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) {
            startDateInput.min = today;
            startDateInput.value = today;
        }
        
        if (endDateInput) {
            endDateInput.min = today;
            endDateInput.value = today;
        }

        // Set default times
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        
        if (startTimeInput) {
            startTimeInput.value = currentTime;
        }
        
        if (endTimeInput) {
            // Default to 2 hours later
            const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            endTimeInput.value = endTime.toTimeString().slice(0, 5);
        }

        // Calculate initial duration
        setTimeout(() => this.calculateDuration(), 100);
    }

    filterSlots() {
        const searchTerm = this.locationSearch.value.toLowerCase().trim();
        const vehicleType = this.vehicleTypeFilter.value;
        
        let filteredSlots = this.availableSlots.filter(slot => {
            const matchesSearch = !searchTerm || 
                slot.name.toLowerCase().includes(searchTerm) ||
                slot.address.toLowerCase().includes(searchTerm);
                
            const matchesVehicleType = !vehicleType || slot.type === vehicleType;
            
            return matchesSearch && matchesVehicleType && slot.availableSlots > 0;
        });

        this.renderSlots(filteredSlots);
    }

    renderSlots(slots = this.availableSlots) {
        if (!this.availableSlotsContainer) return;

        // Show loading state
        this.availableSlotsContainer.innerHTML = `
            <div class="loading-spinner"></div>
        `;
        this.availableSlotsContainer.classList.add('loading');

        setTimeout(() => {
            this.availableSlotsContainer.classList.remove('loading');
            
            if (slots.length === 0) {
                this.availableSlotsContainer.innerHTML = `
                    <div class="empty-slots">
                        <i class="fas fa-car-side"></i>
                        <h4>No Available Slots</h4>
                        <p>Try adjusting your search criteria</p>
                    </div>
                `;
                return;
            }

            this.availableSlotsContainer.innerHTML = slots.map(slot => `
                <div class="slot-item ${this.selectedSlot?.id === slot.id ? 'selected' : ''}" 
                     data-slot-id="${slot.id}" onclick="bookingManager.selectSlot(${slot.id})">
                    <div class="slot-header">
                        <div class="slot-name">${slot.name}</div>
                        <div class="slot-type-badge type-${slot.type}">${slot.type}</div>
                    </div>
                    
                    <div class="slot-info">
                        <div class="slot-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${slot.address}</span>
                        </div>
                        <div class="slot-info-item">
                            <i class="fas fa-route"></i>
                            <span>${slot.distance} away</span>
                        </div>
                        <div class="slot-info-item">
                            <i class="fas fa-dollar-sign"></i>
                            <span>$${slot.pricePerHour.toFixed(2)}/hour</span>
                        </div>
                        <div class="slot-info-item">
                            <i class="fas fa-star"></i>
                            <span>${slot.features.slice(0, 2).join(', ')}</span>
                        </div>
                    </div>
                    
                    <div class="slot-availability">
                        <div class="availability-status ${slot.status}">
                            ${slot.availableSlots} / ${slot.totalSlots} Available
                        </div>
                        <div class="slot-price">
                            $${slot.pricePerHour.toFixed(2)}/hr
                        </div>
                    </div>
                </div>
            `).join('');
        }, 300);
    }

    selectSlot(slotId) {
        this.selectedSlot = this.availableSlots.find(slot => slot.id === slotId);
        
        if (!this.selectedSlot) return;

        // Update UI
        document.querySelectorAll('.slot-item').forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.slotId) === slotId);
        });

        // Show selected slot info
        this.showSelectedSlotInfo();
        
        // Update vehicle type filter to match selected slot
        const vehicleTypeSelect = document.getElementById('vehicleType');
        if (vehicleTypeSelect && !vehicleTypeSelect.value) {
            vehicleTypeSelect.value = this.selectedSlot.type;
        }

        // Calculate duration with new slot
        this.calculateDuration();

        // Show success notification
        window.animationManager.showNotification(
            `Selected ${this.selectedSlot.name}`, 
            'success'
        );
    }

    showSelectedSlotInfo() {
        if (!this.selectedSlot || !this.selectedSlotInfo) return;

        document.getElementById('selectedSlotName').textContent = this.selectedSlot.name;
        document.getElementById('selectedSlotAddress').textContent = this.selectedSlot.address;
        document.getElementById('selectedSlotPrice').textContent = 
            `$${this.selectedSlot.pricePerHour.toFixed(2)}/hour`;

        this.selectedSlotInfo.style.display = 'block';
        this.selectedSlotInfo.style.animation = 'slideIn 0.3s ease-out';
    }

    calculateDuration() {
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;
        const endDate = document.getElementById('endDate').value;
        const endTime = document.getElementById('endTime').value;
        
        if (!startDate || !startTime || !endDate || !endTime) return;

        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        
        if (endDateTime <= startDateTime) {
            document.getElementById('durationSummary').style.display = 'none';
            return;
        }

        const durationMs = endDateTime - startDateTime;
        const durationHours = durationMs / (1000 * 60 * 60);
        
        // Format duration
        const hours = Math.floor(durationHours);
        const minutes = Math.round((durationHours - hours) * 60);
        const durationText = `${hours}h ${minutes}m`;
        
        // Calculate cost
        let totalCost = 0;
        if (this.selectedSlot) {
            totalCost = durationHours * this.selectedSlot.pricePerHour;
        }

        // Update UI
        document.getElementById('totalDuration').textContent = durationText;
        document.getElementById('totalCost').textContent = 
            totalCost > 0 ? `$${totalCost.toFixed(2)}` : '-';
        document.getElementById('durationSummary').style.display = 'flex';
    }

    formatVehicleNumber(e) {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Format as XX00XX0000
        if (value.length > 2) {
            value = value.slice(0, 2) + ' ' + value.slice(2);
        }
        if (value.length > 5) {
            value = value.slice(0, 5) + ' ' + value.slice(5);
        }
        if (value.length > 8) {
            value = value.slice(0, 8) + ' ' + value.slice(8);
        }
        
        e.target.value = value.slice(0, 13); // Limit to XX00XX0000 format
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

    async handleBookingSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!window.formValidator.validateForm(this.bookingForm)) {
            window.animationManager.showNotification('Please fix the errors and try again', 'error');
            return;
        }

        // Check if slot is selected
        if (!this.selectedSlot) {
            window.animationManager.showNotification('Please select a parking slot', 'error');
            return;
        }

        // Collect form data
        const formData = new FormData(this.bookingForm);
        const bookingData = Object.fromEntries(formData.entries());
        
        // Add selected slot info
        bookingData.selectedSlot = this.selectedSlot;
        bookingData.totalCost = document.getElementById('totalCost').textContent;
        bookingData.totalDuration = document.getElementById('totalDuration').textContent;

        this.setLoadingState(true);

        try {
            await this.submitBooking(bookingData);
            this.showBookingSuccess(bookingData);
        } catch (error) {
            window.animationManager.showNotification(error.message, 'error');
            this.setLoadingState(false);
        }
    }

    async submitBooking(bookingData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate booking details
        const booking = {
            bookingId: 'BK' + Date.now(),
            token: window.utils.generateToken(),
            pin: window.utils.generatePin(),
            ...bookingData,
            bookingTime: new Date().toISOString(),
            status: 'confirmed'
        };

        // Store booking data
        window.utils.storage.set(`booking_${booking.bookingId}`, booking);
        
        return booking;
    }

    setLoadingState(loading) {
        const submitBtn = this.bookingForm.querySelector('.btn-book');
        
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Booking...';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Book Slot';
        }
    }

    showBookingSuccess(bookingData) {
        const container = document.querySelector('.booking-container');
        const booking = JSON.parse(window.utils.storage.get(`booking_BK${Date.now() - 1000}`)) || {
            bookingId: 'BK' + Date.now(),
            token: window.utils.generateToken(),
            pin: window.utils.generatePin(),
            ...bookingData
        };

        container.innerHTML = `
            <div class="booking-success">
                <div class="success-header">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Booking Confirmed!</h2>
                    <p>Your parking slot has been successfully reserved</p>
                </div>
                
                <div class="booking-details">
                    <div class="detail-card">
                        <h3>Booking Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Booking ID:</span>
                                <span class="value">${booking.bookingId}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Location:</span>
                                <span class="value">${bookingData.selectedSlot.name}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Vehicle:</span>
                                <span class="value">${bookingData.vehicleNumber}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Duration:</span>
                                <span class="value">${bookingData.totalDuration}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Total Cost:</span>
                                <span class="value cost">${bookingData.totalCost}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-card access-codes">
                        <h3>Access Information</h3>
                        <div class="code-grid">
                            <div class="code-item">
                                <span class="code-label">Token</span>
                                <span class="code-value" id="bookingToken">${booking.token}</span>
                                <button class="copy-btn" onclick="navigator.clipboard.writeText('${booking.token}')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div class="code-item">
                                <span class="code-label">PIN</span>
                                <span class="code-value" id="bookingPin">${booking.pin}</span>
                                <button class="copy-btn" onclick="navigator.clipboard.writeText('${booking.pin}')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="access-note">
                            <i class="fas fa-info-circle"></i>
                            <span>Use either the token or PIN to access your parking slot</span>
                        </div>
                    </div>
                </div>
                
                <div class="success-actions">
                    <a href="checkout.html" class="btn btn-primary">
                        <i class="fas fa-qrcode"></i> Verify Access Code
                    </a>
                    <button class="btn btn-secondary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print Details
                    </button>
                    <a href="index.html" class="btn btn-secondary">
                        <i class="fas fa-home"></i> Back to Home
                    </a>
                </div>
            </div>
        `;

        // Add success styles
        if (!document.querySelector('.booking-success-styles')) {
            const styles = document.createElement('style');
            styles.className = 'booking-success-styles';
            styles.textContent = `
                .booking-success {
                    text-align: center;
                    padding: 2rem;
                    background: var(--bg-primary);
                    border-radius: 1rem;
                    box-shadow: var(--shadow-heavy);
                }
                .success-header {
                    margin-bottom: 2rem;
                }
                .success-icon {
                    width: 80px;
                    height: 80px;
                    background: var(--success-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                    font-size: 2rem;
                    color: white;
                    animation: bounce 0.6s ease-out;
                }
                .success-header h2 {
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .booking-details {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .detail-card {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    text-align: left;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .detail-item:last-child {
                    border-bottom: none;
                }
                .label {
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .value {
                    color: var(--text-primary);
                    font-weight: 600;
                }
                .value.cost {
                    color: var(--primary-color);
                    font-size: 1.1rem;
                }
                .access-codes {
                    border: 2px solid var(--primary-color);
                }
                .code-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .code-item {
                    text-align: center;
                    position: relative;
                }
                .code-label {
                    display: block;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                .code-value {
                    display: block;
                    background: var(--bg-primary);
                    padding: 1rem;
                    border-radius: 0.5rem;
                    font-family: monospace;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: var(--primary-color);
                    border: 2px solid var(--border-color);
                    margin-bottom: 0.5rem;
                }
                .copy-btn {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                .access-note {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: var(--bg-primary);
                    border-radius: 0.5rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .success-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    justify-content: center;
                }
                @media (max-width: 768px) {
                    .code-grid {
                        grid-template-columns: 1fr;
                    }
                    .success-actions {
                        flex-direction: column;
                    }
                    .success-actions .btn {
                        width: 100%;
                    }
                }
                @keyframes bounce {
                    0%, 20%, 60%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    80% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Initialize booking manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookingManager = new BookingManager();

    // Add copy functionality for access codes
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn')) {
            const button = e.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 1000);
            window.animationManager.showNotification('Copied to clipboard!', 'success');
        }
    });
});