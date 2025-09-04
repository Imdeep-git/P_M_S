class OrgDashboard {
    constructor() {
        this.slots = [];
        this.bookings = [];
        this.filteredSlots = [];
        this.filteredBookings = [];

        this.apiBase = '/api/'; // Base API path
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupUserMenu();
        this.animateStats();
        await this.loadData(); // Load dynamic data first
        this.renderSlots();
        this.renderBookings();
    }

    setupEventListeners() {
        const slotsSearch = document.getElementById('slotsSearch');
        const bookingsSearch = document.getElementById('bookingsSearch');

        if (slotsSearch) {
            slotsSearch.addEventListener('input', window.utils.debounce(() => this.filterSlots(), 300));
        }

        if (bookingsSearch) {
            bookingsSearch.addEventListener('input', window.utils.debounce(() => this.filterBookings(), 300));
        }

        const statusFilter = document.getElementById('slotStatusFilter');
        const typeFilter = document.getElementById('slotTypeFilter');

        if (statusFilter) statusFilter.addEventListener('change', () => this.filterSlots());
        if (typeFilter) typeFilter.addEventListener('change', () => this.filterSlots());

        const addSlotBtn = document.getElementById('addSlotBtn');
        if (addSlotBtn) addSlotBtn.addEventListener('click', () => this.showAddSlotModal());

        window.addEventListener('resize', () => this.handleResize());
    }

    setupUserMenu() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenuToggle && userDropdown) {
            userMenuToggle.addEventListener('click', () => userDropdown.classList.toggle('active'));
            document.addEventListener('click', (e) => {
                if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });
        }
    }

    async loadData() {
        try {
            // Fetch dynamic slots
            const slotsRes = await fetch(this.apiBase + 'org-slots/');
            if (!slotsRes.ok) throw new Error('Failed to fetch slots');
            this.slots = await slotsRes.json();

            // Fetch dynamic bookings
            const bookingsRes = await fetch(this.apiBase + 'org-bookings/');
            if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
            this.bookings = await bookingsRes.json();

            // Copy to filtered arrays
            this.filteredSlots = [...this.slots];
            this.filteredBookings = [...this.bookings];
        } catch (err) {
            console.error('Error loading dynamic data:', err);
        }
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
            element.textContent = Math.floor(current);
        }, 16);
    }

    filterSlots() {
        const searchTerm = document.getElementById('slotsSearch')?.value.toLowerCase().trim() || '';
        const statusFilter = document.getElementById('slotStatusFilter')?.value || 'all';
        const typeFilter = document.getElementById('slotTypeFilter')?.value || 'all';

        this.filteredSlots = this.slots.filter(slot => {
            const matchesSearch = !searchTerm ||
                (slot.name && slot.name.toLowerCase().includes(searchTerm)) ||
                (slot.location && slot.location.toLowerCase().includes(searchTerm));

            const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
            const matchesType = typeFilter === 'all' || slot.slot_type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });

        this.renderSlots();
    }

    filterBookings() {
        const searchTerm = document.getElementById('bookingsSearch')?.value.toLowerCase().trim() || '';

        this.filteredBookings = this.bookings.filter(booking => {
            return !searchTerm ||
                (booking.token && booking.token.toLowerCase().includes(searchTerm)) ||
                (booking.customer_name && booking.customer_name.toLowerCase().includes(searchTerm)) ||
                (booking.vehicle_number && booking.vehicle_number.toLowerCase().includes(searchTerm)) ||
                (booking.slot_name && booking.slot_name.toLowerCase().includes(searchTerm));
        });

        this.renderBookings();
    }

    renderSlots() {
        const slotsGrid = document.getElementById('slotsGrid');
        if (!slotsGrid) return;

        if (this.filteredSlots.length === 0) {
            slotsGrid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-car-side" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No slots found</h3>
                <p>Try adjusting your search criteria</p>
            </div>`;
            return;
        }

        slotsGrid.innerHTML = this.filteredSlots.map(slot => `
            <div class="slot-card" data-slot-id="${slot.id}">
                <div class="slot-header">
                    <div class="slot-title">${slot.name}</div>
                    <div class="slot-status status-${slot.status || (slot.available_slots > 0 ? 'available' : 'occupied')}">
                        ${slot.status || (slot.available_slots > 0 ? 'available' : 'occupied')}
                    </div>
                </div>
                
                <div class="slot-details">
                    <div class="slot-detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${slot.location || slot.address || ''}</span>
                    </div>
                    <div class="slot-detail-item">
                        <i class="fas fa-tag"></i>
                        <span>${slot.slot_type === '2W' ? 'Two Wheeler' : 'Four Wheeler'}</span>
                    </div>
                    <div class="slot-detail-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Rs.${parseFloat(slot.price || 0).toFixed(2)}/hour</span>
                    </div>
                    <div class="slot-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>Available: ${slot.available_slots}/${slot.total_slots}</span>
                    </div>
                </div>
                
                <div class="slot-actions">
                    <button class="slot-action-btn" onclick="orgDashboard.editSlot(${slot.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${slot.status === 'maintenance' ? 
                        `<button class="slot-action-btn" onclick="orgDashboard.activateSlot(${slot.id})">
                            <i class="fas fa-play"></i> Activate
                        </button>` :
                        `<button class="slot-action-btn" onclick="orgDashboard.maintenanceSlot(${slot.id})">
                            <i class="fas fa-wrench"></i> Maintenance
                        </button>`
                    }
                    <button class="slot-action-btn danger" onclick="orgDashboard.deleteSlot(${slot.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderBookings() {
        this.renderBookingsTable();
        this.renderBookingsMobile();
    }

    renderBookingsTable() {
        const tableBody = document.getElementById('bookingsTableBody');
        if (!tableBody) return;

        if (this.filteredBookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-calendar-alt" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5; display: block;"></i>
                        No bookings found
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredBookings.map(b => {
            const startDate = new Date(b.start_datetime);
            const endDate = new Date(b.end_datetime);
            return `
                <tr data-booking-id="${b.id}">
                    <td>${b.token}</td>
                    <td>${b.customer_name}</td>
                    <td>${b.vehicle_number}</td>
                    <td>${b.slot_name || b.slot}</td>
                    <td>${startDate.toLocaleDateString()}<br>
                        <small style="color: var(--text-secondary);">${startDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
                    </td>
                    <td><span class="booking-status status-${b.status}">${b.status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn action-view" onclick="orgDashboard.viewBooking('${b.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="table-action-btn action-edit" onclick="orgDashboard.editBooking('${b.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="table-action-btn action-delete" onclick="orgDashboard.deleteBooking('${b.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderBookingsMobile() {
        const mobileContainer = document.getElementById('bookingsMobile');
        if (!mobileContainer) return;

        if (this.filteredBookings.length === 0) {
            mobileContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-calendar-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No bookings found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        mobileContainer.innerHTML = this.filteredBookings.map(b => {
            const startDate = new Date(b.start_datetime);
            const endDate = new Date(b.end_datetime);
            return `
                <div class="booking-mobile-card" data-booking-id="${b.id}">
                    <div class="mobile-card-header">
                        <div class="mobile-booking-id">${b.token}</div>
                        <div class="booking-status status-${b.status}">${b.status}</div>
                    </div>
                    <div class="mobile-card-details">
                        <div class="mobile-detail-item"><span class="mobile-detail-label">Customer:</span> <span class="mobile-detail-value">${b.customer_name}</span></div>
                        <div class="mobile-detail-item"><span class="mobile-detail-label">Vehicle:</span> <span class="mobile-detail-value">${b.vehicle_number}</span></div>
                        <div class="mobile-detail-item"><span class="mobile-detail-label">Slot:</span> <span class="mobile-detail-value">${b.slot_name || b.slot}</span></div>
                        <div class="mobile-detail-item"><span class="mobile-detail-label">Date:</span> <span class="mobile-detail-value">${startDate.toLocaleDateString()}</span></div>
                        <div class="mobile-detail-item"><span class="mobile-detail-label">Time:</span> <span class="mobile-detail-value">${startDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                        <div class="mobile-detail-item"><span class="mobile-detail-label">Amount:</span> <span class="mobile-detail-value">Rs.${b.total_cost?.toFixed(2) || '0.00'}</span></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    handleResize() {
        const width = window.innerWidth;
        const tableContainer = document.querySelector('.bookings-table-container');
        const mobileContainer = document.getElementById('bookingsMobile');

        if (width <= 768) {
            if (tableContainer) tableContainer.style.display = 'none';
            if (mobileContainer) mobileContainer.style.display = 'block';
        } else {
            if (tableContainer) tableContainer.style.display = 'block';
            if (mobileContainer) mobileContainer.style.display = 'none';
        }
    }

    // --- Slot Modals & Actions ---
    showAddSlotModal() {
        this.showModal('Add New Slot', `
            <form class="modal-form" onsubmit="orgDashboard.addSlot(event)">
                <div class="form-group">
                    <label>Slot Name</label>
                    <input type="text" name="name" placeholder="e.g., A-001" required>
                </div>
                <div class="form-group">
                    <label>Slot Type</label>
                    <select name="slot_type" required>
                        <option value="">Select type</option>
                        <option value="2W">Two Wheeler</option>
                        <option value="4W">Four Wheeler</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="location" placeholder="e.g., Level 1, Section A" required>
                </div>
                <div class="form-group">
                    <label>Hourly Rate (Rs.)</label>
                    <input type="number" name="price" step="0.01" min="0" placeholder="5.00" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Slot</button>
                </div>
            </form>
        `);
    }

    addSlot(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const slotData = Object.fromEntries(formData.entries());

        const newSlot = {
            id: Date.now(),
            name: slotData.name,
            slot_type: slotData.slot_type,
            status: 'available',
            location: slotData.location,
            price: parseFloat(slotData.price),
            available_slots: 0,
            total_slots: 0,
        };

        this.slots.unshift(newSlot);
        this.filteredSlots = [...this.slots];
        this.renderSlots();
        window.animationManager.showNotification('Slot added successfully!', 'success');
        this.closeModal();
    }

    editSlot(slotId) {
        const slot = this.slots.find(s => s.id === slotId);
        if (!slot) return;

        this.showModal('Edit Slot', `
            <form class="modal-form" onsubmit="orgDashboard.updateSlot(event, ${slotId})">
                <div class="form-group">
                    <label>Slot Name</label>
                    <input type="text" name="name" value="${slot.name}" required>
                </div>
                <div class="form-group">
                    <label>Slot Type</label>
                    <select name="slot_type" required>
                        <option value="2W" ${slot.slot_type === '2W' ? 'selected' : ''}>Two Wheeler</option>
                        <option value="4W" ${slot.slot_type === '4W' ? 'selected' : ''}>Four Wheeler</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value="${slot.location}" required>
                </div>
                <div class="form-group">
                    <label>Hourly Rate (Rs.)</label>
                    <input type="number" name="price" step="0.01" min="0" value="${slot.price}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" required>
                        <option value="available" ${slot.status === 'available' ? 'selected' : ''}>Available</option>
                        <option value="occupied" ${slot.status === 'occupied' ? 'selected' : ''}>Occupied</option>
                        <option value="maintenance" ${slot.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Slot</button>
                </div>
            </form>
        `);
    }

    updateSlot(event, slotId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const slotData = Object.fromEntries(formData.entries());

        const slotIndex = this.slots.findIndex(s => s.id === slotId);
        if (slotIndex !== -1) {
            this.slots[slotIndex] = {
                ...this.slots[slotIndex],
                name: slotData.name,
                slot_type: slotData.slot_type,
                location: slotData.location,
                price: parseFloat(slotData.price),
                status: slotData.status,
            };
            this.filteredSlots = [...this.slots];
            this.renderSlots();
            window.animationManager.showNotification('Slot updated successfully!', 'success');
            this.closeModal();
        }
    }

    deleteSlot(slotId) {
        if (!confirm('Are you sure you want to delete this slot?')) return;
        this.slots = this.slots.filter(s => s.id !== slotId);
        this.filteredSlots = [...this.slots];
        this.renderSlots();
        window.animationManager.showNotification('Slot deleted successfully!', 'success');
    }

    activateSlot(slotId) {
        const slot = this.slots.find(s => s.id === slotId);
        if (slot) {
            slot.status = 'available';
            this.renderSlots();
            window.animationManager.showNotification('Slot activated successfully!', 'success');
        }
    }

    maintenanceSlot(slotId) {
        const slot = this.slots.find(s => s.id === slotId);
        if (slot) {
            slot.status = 'maintenance';
            this.renderSlots();
            window.animationManager.showNotification('Slot marked for maintenance!', 'warning');
        }
    }

    // --- Booking Modals & Actions ---
    viewBooking(bookingId) {
        const b = this.bookings.find(bk => bk.id === bookingId);
        if (!b) return;
        const startDate = new Date(b.start_datetime);
        const endDate = new Date(b.end_datetime);

        this.showModal('Booking Details', `
            <div class="booking-details">
                <div class="detail-row"><span class="detail-label">Booking ID:</span><span class="detail-value">${b.token}</span></div>
                <div class="detail-row"><span class="detail-label">Customer:</span><span class="detail-value">${b.customer_name}</span></div>
                <div class="detail-row"><span class="detail-label">Vehicle:</span><span class="detail-value">${b.vehicle_number}</span></div>
                <div class="detail-row"><span class="detail-label">Slot:</span><span class="detail-value">${b.slot_name || b.slot}</span></div>
                <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${startDate.toLocaleDateString()}</span></div>
                <div class="detail-row"><span class="detail-label">Time:</span><span class="detail-value">${startDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value">${b.status}</span></div>
                <div class="detail-row"><span class="detail-label">Amount:</span><span class="detail-value">Rs.${b.total_cost?.toFixed(2) || '0.00'}</span></div>
            </div>
            <div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Close</button></div>
        `);
    }

    editBooking(bookingId) {
        window.animationManager.showNotification('Edit booking functionality would open here', 'info');
    }

    deleteBooking(bookingId) {
        if (!confirm('Are you sure you want to delete this booking?')) return;
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
        this.filteredBookings = [...this.bookings];
        this.renderBookings();
        window.animationManager.showNotification('Booking deleted successfully!', 'success');
    }

    exportBookings() {
        const headers = ['Booking ID', 'Customer', 'Vehicle', 'Slot', 'Date', 'Time', 'Status', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...this.filteredBookings.map(b => [
                b.token,
                b.customer_name,
                b.vehicle_number,
                b.slot_name || b.slot,
                new Date(b.start_datetime).toLocaleDateString(),
                new Date(b.start_datetime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                b.status,
                b.total_cost?.toFixed(2) || '0.00'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        window.animationManager.showNotification('Bookings exported successfully!', 'success');
    }

    // --- Modal Handling ---
    showModal(title, content) {
        const modalHTML = `
            <div class="dashboard-modal" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">${content}</div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeModal() {
        const modal = document.querySelector('.dashboard-modal');
        if (modal) modal.remove();
    }
}

// Global close modal function
function closeModal() {
    if (window.orgDashboard) window.orgDashboard.closeModal();
}

document.addEventListener('DOMContentLoaded', () => {
    window.orgDashboard = new OrgDashboard();
    window.orgDashboard.handleResize();
});
