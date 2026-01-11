// Global state
let currentQueue = [];
let currentSongIndex = 0;

// Utility functions
function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getImageUrl(imageData) {
    if (!imageData) return 'https://via.placeholder.com/300?text=No+Image';
    
    // Handle array of image objects
    if (Array.isArray(imageData)) {
        // Try to get highest quality (usually index 2)
        for (let i = imageData.length - 1; i >= 0; i--) {
            if (imageData[i]?.link) return imageData[i].link;
            if (imageData[i]?.url) return imageData[i].url;
        }
    }
    
    // Handle string
    if (typeof imageData === 'string') return imageData;
    
    // Handle object
    if (imageData.link) return imageData.link;
    if (imageData.url) return imageData.url;
    
    return 'https://via.placeholder.com/300?text=No+Image';
}

function getAudioUrl(song) {
    if (!song) return null;
    
    // Try downloadUrl array (JioSaavn format)
    if (song.downloadUrl && Array.isArray(song.downloadUrl)) {
        // Prefer higher quality
        const quality = song.downloadUrl.find(q => q.quality === '320kbps') ||
                       song.downloadUrl.find(q => q.quality === '160kbps') ||
                       song.downloadUrl.find(q => q.quality === '96kbps') ||
                       song.downloadUrl[song.downloadUrl.length - 1];
        
        if (quality) {
            return quality.link || quality.url;
        }
    }
    
    // Try direct downloadUrl string
    if (typeof song.downloadUrl === 'string') return song.downloadUrl;
    
    // Try media_url
    if (song.media_url) return song.media_url;
    
    // Try url
    if (song.url) return song.url;
    
    return null;
}

// Fetch home data
async function fetchHomeData() {
    try {
        console.log('[HOME] Loading...');
        
        showLoading('trendingGrid');
        showLoading('chartsGrid');
        showLoading('recommendedGrid');
        
        const response = await fetch('/api/modules');
        console.log('[HOME] Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('[HOME] Data:', result);
        
        if (result.success && result.data) {
            const data = result.data;
            
            // Try different module types
            let displayed = false;
            
            // Try albums
            if (data.albums && Array.isArray(data.albums) && data.albums.length > 0) {
                displayCards('trendingGrid', data.albums.slice(0, 6));
                displayCards('chartsGrid', data.albums.slice(6, 12));
                displayCards('recommendedGrid', data.albums.slice(12, 18));
                displayed = true;
            }
            
            // Try playlists
            if (!displayed && data.playlists && Array.isArray(data.playlists) && data.playlists.length > 0) {
                displayCards('trendingGrid', data.playlists.slice(0, 6));
                displayCards('chartsGrid', data.playlists.slice(6, 12));
                displayCards('recommendedGrid', data.playlists.slice(12, 18));
                displayed = true;
            }
            
            // Try trending
            if (!displayed && data.trending && Array.isArray(data.trending) && data.trending.length > 0) {
                displayCards('trendingGrid', data.trending.slice(0, 6));
                displayCards('chartsGrid', data.trending.slice(6, 12));
                displayCards('recommendedGrid', data.trending.slice(12, 18));
                displayed = true;
            }
            
            // Try charts
            if (!displayed && data.charts && Array.isArray(data.charts) && data.charts.length > 0) {
                displayCards('trendingGrid', data.charts.slice(0, 6));
                displayCards('chartsGrid', data.charts.slice(6, 12));
                displayCards('recommendedGrid', data.charts.slice(12, 18));
                displayed = true;
            }
            
            if (!displayed) {
                throw new Error('No displayable data in response');
            }
            
        } else {
            throw new Error(result.error || 'Invalid response format');
        }
        
    } catch (error) {
        console.error('[HOME] Error:', error);
        const errorMsg = 'Failed to load. Click to retry.';
        showError('trendingGrid', errorMsg, 'fetchHomeData()');
        showError('chartsGrid', errorMsg, 'fetchHomeData()');
        showError('recommendedGrid', errorMsg, 'fetchHomeData()');
    }
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
            </div>
        `;
    }
}

function showError(containerId, message, retryFn) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading" style="cursor: pointer;" onclick="${retryFn || ''}">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

function displayCards(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-music"></i>
                <p>No items available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => createCard(item)).join('');
}

function createCard(item) {
    const image = getImageUrl(item.image);
    const title = item.name || item.title || 'Unknown';
    const subtitle = item.description || item.subtitle || 
                    item.primaryArtists || 
                    (item.artists?.primary ? item.artists.primary.map(a => a.name).join(', ') : '') ||
                    '';
    const type = item.type || 'album';
    const id = item.id;
    
    let onclick = '';
    if (type === 'song') {
        onclick = `onclick="playSongById('${id}')"`;
    } else if (type === 'album') {
        onclick = `onclick="window.location.href='/album/${id}'"`;
    } else if (type === 'artist') {
        onclick = `onclick="window.location.href='/artist/${id}'"`;
    } else if (type === 'playlist') {
        onclick = `onclick="window.location.href='/playlist/${id}'"`;
    }
    
    return `
        <div class="card" ${onclick}>
            <img src="${image}" alt="${title}" class="card-image" 
                 onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            <div class="card-title">${title}</div>
            <div class="card-subtitle">${subtitle}</div>
            ${type === 'song' ? `
                <button class="play-button" onclick="event.stopPropagation(); playSongById('${id}')">
                    <i class="fas fa-play"></i>
                </button>
            ` : ''}
        </div>
    `;
}

// Play song by ID
async function playSongById(songId) {
    try {
        console.log('[PLAY] Fetching song:', songId);
        
        const response = await fetch(`/api/songs/${songId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('[PLAY] Song data:', result);
        
        if (result.success && result.data) {
            const songs = Array.isArray(result.data) ? result.data : [result.data];
            if (songs.length > 0) {
                playSong(songs[0]);
            } else {
                throw new Error('No song data received');
            }
        } else {
            throw new Error(result.error || 'Failed to load song');
        }
    } catch (error) {
        console.error('[PLAY] Error:', error);
        alert('Error loading song: ' + error.message);
    }
}

function playSong(song) {
    console.log('[PLAY] Playing:', song);
    
    const audioUrl = getAudioUrl(song);
    
    if (!audioUrl) {
        console.error('[PLAY] No audio URL found in:', song);
        alert('Cannot play this song - no audio URL available');
        return;
    }
    
    console.log('[PLAY] Audio URL:', audioUrl);
    
    // Update UI
    const image = getImageUrl(song.image);
    const title = song.name || song.title || 'Unknown';
    const artist = song.primaryArtists || 
                  (song.artists?.primary ? song.artists.primary.map(a => a.name).join(', ') : '') ||
                  'Unknown Artist';
    
    document.getElementById('playerImage').src = image;
    document.getElementById('playerTitle').textContent = title;
    document.getElementById('playerArtist').textContent = artist;
    
    // Play audio
    const audio = document.getElementById('audioPlayer');
    audio.src = audioUrl;
    
    audio.play()
        .then(() => {
            console.log('[PLAY] Playing successfully');
            const playBtn = document.getElementById('playBtn');
            if (playBtn) {
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        })
        .catch(error => {
            console.error('[PLAY] Error:', error);
            alert('Failed to play: ' + error.message);
        });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('[APP] Page loaded');
    
    if (window.location.pathname === '/') {
        fetchHomeData();
    }
});

// Expose globally
window.playSongById = playSongById;
window.fetchHomeData = fetchHomeData;
