// Index Page JavaScript
class ParkingSlotsManager {
    constructor() {
        this.slots = [];
        this.filteredSlots = [];
        this.searchInput = document.getElementById('searchInput');
        this.vehicleTypeFilter = document.getElementById('vehicleTypeFilter');
        this.locationFilter = document.getElementById('locationFilter');
        this.filterBtn = document.getElementById('filterBtn');
        this.slotsGrid = document.getElementById('slotsGrid');
        
        this.init();
    }

    async init() {
        await this.loadSlots();
        this.setupEventListeners();
        this.renderSlots();
    }

    async loadSlots() {
        try {
            const response = await fetch('/api/slots/');
            if (!response.ok) throw new Error('Failed to fetch slots');
            const data = await response.json();

            // Map API data to match previous structure
            this.slots = data.map(slot => ({
                id: slot.id,
                name: slot.organization_name + ' - ' + slot.slot_type,
                location: slot.organization_city.toLowerCase().replace(/\s+/g, '-'),
                address: slot.organization_address,
                type: slot.slot_type,
                totalSlots: slot.total_slots,
                availableSlots: slot.available_slots,
                price: parseFloat(slot.price),
                features: slot.features || [],
                distance: slot.distance || 'N/A' // optional if API provides
            }));

            this.filteredSlots = [...this.slots];
        } catch (error) {
            console.error('Error loading slots:', error);
            this.slotsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load parking slots</h3>
                    <p>Please try refreshing the page.</p>
                </div>
            `;
        }
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', 
                window.utils?.debounce ? window.utils.debounce(() => this.handleSearch(), 300) : () => this.handleSearch()
            );
        }

        if (this.filterBtn) {
            this.filterBtn.addEventListener('click', () => this.handleFilter());
        }

        [this.vehicleTypeFilter, this.locationFilter].forEach(filter => {
            if (filter) filter.addEventListener('change', () => this.handleFilter());
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' && e.target === this.searchInput) {
                this.handleFilter();
            }
        });
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            this.filteredSlots = [...this.slots];
        } else {
            this.filteredSlots = this.slots.filter(slot => 
                slot.name.toLowerCase().includes(searchTerm) ||
                slot.address.toLowerCase().includes(searchTerm) ||
                slot.location.toLowerCase().includes(searchTerm) ||
                slot.features.some(feature => feature.toLowerCase().includes(searchTerm))
            );
        }
        this.renderSlots();
    }

    handleFilter() {
        const vehicleType = this.vehicleTypeFilter.value;
        const location = this.locationFilter.value;
        const searchTerm = this.searchInput.value.toLowerCase().trim();

        this.filteredSlots = this.slots.filter(slot => {
            const matchesVehicleType = vehicleType === 'all' || slot.type === vehicleType;
            const matchesLocation = location === 'all' || slot.location === location;
            const matchesSearch = searchTerm === '' || 
                slot.name.toLowerCase().includes(searchTerm) ||
                slot.address.toLowerCase().includes(searchTerm) ||
                slot.location.toLowerCase().includes(searchTerm) ||
                slot.features.some(feature => feature.toLowerCase().includes(searchTerm));

            return matchesVehicleType && matchesLocation && matchesSearch;
        });

        this.renderSlots();
        window.animationManager?.showNotification(
            `Found ${this.filteredSlots.length} parking slots`, 
            'success'
        );
    }

    renderSlots() {
        if (!this.slotsGrid) return;

        this.slotsGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading parking slots...</p>
            </div>
        `;

        setTimeout(() => {
            if (this.filteredSlots.length === 0) {
                this.renderEmptyState();
            } else {
                this.renderSlotCards();
            }
        }, 500);
    }

    renderEmptyState() {
        this.slotsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car-side"></i>
                <h3>No Parking Slots Found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button class="btn btn-primary" onclick="window.clearFilters()">
                    <i class="fas fa-refresh"></i> Clear Filters
                </button>
            </div>
        `;
    }

    renderSlotCards() {
        this.slotsGrid.innerHTML = this.filteredSlots.map(slot => `
            <div class="slot-card" data-id="${slot.id}">
                <div class="slot-header">
                    <h3 class="slot-title">${slot.name}</h3>
                    <span class="slot-type type-${slot.type}">${slot.type}</span>
                </div>
                
                <div class="slot-info">
                    <div class="slot-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${slot.address}</span>
                    </div>
                    <div class="slot-detail">
                        <i class="fas fa-route"></i>
                        <span>${slot.distance} away</span>
                    </div>
                    <div class="slot-detail">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Rs.${slot.price.toFixed(2)}/hour</span>
                    </div>
                    <div class="slot-detail">
                        <i class="fas fa-star"></i>
                        <span>${slot.features.slice(0, 2).join(', ')}</span>
                    </div>
                </div>
                
                <div class="slot-availability">
                    <span class="availability-text">Available:</span>
                    <span class="available-count">${slot.availableSlots}</span>
                    <span class="total-count">/ ${slot.totalSlots}</span>
                </div>
                
                <div class="slot-actions">
                    <a href="/book_slot/" class="btn-book">
                        <i class="fas fa-calendar-plus"></i> Book Now
                    </a>
                    <button class="btn-details" onclick="slotsManager.showSlotDetails(${slot.id})">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const cards = this.slotsGrid.querySelectorAll('.slot-card');
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

    showSlotDetails(slotId) {
        const slot = this.slots.find(s => s.id === slotId);
        if (!slot) return;

        const modalHTML = `
            <div class="slot-details-modal" onclick="this.remove()">
                <div class="slot-details-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>${slot.name}</h2>
                        <button class="modal-close" onclick="this.closest('.slot-details-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="slot-detail-item"><strong>Location:</strong> ${slot.address}</div>
                        <div class="slot-detail-item"><strong>Vehicle Type:</strong> ${slot.type === '2W' ? 'Two Wheeler' : 'Four Wheeler'}</div>
                        <div class="slot-detail-item"><strong>Distance:</strong> ${slot.distance}</div>
                        <div class="slot-detail-item"><strong>Price:</strong> Rs.${slot.price.toFixed(2)} per hour</div>
                        <div class="slot-detail-item"><strong>Availability:</strong> ${slot.availableSlots} of ${slot.totalSlots} slots available</div>
                        <div class="slot-detail-item"><strong>Features:</strong>
                            <ul class="features-list">${slot.features.map(f => `<li>${f}</li>`).join('')}</ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="/book_slot/" class="btn btn-primary">
                            <i class="fas fa-calendar-plus"></i> Book This Slot
                        </a>
                    </div>
                </div>
            </div>
        `;

        if (!document.querySelector('.modal-styles')) {
            const styles = document.createElement('style');
            styles.className = 'modal-styles';
            styles.textContent = `
                .slot-details-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:3000; animation: fadeIn 0.3s ease-out; }
                .slot-details-content { background: var(--bg-primary); border-radius:1rem; max-width:500px; width:90%; max-height:80vh; overflow-y:auto; animation: slideIn 0.3s ease-out; }
                .modal-header { display:flex; justify-content:space-between; align-items:center; padding:1.5rem; border-bottom:1px solid var(--border-color); }
                .modal-close { background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-secondary); }
                .modal-body { padding:1.5rem; }
                .slot-detail-item { margin-bottom:1rem; color:var(--text-primary); }
                .features-list { margin:0.5rem 0 0 1rem; color:var(--text-secondary); }
                .modal-footer { padding:1.5rem; border-top:1px solid var(--border-color); text-align:center; }
            `;
            document.head.appendChild(styles);
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    clearFilters() {
        if (this.searchInput) this.searchInput.value = '';
        if (this.vehicleTypeFilter) this.vehicleTypeFilter.value = 'all';
        if (this.locationFilter) this.locationFilter.value = 'all';
        this.filteredSlots = [...this.slots];
        this.renderSlots();
        window.animationManager?.showNotification('Filters cleared', 'success');
    }
}

// Stats counter animation
class StatsCounter {
    constructor() {
        this.counters = document.querySelectorAll('.counter');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
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
}

// Initialize managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.slotsManager = new ParkingSlotsManager();
    new StatsCounter();

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.addEventListener('mouseenter', () => heroTitle.style.transform = 'scale(1.02)');
        heroTitle.addEventListener('mouseleave', () => heroTitle.style.transform = 'scale(1)');
    }

    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            hero.style.transform = `translateY(${scrollY * -0.5}px)`;
        });
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        heroSubtitle.style.borderRight = '2px solid white';
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                setTimeout(() => { heroSubtitle.style.borderRight = 'none'; }, 1000);
            }
        };
        setTimeout(typeWriter, 1000);
    }
});

// Global functions for slot management
window.clearFilters = () => {
    if (window.slotsManager) window.slotsManager.clearFilters();
};
