// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.organizations = [];
        this.filteredOrganizations = [];
        this.currentSection = 'overview';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.setupSidebar();
        this.animateStats();
        this.renderOrganizations();
    }

    setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Sidebar toggles
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (mobileSidebarToggle) {
            mobileSidebarToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Search functionality
        const organizationsSearch = document.getElementById('organizationsSearch');
        if (organizationsSearch) {
            organizationsSearch.addEventListener('input', 
                window.utils.debounce(() => this.filterOrganizations(), 300)
            );
        }

        // Filter functionality
        const orgStatusFilter = document.getElementById('orgStatusFilter');
        if (orgStatusFilter) {
            orgStatusFilter.addEventListener('change', () => this.filterOrganizations());
        }

        // Window resize for responsive behavior
        window.addEventListener('resize', () => this.handleResize());

        // Close mobile sidebar when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                e.target !== mobileSidebarToggle &&
                sidebar.classList.contains('mobile-open')) {
                this.closeMobileSidebar();
            }
        });
    }

    setupSidebar() {
        // Check for saved sidebar state
        const sidebarCollapsed = window.utils.storage.get('sidebarCollapsed');
        if (sidebarCollapsed) {
            document.getElementById('sidebar').classList.add('collapsed');
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const section = e.target.closest('.nav-link').dataset.section;
        
        if (section) {
            this.switchSection(section);
        }
    }

    switchSection(section) {
        this.currentSection = section;

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${section}"]`).closest('.nav-item').classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(contentSection => {
            contentSection.classList.remove('active');
        });
        
        document.querySelector(`.content-section[data-section="${section}"]`).classList.add('active');

        // Update page title
        const titles = {
            overview: 'Admin Dashboard',
            organizations: 'Organizations Management',
            users: 'Users Management',
            bookings: 'Bookings Management',
            analytics: 'Analytics & Reports',
            settings: 'System Settings'
        };
        
        document.getElementById('pageTitle').textContent = titles[section];

        // Close mobile sidebar after navigation
        this.closeMobileSidebar();

        // Add transition animation
        const activeSection = document.querySelector(`.content-section[data-section="${section}"]`);
        if (activeSection) {
            activeSection.style.opacity = '0';
            activeSection.style.transform = 'translateY(20px)';
            setTimeout(() => {
                activeSection.style.transition = 'all 0.3s ease-out';
                activeSection.style.opacity = '1';
                activeSection.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        
        // Save state
        window.utils.storage.set('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = this.getOrCreateSidebarOverlay();
        
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        sidebar.classList.remove('mobile-open');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    getOrCreateSidebarOverlay() {
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => this.closeMobileSidebar());
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    handleResize() {
        const width = window.innerWidth;
        
        if (width > 768) {
            this.closeMobileSidebar();
        }

        // Handle table responsiveness
        const tableContainer = document.querySelector('.organizations-table-container');
        const mobileContainer = document.getElementById('organizationsMobile');

        if (width <= 768) {
            if (tableContainer) tableContainer.style.display = 'none';
            if (mobileContainer) mobileContainer.style.display = 'block';
        } else {
            if (tableContainer) tableContainer.style.display = 'block';
            if (mobileContainer) mobileContainer.style.display = 'none';
        }
    }

    loadData() {
        // Sample organizations data
        this.organizations = [
            {
                id: 'ORG001',
                name: 'Downtown Plaza',
                type: 'Shopping Mall',
                email: 'admin@downtownplaza.com',
                phone: '+1 234 567 8901',
                totalSlots: 150,
                status: 'active',
                joinedDate: '2024-01-15'
            },
            {
                id: 'ORG002', 
                name: 'City Hospital',
                type: 'Healthcare',
                email: 'parking@cityhospital.com',
                phone: '+1 234 567 8902',
                totalSlots: 200,
                status: 'active',
                joinedDate: '2024-01-10'
            },
            {
                id: 'ORG003',
                name: 'ABC University',
                type: 'Educational',
                email: 'facilities@abcuniv.edu',
                phone: '+1 234 567 8903',
                totalSlots: 500,
                status: 'active',
                joinedDate: '2024-01-05'
            },
            {
                id: 'ORG004',
                name: 'Business Center',
                type: 'Office Complex',
                email: 'admin@businesscenter.com',
                phone: '+1 234 567 8904',
                totalSlots: 75,
                status: 'pending',
                joinedDate: '2024-01-18'
            },
            {
                id: 'ORG005',
                name: 'Grand Hotel',
                type: 'Hospitality',
                email: 'management@grandhotel.com',
                phone: '+1 234 567 8905',
                totalSlots: 100,
                status: 'suspended',
                joinedDate: '2024-01-01'
            },
            {
                id: 'ORG006',
                name: 'Tech Park',
                type: 'Office Complex',
                email: 'facilities@techpark.com',
                phone: '+1 234 567 8906',
                totalSlots: 300,
                status: 'active',
                joinedDate: '2024-01-12'
            }
        ];

        this.filteredOrganizations = [...this.organizations];
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

    filterOrganizations() {
        const searchTerm = document.getElementById('organizationsSearch').value.toLowerCase().trim();
        const statusFilter = document.getElementById('orgStatusFilter').value;

        this.filteredOrganizations = this.organizations.filter(org => {
            const matchesSearch = !searchTerm || 
                org.name.toLowerCase().includes(searchTerm) ||
                org.type.toLowerCase().includes(searchTerm) ||
                org.email.toLowerCase().includes(searchTerm) ||
                org.id.toLowerCase().includes(searchTerm);

            const matchesStatus = statusFilter === 'all' || org.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderOrganizations();
    }

    renderOrganizations() {
        this.renderOrganizationsTable();
        this.renderOrganizationsMobile();
    }

    renderOrganizationsTable() {
        const tableBody = document.getElementById('organizationsTableBody');
        if (!tableBody) return;

        if (this.filteredOrganizations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <i class="fas fa-building" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; display: block;"></i>
                        <h3>No organizations found</h3>
                        <p>Try adjusting your search criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredOrganizations.map(org => `
            <tr data-org-id="${org.id}">
                <td>${org.id}</td>
                <td>
                    <div class="org-info">
                        <div class="org-avatar">${org.name.charAt(0)}</div>
                        <div class="org-details">
                            <div class="org-name">${org.name}</div>
                            <div class="org-type">${org.type}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <a href="mailto:${org.email}" class="contact-email">${org.email}</a>
                        <span class="contact-phone">${org.phone}</span>
                    </div>
                </td>
                <td>
                    <div class="slot-count">
                        ${org.totalSlots}
                        <span class="slot-badge">slots</span>
                    </div>
                </td>
                <td>
                    <span class="org-status status-${org.status}">${org.status}</span>
                </td>
                <td>${window.utils.formatDate(new Date(org.joinedDate))}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn action-view" onclick="adminDashboard.viewOrganization('${org.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="table-action-btn action-edit" onclick="adminDashboard.editOrganization('${org.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn action-delete" onclick="adminDashboard.deleteOrganization('${org.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderOrganizationsMobile() {
        const mobileContainer = document.getElementById('organizationsMobile');
        if (!mobileContainer) return;

        if (this.filteredOrganizations.length === 0) {
            mobileContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-building" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No organizations found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        mobileContainer.innerHTML = this.filteredOrganizations.map(org => `
            <div class="org-mobile-card" data-org-id="${org.id}">
                <div class="mobile-card-header">
                    <div class="mobile-org-info">
                        <div class="mobile-org-name">${org.name}</div>
                        <div class="mobile-org-type">${org.type}</div>
                    </div>
                    <div class="org-status status-${org.status}">${org.status}</div>
                </div>
                
                <div class="mobile-card-details">
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">ID:</span>
                        <span class="mobile-detail-value">${org.id}</span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Email:</span>
                        <span class="mobile-detail-value">
                            <a href="mailto:${org.email}" class="contact-email">${org.email}</a>
                        </span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Phone:</span>
                        <span class="mobile-detail-value">${org.phone}</span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Total Slots:</span>
                        <span class="mobile-detail-value">${org.totalSlots}</span>
                    </div>
                    <div class="mobile-detail-item">
                        <span class="mobile-detail-label">Joined:</span>
                        <span class="mobile-detail-value">${window.utils.formatDate(new Date(org.joinedDate))}</span>
                    </div>
                </div>
                
                <div class="mobile-card-actions">
                    <button class="table-action-btn action-view" onclick="adminDashboard.viewOrganization('${org.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="table-action-btn action-edit" onclick="adminDashboard.editOrganization('${org.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="table-action-btn action-delete" onclick="adminDashboard.deleteOrganization('${org.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Action Methods
    showAddOrgModal() {
        this.showModal('Add New Organization', `
            <form class="modal-form" onsubmit="adminDashboard.addOrganization(event)">
                <div class="form-group">
                    <label>Organization Name</label>
                    <input type="text" name="name" placeholder="Enter organization name" required>
                </div>
                <div class="form-group">
                    <label>Organization Type</label>
                    <select name="type" required>
                        <option value="">Select type</option>
                        <option value="Shopping Mall">Shopping Mall</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Educational">Educational</option>
                        <option value="Office Complex">Office Complex</option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="Enter email address" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" placeholder="Enter phone number" required>
                </div>
                <div class="form-group">
                    <label>Total Slots</label>
                    <input type="number" name="totalSlots" min="1" placeholder="Enter total slots" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Organization</button>
                </div>
            </form>
        `);
    }

    addOrganization(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const orgData = Object.fromEntries(formData.entries());
        
        const newOrg = {
            id: 'ORG' + String(this.organizations.length + 1).padStart(3, '0'),
            name: orgData.name,
            type: orgData.type,
            email: orgData.email,
            phone: orgData.phone,
            totalSlots: parseInt(orgData.totalSlots),
            status: 'pending',
            joinedDate: new Date().toISOString().split('T')[0]
        };

        this.organizations.unshift(newOrg);
        this.filteredOrganizations = [...this.organizations];
        this.renderOrganizations();
        
        window.animationManager.showNotification('Organization added successfully!', 'success');
        this.closeModal();
    }

    viewOrganization(orgId) {
        const org = this.organizations.find(o => o.id === orgId);
        if (!org) return;

        this.showModal('Organization Details', `
            <div class="org-details">
                <div class="detail-row">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">${org.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${org.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${org.type}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">
                        <a href="mailto:${org.email}" style="color: var(--primary-color); text-decoration: none;">${org.email}</a>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${org.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Slots:</span>
                    <span class="detail-value">${org.totalSlots}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="org-status status-${org.status}">${org.status}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Joined Date:</span>
                    <span class="detail-value">${window.utils.formatDate(new Date(org.joinedDate))}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button type="button" class="btn btn-primary" onclick="adminDashboard.editOrganization('${org.id}')">Edit</button>
            </div>
        `);
    }

    editOrganization(orgId) {
        const org = this.organizations.find(o => o.id === orgId);
        if (!org) return;

        this.showModal('Edit Organization', `
            <form class="modal-form" onsubmit="adminDashboard.updateOrganization(event, '${orgId}')">
                <div class="form-group">
                    <label>Organization Name</label>
                    <input type="text" name="name" value="${org.name}" required>
                </div>
                <div class="form-group">
                    <label>Organization Type</label>
                    <select name="type" required>
                        <option value="Shopping Mall" ${org.type === 'Shopping Mall' ? 'selected' : ''}>Shopping Mall</option>
                        <option value="Healthcare" ${org.type === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                        <option value="Educational" ${org.type === 'Educational' ? 'selected' : ''}>Educational</option>
                        <option value="Office Complex" ${org.type === 'Office Complex' ? 'selected' : ''}>Office Complex</option>
                        <option value="Hospitality" ${org.type === 'Hospitality' ? 'selected' : ''}>Hospitality</option>
                        <option value="Other" ${org.type === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value="${org.email}" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value="${org.phone}" required>
                </div>
                <div class="form-group">
                    <label>Total Slots</label>
                    <input type="number" name="totalSlots" min="1" value="${org.totalSlots}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" required>
                        <option value="active" ${org.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="pending" ${org.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="suspended" ${org.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Organization</button>
                </div>
            </form>
        `);
    }

    updateOrganization(event, orgId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const orgData = Object.fromEntries(formData.entries());
        
        const orgIndex = this.organizations.findIndex(o => o.id === orgId);
        if (orgIndex !== -1) {
            this.organizations[orgIndex] = {
                ...this.organizations[orgIndex],
                name: orgData.name,
                type: orgData.type,
                email: orgData.email,
                phone: orgData.phone,
                totalSlots: parseInt(orgData.totalSlots),
                status: orgData.status
            };
            
            this.filteredOrganizations = [...this.organizations];
            this.renderOrganizations();
            
            window.animationManager.showNotification('Organization updated successfully!', 'success');
            this.closeModal();
        }
    }

    deleteOrganization(orgId) {
        const org = this.organizations.find(o => o.id === orgId);
        if (!org) return;

        if (confirm(`Are you sure you want to delete ${org.name}? This action cannot be undone.`)) {
            this.organizations = this.organizations.filter(o => o.id !== orgId);
            this.filteredOrganizations = [...this.organizations];
            this.renderOrganizations();
            
            window.animationManager.showNotification('Organization deleted successfully!', 'success');
        }
    }

    showModal(title, content) {
        const modalHTML = `
            <div class="admin-modal" onclick="closeModal()">
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
        if (!document.querySelector('.admin-modal-styles')) {
            const styles = document.createElement('style');
            styles.className = 'admin-modal-styles';
            styles.textContent = `
                .admin-modal {
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
                    max-width: 600px;
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
                .org-details {
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
        const modal = document.querySelector('.admin-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Global function to close modal
function closeModal() {
    if (window.adminDashboard) {
        window.adminDashboard.closeModal();
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
    
    // Initial resize check
    window.adminDashboard.handleResize();
});