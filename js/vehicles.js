// js/vehicles.js
// Vehicles page specific functionality

let currentFilter = 'all';
let currentSearchTerm = '';
let currentSort = 'default';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚗 Vehicles page loaded");
    
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }
    
    // Load vehicles first
    await fetchVehiclesFromSheet();
    
    // Check URL parameters for type filter
    checkUrlParams();
    
    // Initialize filters
    initFilters();
    
    // Initialize search
    initLiveSearch();
    
    // Initialize sort
    initSort();
    
    // Load vehicles
    loadVehicles();
});

function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    
    if (typeParam) {
        currentFilter = typeParam;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            const filterValue = tab.getAttribute('data-filter');
            if (filterValue === typeParam || 
                (typeParam === 'Car' && filterValue === 'Car') ||
                (typeParam === 'Bike' && filterValue === 'Bike')) {
                tab.classList.add('active');
            } else if (filterValue === 'all') {
                tab.classList.remove('active');
            }
        });
        
        // Update page title
        const titleEl = document.getElementById('page-title');
        const subtitleEl = document.getElementById('page-subtitle');
        if (titleEl && subtitleEl) {
            if (typeParam === 'Car') {
                titleEl.textContent = 'Find Your Perfect Car';
                subtitleEl.textContent = 'Browse through our collection of quality used cars';
            } else if (typeParam === 'Bike') {
                titleEl.textContent = 'Find Your Perfect Bike';
                subtitleEl.textContent = 'Browse through our collection of quality used bikes';
            }
        }
    }
}

function initFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentFilter = tab.getAttribute('data-filter');
            loadVehicles();
            
            // Update URL without reload
            const url = new URL(window.location);
            if (currentFilter !== 'all') {
                url.searchParams.set('type', currentFilter);
            } else {
                url.searchParams.delete('type');
            }
            window.history.pushState({}, '', url);
        });
    });
}

function initLiveSearch() {
    const searchInput = document.getElementById('live-search');
    const clearButton = document.getElementById('clear-search');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase().trim();
        
        if (clearButton) {
            clearButton.style.display = currentSearchTerm ? 'block' : 'none';
        }
        
        loadVehicles();
    });
    
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            clearButton.style.display = 'none';
            loadVehicles();
        });
    }
}

function initSort() {
    const sortSelect = document.getElementById('sort-price');
    
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        loadVehicles();
    });
}

function loadVehicles() {
    const grid = document.getElementById('vehicles-grid');
    const resultsSpan = document.querySelector('#results-count span');
    const noResults = document.getElementById('no-results');
    const spinner = document.getElementById('loading-spinner');
    
    if (!grid) return;
    
    // Show spinner
    if (spinner) spinner.style.display = 'block';
    if (noResults) noResults.style.display = 'none';
    
    setTimeout(() => {
        // Filter vehicles
        let filtered = window.allVehicles || [];
        
        // Apply type filter
        if (currentFilter !== 'all') {
            filtered = filtered.filter(v => v.type === currentFilter);
        }
        
        // Apply search filter
        if (currentSearchTerm) {
            filtered = filtered.filter(v => 
                v.name.toLowerCase().includes(currentSearchTerm) ||
                v.year.toString().includes(currentSearchTerm) ||
                v.type.toLowerCase().includes(currentSearchTerm)
            );
        }
        
        // Apply sorting
        if (currentSort !== 'default') {
            filtered = [...filtered].sort((a, b) => {
                switch(currentSort) {
                    case 'low-high':
                        return a.price - b.price;
                    case 'high-low':
                        return b.price - a.price;
                    case 'newest':
                        return b.year - a.year;
                    case 'oldest':
                        return a.year - b.year;
                    default:
                        return 0;
                }
            });
        }
        
        // Update results count
        if (resultsSpan) {
            resultsSpan.textContent = filtered.length;
        }
        
        // Hide spinner
        if (spinner) spinner.style.display = 'none';
        
        // Show no results if empty
        if (filtered.length === 0) {
            if (noResults) noResults.style.display = 'block';
            grid.innerHTML = '';
            return;
        }
        
        // Render vehicles
        renderVehicles(grid, filtered);
    }, 300); // Small delay for UX
}

function renderVehicles(grid, vehicles) {
    if (!grid) return;
    
    grid.innerHTML = vehicles.map(vehicle => `
        <div class="vehicle-card" onclick="openVehicleModal(${vehicle.id})">
            <div class="vehicle-image">
                <img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">
                <span class="vehicle-badge ${(vehicle.status || 'AVAILABLE').toLowerCase()}">
                    ${vehicle.status || 'AVAILABLE'}
                </span>
            </div>
            <div class="vehicle-info">
                <h3 class="vehicle-name">${vehicle.name}</h3>
                <p class="vehicle-year">${vehicle.year}</p>
                <p class="vehicle-price">${formatPrice(vehicle.price)}</p>
            </div>
        </div>
    `).join('');
}

// Make reset function globally available
window.resetAllFilters = function() {
    const searchInput = document.getElementById('live-search');
    const sortSelect = document.getElementById('sort-price');
    const clearButton = document.getElementById('clear-search');
    
    if (searchInput) {
        searchInput.value = '';
        currentSearchTerm = '';
    }
    
    if (clearButton) {
        clearButton.style.display = 'none';
    }
    
    if (sortSelect) {
        sortSelect.value = 'default';
        currentSort = 'default';
    }
    
    // Reset filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        const filterValue = tab.getAttribute('data-filter');
        if (filterValue === 'all') {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    currentFilter = 'all';
    
    // Remove URL params
    const url = new URL(window.location);
    url.searchParams.delete('type');
    window.history.pushState({}, '', url);
    
    loadVehicles();
};
