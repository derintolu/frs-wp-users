/**
 * LO Directory Search - Frontend JavaScript
 *
 * Communicates with the LO Grid block to filter results.
 */
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('frs-lo-search-form');
    const searchInput = document.getElementById('frs-lo-search-input');
    
    if (!searchForm || !searchInput) return;

    // Handle form submit
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });

    // Handle input changes (debounced)
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300);
    });

    function performSearch() {
        const query = searchInput.value.trim();
        
        // Find the grid's search input and sync it
        const gridSearchInput = document.getElementById('frs-search');
        if (gridSearchInput) {
            gridSearchInput.value = query;
            // Trigger input event to activate grid's filtering
            gridSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Update URL
        const params = new URLSearchParams(window.location.search);
        if (query) {
            params.set('search', query);
        } else {
            params.delete('search');
        }
        const newURL = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
        window.history.replaceState({}, '', newURL);

        // Scroll to grid if exists
        const gridSection = document.getElementById('frs-directory-section');
        if (gridSection && query) {
            gridSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Check URL params on load
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search');
    if (initialSearch) {
        searchInput.value = initialSearch;
    }
});
