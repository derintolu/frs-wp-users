/**
 * Directory Filters Block - View Script
 * 
 * Populates service area chips from the shared store.
 */
import { store, getContext } from '@wordpress/interactivity';

const STATE_NAMES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Extend the store with filter-specific functionality
const { state, actions } = store('frs/directory', {
    callbacks: {
        // Called when filters block mounts - populate chips
        initFilters() {
            const container = document.querySelector('.frs-service-areas');
            if (!container || container.dataset.initialized) return;
            
            // Wait for data to be initialized
            if (!state.isInitialized) {
                setTimeout(() => this.initFilters(), 100);
                return;
            }
            
            container.innerHTML = '';
            container.dataset.initialized = 'true';
            
            state.availableServiceAreas.forEach(area => {
                const chip = document.createElement('div');
                chip.className = 'frs-service-area-chip';
                if (state.selectedServiceAreas.includes(area)) {
                    chip.classList.add('frs-service-area-chip--selected');
                }
                chip.dataset.serviceArea = area;
                chip.textContent = area;
                chip.title = `${STATE_NAMES[area]} (${state.serviceAreaCounts[area] || 0})`;
                chip.addEventListener('click', () => {
                    actions.toggleServiceArea(area);
                    chip.classList.toggle('frs-service-area-chip--selected');
                });
                container.appendChild(chip);
            });
        }
    }
});

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const checkAndInit = () => {
        const container = document.querySelector('.frs-service-areas');
        if (container && !container.dataset.initialized && state.isInitialized) {
            const { callbacks } = store('frs/directory');
            callbacks.initFilters();
        } else if (container && !container.dataset.initialized) {
            setTimeout(checkAndInit, 100);
        }
    };
    checkAndInit();
});
