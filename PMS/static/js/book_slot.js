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

    async loadAvailableSlots() {
        try {
            const response = await fetch("/api/slots/");
            const slots = await response.json();

            this.availableSlots = slots.map(slot => ({
                id: slot.id,
                name: slot.organization_name || slot.name,
                address: `${slot.organization_address}, ${slot.organization_city}`,
                type: slot.slot_type,
                availableSlots: slot.available_slots,
                totalSlots: slot.total_slots,
                pricePerHour: parseFloat(slot.price),
                features: slot.features?.length ? slot.features : ["Secure", "24/7"],
                distance: slot.distance || "-",
                status: slot.available_slots > 0 ? "available" : "unavailable"
            }));

            this.renderSlots(this.availableSlots);
        } catch (err) {
            console.error("Error fetching slots:", err);
            this.availableSlotsContainer.innerHTML = `
                <div class="empty-slots">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>Failed to load slots</h4>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }

    setupEventListeners() {
        if (this.locationSearch) {
            this.locationSearch.addEventListener('input',
                window.utils.debounce(() => this.filterSlots(), 300)
            );
        }

        if (this.vehicleTypeFilter) {
            this.vehicleTypeFilter.addEventListener('change', () => this.filterSlots());
        }

        if (this.bookingForm) {
            this.bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));
        }

        ['startDate', 'startTime', 'endDate', 'endTime'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.calculateDuration());
            }
        });

        const vehicleNumberInput = document.getElementById('vehicleNumber');
        if (vehicleNumberInput) {
            vehicleNumberInput.addEventListener('input', (e) => this.formatVehicleNumber(e));
        }

        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\d+]/g, '');
            });
        }

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

        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        if (startTimeInput) startTimeInput.value = currentTime;
        if (endTimeInput) {
            const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            endTimeInput.value = endTime.toTimeString().slice(0, 5);
        }

        setTimeout(() => this.calculateDuration(), 100);
    }

    filterSlots() {
        const searchTerm = this.locationSearch.value.toLowerCase().trim();
        const vehicleType = this.vehicleTypeFilter.value;

        const filteredSlots = this.availableSlots.filter(slot => {
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

        this.availableSlotsContainer.innerHTML = `<div class="loading-spinner"></div>`;
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
                            <span>Rs.${slot.pricePerHour.toFixed(2)}/hour</span>
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
                            Rs.${slot.pricePerHour.toFixed(2)}/hr
                        </div>
                    </div>
                </div>
            `).join('');
        }, 300);
    }

    selectSlot(slotId) {
        this.selectedSlot = this.availableSlots.find(slot => slot.id === slotId);
        if (!this.selectedSlot) return;

        document.querySelectorAll('.slot-item').forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.slotId) === slotId);
        });

        this.showSelectedSlotInfo();

        const vehicleTypeSelect = document.getElementById('vehicleType');
        if (vehicleTypeSelect && !vehicleTypeSelect.value) {
            vehicleTypeSelect.value = this.selectedSlot.type;
        }

        this.calculateDuration();
        window.animationManager.showNotification(`Selected ${this.selectedSlot.name}`, 'success');
    }

    showSelectedSlotInfo() {
        if (!this.selectedSlot || !this.selectedSlotInfo) return;

        document.getElementById('selectedSlotName').textContent = this.selectedSlot.name;
        document.getElementById('selectedSlotAddress').textContent = this.selectedSlot.address;
        document.getElementById('selectedSlotPrice').textContent =
            `Rs.${this.selectedSlot.pricePerHour.toFixed(2)}/hour`;

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

        const hours = Math.floor(durationHours);
        const minutes = Math.round((durationHours - hours) * 60);
        const durationText = `${hours}h ${minutes}m`;

        let totalCost = 0;
        if (this.selectedSlot) totalCost = durationHours * this.selectedSlot.pricePerHour;

        document.getElementById('totalDuration').textContent = durationText;
        document.getElementById('totalCost').textContent = totalCost > 0 ? `Rs.${totalCost.toFixed(2)}` : '-';
        document.getElementById('durationSummary').style.display = 'flex';
    }

    formatVehicleNumber(e) {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length > 2) value = value.slice(0, 2) + ' ' + value.slice(2);
        if (value.length > 5) value = value.slice(0, 5) + ' ' + value.slice(5);
        if (value.length > 8) value = value.slice(0, 8) + ' ' + value.slice(8);
        e.target.value = value.slice(0, 13);
    }

    isValidPhone(phone) {
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 10;
    }

 
  async handleBookingSubmit(e) {
    e.preventDefault();

    if (!window.formValidator.validateForm(this.bookingForm)) {
        window.animationManager.showNotification('Please fix the errors and try again', 'error');
        return;
    }

    const phoneInput = document.getElementById('phoneNumber');
    if (!this.isValidPhone(phoneInput.value)) {
        window.animationManager.showNotification('Enter a valid phone number (at least 10 digits)', 'error');
        phoneInput.focus();
        return;
    }

    if (!this.selectedSlot) {
        window.animationManager.showNotification('Please select a parking slot', 'error');
        return;
    }

    const formData = new FormData(this.bookingForm);
    const bookingData = Object.fromEntries(formData.entries());

    // ✅ Use separate startDate/startTime & endDate/endTime fields
    const payload = {
        slot: this.selectedSlot.id,
        customerName: bookingData.customerName,
        phoneNumber: bookingData.phoneNumber,
        email: bookingData.email,
        vehicleType: bookingData.vehicleType,
        vehicleNumber: bookingData.vehicleNumber,
        vehicleBrand: bookingData.vehicleBrand,
        startDate: bookingData.startDate,
        startTime: bookingData.startTime,
        endDate: bookingData.endDate,
        endTime: bookingData.endTime,
        totalCost: parseFloat(
            document.getElementById("totalCost").textContent.replace('Rs.', '').trim()
        ) || 0
    };

    this.setLoadingState(true);

    try {
        const bookingResponse = await this.submitBooking(payload);
        const params = new URLSearchParams({
            token: bookingResponse.token,
            pin: bookingResponse.pin
        });
        window.location.href = `/booking_success/?${params.toString()}`;
    } catch (error) {
        window.animationManager.showNotification(error.message, 'error');
        this.setLoadingState(false);
    }
}

    async submitBooking(payload) {
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== "") {
                const cookies = document.cookie.split(";");
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.startsWith(name + "=")) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }

        const csrftoken = getCookie("csrftoken");

        console.log("Submitting booking payload:", payload);

        const response = await fetch("/api/bookings/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Booking API error:", errorData);
            throw new Error(errorData.error || errorData.detail || "Failed to book slot");
        }

        return await response.json();
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
        // unchanged
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.bookingManager = new BookingManager();
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn')) {
            const button = e.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => { button.innerHTML = originalText; }, 1000);
            window.animationManager.showNotification('Copied to clipboard!', 'success');
        }
    });
});
