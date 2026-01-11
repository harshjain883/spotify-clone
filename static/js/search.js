let searchTimeout;
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const searchResults = document.getElementById('searchResults');
const filterTabs = document.querySelectorAll('.filter-tab');

let currentFilter = 'all';
let currentSearchQuery = '';

// Event Listeners
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query.length > 0) {
            if (clearSearchBtn) clearSearchBtn.style.display = 'block';
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => performSearch(query), 500);
        } else {
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            showBrowseCategories();
        }
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        showBrowseCategories();
    });
}

if (filterTabs) {
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            if (currentSearchQuery) performSearch(currentSearchQuery);
        });
    });
}

async function performSearch(query) {
    currentSearchQuery = query;
    
    const endpoint = `/api/search/${currentFilter}`;
    
    try {
        console.log('[SEARCH] Query:', query, 'Filter:', currentFilter);
        
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Searching...</p>
                </div>
            `;
        }
        
        const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('[SEARCH] Results:', result);
        
        if (result.success && result.data) {
            displaySearchResults(result.data);
        } else {
            throw new Error(result.error || 'No results');
        }
    } catch (error) {
        console.error('[SEARCH] Error:', error);
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="loading">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Search failed: ${error.message}</p>
                </div>
            `;
        }
    }
}

function displaySearchResults(data) {
    if (!searchResults) return;
    
    searchResults.innerHTML = '';
    
    if (currentFilter === 'all') {
        let hasResults = false;
        
        // Check all result types
        if (data.songs?.results && data.songs.results.length > 0) {
            addResultSection('Songs', data.songs.results);
            hasResults = true;
        }
        if (data.albums?.results && data.albums.results.length > 0) {
            addResultSection('Albums', data.albums.results);
            hasResults = true;
        }
        if (data.artists?.results && data.artists.results.length > 0) {
            addResultSection('Artists', data.artists.results);
            hasResults = true;
        }
        if (data.playlists?.results && data.playlists.results.length > 0) {
            addResultSection('Playlists', data.playlists.results);
            hasResults = true;
        }
        
        if (!hasResults) {
            searchResults.innerHTML = `
                <div class="loading">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${currentSearchQuery}"</p>
                </div>
            `;
        }
    } else {
        const results = data.results || [];
        if (results.length > 0) {
            addResultSection('Results', results);
        } else {
            searchResults.innerHTML = `
                <div class="loading">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${currentSearchQuery}"</p>
                </div>
            `;
        }
    }
}

function addResultSection(title, items) {
    if (!searchResults) return;
    
    const section = document.createElement('section');
    section.className = 'content-section';
    
    const titleEl = document.createElement('h2');
    titleEl.className = 'section-title';
    titleEl.textContent = title;
    section.appendChild(titleEl);
    
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.innerHTML = items.slice(0, 12).map(item => createCard(item)).join('');
    section.appendChild(grid);
    
    searchResults.appendChild(section);
}

function showBrowseCategories() {
    if (!searchResults) return;
    
    searchResults.innerHTML = `
        <div class="browse-categories">
            <h2 class="section-title">Browse All</h2>
            <div class="categories-grid">
                <div class="category-card" style="background: linear-gradient(135deg, #1db954, #191414);" onclick="searchCategory('Bollywood')">
                    <h3>Bollywood</h3>
                    <i class="fas fa-music"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #e61e32, #1e3264);" onclick="searchCategory('Punjabi')">
                    <h3>Punjabi</h3>
                    <i class="fas fa-music"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #f59b23, #8d67ab);" onclick="searchCategory('Arijit Singh')">
                    <h3>Arijit Singh</h3>
                    <i class="fas fa-microphone"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #dc148c, #e8161f);" onclick="searchCategory('Shreya Ghoshal')">
                    <h3>Shreya Ghoshal</h3>
                    <i class="fas fa-user"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #1e3264, #376996);" onclick="searchCategory('Romantic')">
                    <h3>Romantic</h3>
                    <i class="fas fa-heart"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #8d67ab, #8d1b3d);" onclick="searchCategory('Party')">
                    <h3>Party</h3>
                    <i class="fas fa-glass-cheers"></i>
                </div>
            </div>
        </div>
    `;
}

function searchCategory(category) {
    if (searchInput) {
        searchInput.value = category;
        if (clearSearchBtn) clearSearchBtn.style.display = 'block';
        performSearch(category);
    }
}

// Expose globally
window.searchCategory = searchCategory;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('[SEARCH] Page loaded');
    showBrowseCategories();
});
