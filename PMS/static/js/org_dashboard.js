// Organization Dashboard JavaScript
class OrgDashboard {
    constructor() {
        this.slots = [];
        this.bookings = [];
        this.filteredSlots = [];
        this.filteredBookings = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.setupUserMenu();
        this.animateStats();
        this.renderSlots();
        this.renderBookings();
    }

    setupEventListeners() {
        // Search functionality
        const slotsSearch = document.getElementById('slotsSearch');
        const bookingsSearch = document.getElementById('bookingsSearch');
        
        if (slotsSearch) {
            slotsSearch.addEventListener('input', 
                window.utils.debounce(() => this.filterSlots(), 300)
            );
        }

        if (bookingsSearch) {
            bookingsSearch.addEventListener('input',
                window.utils.debounce(() => this.filterBookings(), 300)
            );
        }

        // Filter functionality
        const statusFilter = document.getElementById('slotStatusFilter');
        const typeFilter = document.getElementById('slotTypeFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterSlots());
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterSlots());
        }

        // Add slot button
        const addSlotBtn = document.getElementById('addSlotBtn');
        if (addSlotBtn) {
            addSlotBtn.addEventListener('click', () => this.showAddSlotModal());
        }

        // Window resize for responsive tables
        window.addEventListener('resize', () => this.handleResize());
    }

    setupUserMenu() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenuToggle && userDropdown) {
            userMenuToggle.addEventListener('click', () => {
                userDropdown.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });
        }
    }

    loadData() {
        // Sample slots data
        this.slots = [
            {
                id: 1,
                name: 'Slot A-001',
                type: '4W',
                status: 'available',
                location: 'Level 1, Section A',
                rate: 5.00,
                lastUpdated: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                name: 'Slot A-002',
                type: '4W',
                status: 'occupied',
                location: 'Level 1, Section A',
                rate: 5.00,
                customer: 'John Doe',
                vehicleNumber: 'KA01AB1234',
                lastUpdated: '2024-01-15T09:15:00Z'
            },
            {
                id: 3,
                name: 'Slot B-001',
                type: '2W',
                status: 'available',
                location: 'Level 1, Section B',
                rate: 2.00,
                lastUpdated: '2024-01-15T11:00:00Z'
            },
            {
                id: 4,
                name: 'Slot B-002',
                type: '2W',
                status: 'maintenance',
                location: 'Level 1, Section B',
                rate: 2.00,
                lastUpdated: '2024-01-14T16:45:00Z'
            },
            {
                id: 5,
                name: 'Slot C-001',
                type: '4W',
                status: 'occupied',
                location: 'Level 2, Section C',
                rate: 6.00,
                customer: 'Jane Smith',
                vehicleNumber: 'KA02CD5678',
                lastUpdated: '2024-01-15T08:30:00Z'
            },
            {
                id: 6,
                name: 'Slot C-002',
                type: '4W',
                status: 'available',
                location: 'Level 2, Section C',
                rate: 6.00,
                lastUpdated: '2024-01-15T12:15:00Z'
            }
        ];

        // Sample bookings data
        this.bookings = [
            {
                id: 'BK001',
                customer: 'John Doe',
                vehicle: 'KA01AB1234',
                slot: 'A-002',
                date: '2024-01-15',
                time: '09:00 - 18:00',
                status: 'confirmed',
                amount: 45.00
            },
            {
                id: 'BK002',
                customer: 'Jane Smith',
                vehicle: 'KA02CD5678',
                slot: 'C-001',
                date: '2024-01-15',
                time: '08:30 - 17:30',
                status: 'confirmed',
                amount: 54.00
            },
            {
                id: 'BK003',
                customer: 'Mike Johnson',
                vehicle: 'KA03EF9012',
                slot: 'B-003',
                date: '2024-01-15',
                time: '10:00 - 14:00',
                status: 'pending',
                amount: 8.00
            },
            {
                id: 'BK004',
                customer: 'Sarah Wilson',
                vehicle: 'KA04GH3456',
                slot: 'A-005',
                date: '2024-01-14',
                time: '15:00 - 19:00',
                status: 'cancelled',
                amount: 20.00
            },
            {
                id: 'BK005',
                customer: 'David Brown',
                vehicle: 'KA05IJ7890',
                slot: 'C-003',
                date: '2024-01-14',
                time: '11:30 - 16:30',
                status: 'confirmed',
                amount: 30.00
            }
        ];

        this.filteredSlots = [...this.slots];
        this.filteredBookings = [...this.bookings];
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
        const searchTerm = document.getElementById('slotsSearch').value.toLowerCase().trim();
        const statusFilter = document.getElementById('slotStatusFilter').value;
        const typeFilter = document.getElementById('slotTypeFilter').value;

        this.filteredSlots = this.slots.filter(slot => {
            const matchesSearch = !searchTerm || 
                slot.name.toLowerCase().includes(searchTerm) ||
                slot.location.toLowerCase().includes(searchTerm) ||
                (slot.customer && slot.customer.toLowerCase().includes(searchTerm));

            const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
            const matchesType = typeFilter === 'all' || slot.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });

        this.renderSlots();
    }

    filterBookings() {
        const searchTerm = document.getElementById('bookingsSearch').value.toLowerCase().trim();

        this.filteredBookings = this.bookings.filter(booking => {
            return !searchTerm ||
                booking.id.toLowerCase().includes(searchTerm) ||
                booking.customer.toLowerCase().includes(searchTerm) ||
                booking.vehicle.toLowerCase().includes(searchTerm) ||
                booking.slot.toLowerCase().includes(searchTerm);
        });

        this.renderBookings();
    }

    renderSlots() {
        const slotsGrid = document.getElementById('slotsGrid');
        if (!slotsGrid) return;

        if (this.filteredSlots.length === 0) {
            slotsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-car-side" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No slots found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        slotsGrid.innerHTML = this.filteredSlots.map(slot => `
            <div class="slot-card" data-slot-id="${slot.id}">
                <div class="slot-header">
                    <div class="slot-title">${slot.name}</div>
                    <div class="slot-status status-${slot.status}">${slot.status}</div>
                </div>
                
                <div class="slot-details">
                    <div class="slot-detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${slot.location}</span>
                    </div>
                    <div class="slot-detail-item">
                        <i class="fas fa-tag"></i>
                        <span>${slot.type === '2W' ? 'Two Wheeler' : 'Four Wheeler'}</span>
                    </div>
                    <div class="slot-detail-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Rs.${slot.rate}/hour</span>
                    </div>
                    ${slot.customer ? `
                        <div class="slot-detail-item">
                            <i class="fas fa-user"></i>
                            <span>${slot.customer}</span>
                        </div>
                        <div class="slot-detail-item">
                            <i class="fas fa-car"></i>
                            <span>${slot.vehicleNumber}</span>
                        </div>
                    ` : ''}
                    <div class="slot-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>Updated ${window.utils.formatDate(new Date(slot.lastUpdated))}</span>
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

        // Add animation
        const cards = slotsGrid.querySelectorAll('.slot-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
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

        tableBody.innerHTML = this.filteredBookings.map(booking => `
            <tr data-booking-id="${booking.id}">
                <td>${booking.id}</td>
                <td>${booking.customer}</td>
                <td>${booking.vehicle}</td>
                <td>${booking.slot}</td>
                <td>${booking.date}<br><small style="color: var(--text-secondary);">${booking.time}</small></td>
                <td><span class="booking-status status-${booking.status}">${booking.status}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn action-view" onclick="orgDashboard.viewBooking('${booking.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="table-action-btn action-edit" onclick="orgDashboard.editBooking('${booking.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn action-delete" onclick="orgDashboard.deleteBooking('${booking.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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

        mobileContainer.innerHTML = this.filteredBookings.map(booking => `
            <div class="booking-mobile-card" data-booking-id="${booking.id}">
                <div class="mobile-card-header">
                    <div class="mobile-booking-id">${booking.id}</div>
                    <div class="booking-status status-${booking.status}">${booking.status}</div>
                </div>
                
                <div class="mobile-card-details">
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Customer:</span>
                        <span class="mobile-detail-value">${booking.customer}</span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Vehicle:</span>
                        <span class="mobile-detail-value">${booking.vehicle}</span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Slot:</span>
                        <span class="mobile-detail-value">${booking.slot}</span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Date:</span>
                        <span class="mobile-detail-value">${booking.date}</span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Time:</span>
                        <span class="mobile-detail-value">${booking.time}</span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Amount:</span>
                        <span class="mobile-detail-value">Rs.${booking.amount}</span>
                    </div>
                </div>
                
                <div class="mobile-card-actions">
                    <button class="table-action-btn action-view" onclick="orgDashboard.viewBooking('${booking.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="table-action-btn action-edit" onclick="orgDashboard.editBooking('${booking.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="table-action-btn action-delete" onclick="orgDashboard.deleteBooking('${booking.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    handleResize() {
        // Handle responsive behavior
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

    // Action Methods
    showAddSlotModal() {
        this.showModal('Add New Slot', `
            <form class="modal-form" onsubmit="orgDashboard.addSlot(event)">
                <div class="form-group">
                    <label>Slot Name</label>
                    <input type="text" name="name" placeholder="e.g., A-001" required>
                </div>
                <div class="form-group">
                    <label>Slot Type</label>
                    <select name="type" required>
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
                    <input type="number" name="rate" step="0.01" min="0" placeholder="5.00" required>
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
        
        // Add new slot
        const newSlot = {
            id: Date.now(),
            name: slotData.name,
            type: slotData.type,
            status: 'available',
            location: slotData.location,
            rate: parseFloat(slotData.rate),
            lastUpdated: new Date().toISOString()
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
                    <select name="type" required>
                        <option value="2W" ${slot.type === '2W' ? 'selected' : ''}>Two Wheeler</option>
                        <option value="4W" ${slot.type === '4W' ? 'selected' : ''}>Four Wheeler</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value="${slot.location}" required>
                </div>
                <div class="form-group">
                    <label>Hourly Rate (Rs.)</label>
                    <input type="number" name="rate" step="0.01" min="0" value="${slot.rate}" required>
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
                type: slotData.type,
                location: slotData.location,
                rate: parseFloat(slotData.rate),
                status: slotData.status,
                lastUpdated: new Date().toISOString()
            };
            
            this.filteredSlots = [...this.slots];
            this.renderSlots();
            
            window.animationManager.showNotification('Slot updated successfully!', 'success');
            this.closeModal();
        }
    }

    deleteSlot(slotId) {
        const slot = this.slots.find(s => s.id === slotId);
        if (!slot) return;

        if (confirm(`Are you sure you want to delete slot ${slot.name}?`)) {
            this.slots = this.slots.filter(s => s.id !== slotId);
            this.filteredSlots = [...this.slots];
            this.renderSlots();
            
            window.animationManager.showNotification('Slot deleted successfully!', 'success');
        }
    }

    activateSlot(slotId) {
        const slotIndex = this.slots.findIndex(s => s.id === slotId);
        if (slotIndex !== -1) {
            this.slots[slotIndex].status = 'available';
            this.slots[slotIndex].lastUpdated = new Date().toISOString();
            this.filteredSlots = [...this.slots];
            this.renderSlots();
            
            window.animationManager.showNotification('Slot activated successfully!', 'success');
        }
    }

    maintenanceSlot(slotId) {
        const slotIndex = this.slots.findIndex(s => s.id === slotId);
        if (slotIndex !== -1) {
            this.slots[slotIndex].status = 'maintenance';
            this.slots[slotIndex].lastUpdated = new Date().toISOString();
            this.filteredSlots = [...this.slots];
            this.renderSlots();
            
            window.animationManager.showNotification('Slot marked for maintenance!', 'warning');
        }
    }

    viewBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        this.showModal('Booking Details', `
            <div class="booking-details">
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${booking.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer:</span>
                    <span class="detail-value">${booking.customer}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Vehicle:</span>
                    <span class="detail-value">${booking.vehicle}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Slot:</span>
                    <span class="detail-value">${booking.slot}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${booking.date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${booking.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="booking-status status-${booking.status}">${booking.status}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">Rs.${booking.amount}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        `);
    }

    editBooking(bookingId) {
        window.animationManager.showNotification('Edit booking functionality would open here', 'info');
    }

    deleteBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        if (confirm(`Are you sure you want to delete booking ${bookingId}?`)) {
            this.bookings = this.bookings.filter(b => b.id !== bookingId);
            this.filteredBookings = [...this.bookings];
            this.renderBookings();
            
            window.animationManager.showNotification('Booking deleted successfully!', 'success');
        }
    }

    exportBookings() {
        // Create CSV content
        const headers = ['Booking ID', 'Customer', 'Vehicle', 'Slot', 'Date', 'Time', 'Status', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...this.filteredBookings.map(booking => [
                booking.id,
                booking.customer,
                booking.vehicle,
                booking.slot,
                booking.date,
                booking.time,
                booking.status,
                booking.amount.toFixed(2)
            ].join(','))
        ].join('\n');

        // Download CSV
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

    showBookingsModal() {
        window.animationManager.showNotification('Bookings modal functionality would open here', 'info');
    }

    showReportsModal() {
        window.animationManager.showNotification('Reports modal functionality would open here', 'info');
    }

    showSettingsModal() {
        window.animationManager.showNotification('Settings modal functionality would open here', 'info');
    }

    showModal(title, content) {
        const modalHTML = `
            <div class="dashboard-modal" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        // Add modal styles if not present
        if (!document.querySelector('.dashboard-modal-styles')) {
            const styles = document.createElement('style');
            styles.className = 'dashboard-modal-styles';
            styles.textContent = `
                .dashboard-modal {
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
                .modal-content {
                    background: var(--bg-primary);
                    border-radius: 1rem;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-heavy);
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
                .modal-form .form-group {
                    margin-bottom: 1rem;
                }
                .modal-form label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                .modal-form input, .modal-form select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid var(--border-color);
                    border-radius: 0.5rem;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }
                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                    justify-content: flex-end;
                }
                .booking-details {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .detail-label {
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .detail-value {
                    color: var(--text-primary);
                    font-weight: 600;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeModal() {
        const modal = document.querySelector('.dashboard-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Global function to close modal
function closeModal() {
    if (window.orgDashboard) {
        window.orgDashboard.closeModal();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orgDashboard = new OrgDashboard();
    
    // Initial resize check
    window.orgDashboard.handleResize();
});