/**
 * FRS Directory - Shared Interactivity API Store
 * 
 * This store is shared between directory-search, directory-filters, and directory-grid blocks.
 * All blocks read from and write to this shared state.
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

// State name maps for search
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

const ALL_STATES = Object.keys(STATE_NAMES);

// Normalize state to abbreviation
function normalizeState(state) {
    if (!state) return '';
    const stateMap = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateMap[state] || state.toUpperCase();
}

// Format phone number
function formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits[0] === '1') {
        return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
    }
    return phone;
}

// Get profile image URL
function getProfileImage(profile) {
    if (profile.headshot_url && profile.headshot_url.trim() !== '') {
        return profile.headshot_url;
    }
    if (profile.avatar_url && profile.avatar_url.trim() !== '' && !profile.avatar_url.includes('gravatar.com/avatar')) {
        return profile.avatar_url.replace(/-\d+x\d+\./, '-512x512.');
    }
    return '';
}

const { state, actions } = store('frs/directory', {
    state: {
        // Data
        profiles: [],
        filteredProfiles: [],
        serviceAreaCounts: {},
        availableServiceAreas: [],
        
        // Filters
        searchQuery: '',
        selectedServiceAreas: [],
        
        // Pagination
        perPage: 12,
        displayedCount: 0,
        
        // UI State
        isLoading: true,
        isInitialized: false,
        
        // Config (set by grid block)
        hubUrl: '',
        excludedNames: [],
        
        // Computed
        get hasFilters() {
            return state.searchQuery.length > 0 || state.selectedServiceAreas.length > 0;
        },
        get hasMoreProfiles() {
            return state.displayedCount < state.filteredProfiles.length;
        },
        get visibleProfiles() {
            return state.filteredProfiles.slice(0, state.displayedCount);
        },
        get totalCount() {
            return state.filteredProfiles.length;
        }
    },
    
    actions: {
        // Initialize with profiles data
        init(profiles, config = {}) {
            if (state.isInitialized) return;
            
            state.hubUrl = config.hubUrl || '';
            state.perPage = config.perPage || 12;
            state.excludedNames = config.excludedNames || [];
            
            // Deduplicate and filter profiles
            const seen = new Set();
            state.profiles = (profiles || []).filter(p => {
                const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
                if (state.excludedNames.includes(fullName)) return false;
                
                const email = (p.email || '').toLowerCase();
                if (email && seen.has(email)) return false;
                if (email) seen.add(email);
                
                return true;
            });
            
            // Extract service area counts
            actions.extractServiceAreas();
            
            // Check URL params
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('search')) {
                state.searchQuery = urlParams.get('search');
            }
            if (urlParams.get('areas')) {
                state.selectedServiceAreas = urlParams.get('areas').split(',');
            }
            
            // Apply initial filters
            actions.applyFilters();
            
            state.isLoading = false;
            state.isInitialized = true;
        },
        
        extractServiceAreas() {
            state.serviceAreaCounts = {};
            ALL_STATES.forEach(s => state.serviceAreaCounts[s] = 0);
            
            state.profiles.forEach(p => {
                let areas = p.service_areas;
                if (typeof areas === 'string') {
                    try { areas = JSON.parse(areas); p.service_areas = areas; } catch (e) { areas = []; }
                }
                if (areas && Array.isArray(areas)) {
                    areas.forEach(area => {
                        const abbr = normalizeState(area);
                        if (state.serviceAreaCounts.hasOwnProperty(abbr)) {
                            state.serviceAreaCounts[abbr]++;
                        }
                    });
                }
            });
            
            // Only include states with data
            state.availableServiceAreas = ALL_STATES.filter(s => state.serviceAreaCounts[s] > 0);
        },
        
        setSearchQuery(query) {
            state.searchQuery = query;
            actions.applyFilters();
            actions.updateURL();
        },
        
        toggleServiceArea(area) {
            if (state.selectedServiceAreas.includes(area)) {
                state.selectedServiceAreas = state.selectedServiceAreas.filter(a => a !== area);
            } else {
                state.selectedServiceAreas = [...state.selectedServiceAreas, area];
            }
            actions.applyFilters();
            actions.updateURL();
        },
        
        clearFilters() {
            state.searchQuery = '';
            state.selectedServiceAreas = [];
            actions.applyFilters();
            actions.updateURL();
        },
        
        applyFilters() {
            let filtered = [...state.profiles];
            
            // Search filter
            if (state.searchQuery) {
                const q = state.searchQuery.toLowerCase().trim();
                filtered = filtered.filter(p => {
                    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
                    const loc = (p.city_state || '').toLowerCase();
                    const region = (p.region || '').toLowerCase();
                    const title = (p.job_title || '').toLowerCase();
                    
                    let rawAreas = p.service_areas || [];
                    if (typeof rawAreas === 'string') {
                        try { rawAreas = JSON.parse(rawAreas); } catch (e) { rawAreas = []; }
                    }
                    const areas = Array.isArray(rawAreas) ? rawAreas : [];
                    const areasText = areas.map(a => a.toLowerCase()).join(' ');
                    const stateNames = areas.map(a => STATE_NAMES[normalizeState(a)] || '').join(' ').toLowerCase();
                    
                    const searchText = `${name} ${loc} ${region} ${title} ${areasText} ${stateNames}`;
                    const words = q.split(/\s+/).filter(w => w.length > 0);
                    return words.some(word => searchText.includes(word));
                });
            }
            
            // Service areas filter
            if (state.selectedServiceAreas.length > 0) {
                filtered = filtered.filter(p => {
                    let areas = p.service_areas;
                    if (typeof areas === 'string') {
                        try { areas = JSON.parse(areas); } catch (e) { return false; }
                    }
                    if (!areas || !Array.isArray(areas)) return false;
                    const normalizedAreas = areas.map(a => normalizeState(a));
                    return state.selectedServiceAreas.some(area => normalizedAreas.includes(area));
                });
            }
            
            state.filteredProfiles = filtered;
            state.displayedCount = Math.min(state.perPage, filtered.length);
        },
        
        loadMore() {
            state.displayedCount = Math.min(
                state.displayedCount + state.perPage,
                state.filteredProfiles.length
            );
        },
        
        updateURL() {
            const params = new URLSearchParams();
            if (state.searchQuery) params.set('search', state.searchQuery);
            if (state.selectedServiceAreas.length) params.set('areas', state.selectedServiceAreas.join(','));
            
            const newURL = params.toString() 
                ? `${window.location.pathname}?${params}` 
                : window.location.pathname;
            window.history.replaceState({}, '', newURL);
        }
    },
    
    // Callbacks for directives
    callbacks: {
        onSearchInput(event) {
            actions.setSearchQuery(event.target.value);
        },
        
        onSearchSubmit(event) {
            event.preventDefault();
        },
        
        onServiceAreaClick() {
            const context = getContext();
            actions.toggleServiceArea(context.area);
        },
        
        onClearFilters() {
            actions.clearFilters();
        },
        
        onLoadMore() {
            actions.loadMore();
        }
    }
});

// Export utilities for blocks
export { STATE_NAMES, ALL_STATES, normalizeState, formatPhone, getProfileImage };
