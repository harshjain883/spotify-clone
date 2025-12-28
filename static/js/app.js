// API Configuration
const API_BASE = '';

// State Management
const state = {
    currentSong: null,
    isPlaying: false,
    queue: [],
    currentIndex: 0,
    shuffle: false,
    repeat: 'off', // off, one, all
    volume: 0.7,
    likedSongs: new Set(),
    currentPage: 'home'
};

// DOM Elements
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeBar = document.getElementById('volumeBar');
const volumeProgress = document.getElementById('volumeProgress');
const volumeBtn = document.getElementById('volumeBtn');
const playerImage = document.getElementById('playerImage');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const content = document.getElementById('content');
const loading = document.getElementById('loading');
const queueBtn = document.getElementById('queueBtn');
const queueSidebar = document.getElementById('queueSidebar');
const closeQueue = document.getElementById('closeQueue');
const queueList = document.getElementById('queueList');
const likeBtn = document.getElementById('likeBtn');
const navItems = document.querySelectorAll('.nav-item');

// Initialize
audio.volume = state.volume;
loadHomePage();
loadLikedSongs();

// API Functions
async function apiRequest(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { error: error.message, data: null };
    }
}

// UI Helper Functions
function showLoading() {
    loading.classList.add('active');
    content.style.display = 'none';
}

function hideLoading() {
    loading.classList.remove('active');
    content.style.display = 'block';
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getImageUrl(imageArray) {
    if (!imageArray || !Array.isArray(imageArray)) return 'https://via.placeholder.com/300';
    return imageArray[2]?.url || imageArray[1]?.url || imageArray[0]?.url || 'https://via.placeholder.com/300';
}

function getArtistNames(item) {
    if (!item.artists?.primary) return 'Unknown Artist';
    return item.artists.primary.map(a => a.name).join(', ');
}

// Card Creation Functions
function createSongCard(song) {
    return `
        <div class="card" onclick="playSongById('${song.id}')">
            <div class="card-image">
                <img src="${getImageUrl(song.image)}" alt="${song.name}">
                <button class="play-btn-card" onclick="event.stopPropagation(); playSongById('${song.id}')">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="card-title">${song.name}</div>
            <div class="card-subtitle">${getArtistNames(song)}</div>
        </div>
    `;
}

function createAlbumCard(album) {
    return `
        <div class="card" onclick="viewAlbum('${album.id}')">
            <div class="card-image">
                <img src="${getImageUrl(album.image)}" alt="${album.name}">
                <button class="play-btn-card" onclick="event.stopPropagation(); playAlbum('${album.id}')">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="card-title">${album.name}</div>
            <div class="card-subtitle">${album.description || getArtistNames(album) || 'Album'}</div>
        </div>
    `;
}

function createPlaylistCard(playlist) {
    return `
        <div class="card" onclick="viewPlaylist('${playlist.id}')">
            <div class="card-image">
                <img src="${getImageUrl(playlist.image)}" alt="${playlist.name}">
                <button class="play-btn-card" onclick="event.stopPropagation(); playPlaylist('${playlist.id}')">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="card-title">${playlist.name}</div>
            <div class="card-subtitle">${playlist.description || playlist.subtitle || 'Playlist'}</div>
        </div>
    `;
}

// Page Loading Functions
async function loadHomePage() {
    showLoading();
    const data = await apiRequest('/api/home');
    
    if (!data.success || !data.data) {
        content.innerHTML = '<p style="text-align: center; padding: 40px;">Failed to load content. Please try again.</p>';
        hideLoading();
        return;
    }

    const { trending_songs, popular_albums, featured_playlists } = data.data;

    let html = '';

    if (trending_songs?.length > 0) {
        html += `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Trending Now</h2>
                </div>
                <div class="grid">
                    ${trending_songs.slice(0, 6).map(song => createSongCard(song)).join('')}
                </div>
            </div>
        `;
    }

    if (popular_albums?.length > 0) {
        html += `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Popular Albums</h2>
                </div>
                <div class="grid">
                    ${popular_albums.slice(0, 6).map(album => createAlbumCard(album)).join('')}
                </div>
            </div>
        `;
    }

    if (featured_playlists?.length > 0) {
        html += `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Featured Playlists</h2>
                </div>
                <div class="grid">
                    ${featured_playlists.slice(0, 6).map(playlist => createPlaylistCard(playlist)).join('')}
                </div>
            </div>
        `;
    }

    content.innerHTML = html || '<p style="text-align: center; padding: 40px;">No content available</p>';
    hideLoading();
}

async function loadTrendingPage() {
    showLoading();
    const data = await apiRequest('/api/trending');
    
    const songs = data.data?.results || [];
    
    let html = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Trending Songs</h2>
            </div>
            <div class="grid">
                ${songs.map(song => createSongCard(song)).join('')}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    hideLoading();
}

async function performSearch(query) {
    showLoading();
    const data = await apiRequest(`/api/search/all?query=${encodeURIComponent(query)}`);
    
    const songs = data.data?.songs?.results || [];
    const albums = data.data?.albums?.results || [];
    const playlists = data.data?.playlists?.results || [];

    let html = `<h2 style="margin-bottom: 24px;">Search Results for "${query}"</h2>`;

    if (songs.length > 0) {
        html += `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Songs</h2>
                </div>
                <div class="grid">
                    ${songs.slice(0, 6).map(song => createSongCard(song)).join('')}
                </div>
            </div>
        `;
    }

    if (albums.length > 0) {
        html += `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Albums</h2>
                </div>
                <div class="grid">
                    ${albums.slice(0, 6).map(album => createAlbumCard(album)).join('')}
                </div>
            </div>
        `;
    }

    if (playlists.length > 0) {
        html += `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Playlists</h2>
                </div>
                <div class="grid">
                    ${playlists.slice(0, 6).map(playlist => createPlaylistCard(playlist)).join('')}
                </div>
            </div>
        `;
    }

    if (songs.length === 0 && albums.length === 0 && playlists.length === 0) {
        html += '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No results found</p>';
    }

    content.innerHTML = html;
    hideLoading();
}

// View Functions
async function viewAlbum(albumId) {
    showLoading();
    const data = await apiRequest(`/api/albums?id=${albumId}`);
    const album = data.data;

    if (!album) {
        hideLoading();
        return;
    }

    let html = `
        <div style="margin-bottom: 40px;">
            <div style="display: flex; gap: 24px; margin-bottom: 24px; align-items: flex-end;">
                <img src="${getImageUrl(album.image)}" style="width: 232px; height: 232px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
                <div>
                    <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">ALBUM</p>
                    <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 16px;">${album.name}</h1>
                    <p style="font-size: 14px; color: var(--text-secondary);">
                        ${getArtistNames(album)} • ${album.year || ''} • ${album.songCount || album.songs?.length || 0} songs
                    </p>
                </div>
            </div>
            <button onclick="playAlbum('${albumId}')" class="search-btn" style="margin-bottom: 24px;">
                <i class="fas fa-play"></i> Play
            </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
    `;

    if (album.songs?.length > 0) {
        album.songs.forEach((song, index) => {
            html += `
                <div style="display: grid; grid-template-columns: 40px 1fr auto; gap: 16px; padding: 8px 16px; border-radius: 4px; cursor: pointer;" 
                     onmouseover="this.style.backgroundColor='var(--bg-hover)'" 
                     onmouseout="this.style.backgroundColor='transparent'"
                     onclick="playSongById('${song.id}')">
                    <span style="color: var(--text-secondary); padding-top: 8px;">${index + 1}</span>
                    <div>
                        <div style="font-weight: 500; margin-bottom: 4px;">${song.name}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">${getArtistNames(song)}</div>
                    </div>
                    <div style="color: var(--text-secondary); padding-top: 8px;">${formatTime(song.duration)}</div>
                </div>
            `;
        });
    }

    html += '</div>';
    content.innerHTML = html;
    hideLoading();
}

async function viewPlaylist(playlistId) {
    showLoading();
    const data = await apiRequest(`/api/playlists?id=${playlistId}`);
    const playlist = data.data;

    if (!playlist) {
        hideLoading();
        return;
    }

    let html = `
        <div style="margin-bottom: 40px;">
            <div style="display: flex; gap: 24px; margin-bottom: 24px; align-items: flex-end;">
                <img src="${getImageUrl(playlist.image)}" style="width: 232px; height: 232px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
                <div>
                    <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">PLAYLIST</p>
                    <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 16px;">${playlist.name}</h1>
                    <p style="font-size: 14px; color: var(--text-secondary);">
                        ${playlist.songCount || playlist.songs?.length || 0} songs
                    </p>
                </div>
            </div>
            <button onclick="playPlaylist('${playlistId}')" class="search-btn" style="margin-bottom: 24px;">
                <i class="fas fa-play"></i> Play
            </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
    `;

    if (playlist.songs?.length > 0) {
        playlist.songs.forEach((song, index) => {
            html += `
                <div style="display: grid; grid-template-columns: 40px 60px 1fr auto; gap: 16px; padding: 8px 16px; border-radius: 4px; cursor: pointer;" 
                     onmouseover="this.style.backgroundColor='var(--bg-hover)'" 
                     onmouseout="this.style.backgroundColor='transparent'"
                     onclick="playSongById('${song.id}')">
                    <span style="color: var(--text-secondary); padding-top: 8px;">${index + 1}</span>
                    <img src="${getImageUrl(song.image)}" style="width: 48px; height: 48px; border-radius: 4px;">
                    <div>
                        <div style="font-weight: 500; margin-bottom: 4px;">${song.name}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">${getArtistNames(song)}</div>
                    </div>
                    <div style="color: var(--text-secondary); padding-top: 8px;">${formatTime(song.duration)}</div>
                </div>
            `;
        });
    }

    html += '</div>';
    content.innerHTML = html;
    hideLoading();
}

// Playback Functions
async function playSongById(songId) {
    const data = await apiRequest(`/api/songs/${songId}`);
    const songDetails = data.data?.[0];

    if (!songDetails) {
        alert('Unable to load song');
        return;
    }

    state.currentSong = songDetails;
    const audioUrl = songDetails.downloadUrl?.[songDetails.downloadUrl.length - 1]?.url;

    if (audioUrl) {
        audio.src = audioUrl;
        audio.play();
        state.isPlaying = true;
        updatePlayerUI();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

async function playAlbum(albumId) {
    const data = await apiRequest(`/api/albums?id=${albumId}`);
    const album = data.data;

    if (album?.songs?.length > 0) {
        state.queue = album.songs;
        state.currentIndex = 0;
        await playSongById(album.songs[0].id);
        updateQueue();
    }
}

async function playPlaylist(playlistId) {
    const data = await apiRequest(`/api/playlists?id=${playlistId}`);
    const playlist = data.data;

    if (playlist?.songs?.length > 0) {
        state.queue = playlist.songs;
        state.currentIndex = 0;
        await playSongById(playlist.songs[0].id);
        updateQueue();
    }
}

function updatePlayerUI() {
    if (state.currentSong) {
        playerImage.src = getImageUrl(state.currentSong.image);
        playerTitle.textContent = state.currentSong.name;
        playerArtist.textContent = getArtistNames(state.currentSong);

        if (state.likedSongs.has(state.currentSong.id)) {
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            likeBtn.classList.remove('liked');
            likeBtn.innerHTML = '<i class="far fa-heart"></i>';
        }

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: state.currentSong.name,
                artist: getArtistNames(state.currentSong),
                album: state.currentSong.album?.name || '',
                artwork: [{ src: getImageUrl(state.currentSong.image), sizes: '512x512', type: 'image/jpeg' }]
            });
        }
    }
}

function updateQueue() {
    if (!state.queue || state.queue.length === 0) {
        queueList.innerHTML = '<p class="empty-queue">Queue is empty</p>';
        return;
    }

    queueList.innerHTML = state.queue.map((song, index) => `
        <div class="queue-item ${index === state.currentIndex ? 'active' : ''}" onclick="playQueueSong(${index})">
            <img src="${getImageUrl(song.image)}" alt="${song.name}">
            <div class="queue-item-info">
                <div class="queue-item-title">${song.name}</div>
                <div class="queue-item-artist">${getArtistNames(song)}</div>
            </div>
        </div>
    `).join('');
}

async function playQueueSong(index) {
    if (index >= 0 && index < state.queue.length) {
        state.currentIndex = index;
        await playSongById(state.queue[index].id);
        updateQueue();
    }
}

// Liked Songs Management
function loadLikedSongs() {
    try {
        const saved = localStorage.getItem('likedSongs');
        if (saved) {
            state.likedSongs = new Set(JSON.parse(saved));
        }
    } catch (e) {
        console.error('Error loading liked songs:', e);
    }
}

function saveLikedSongs() {
    try {
        localStorage.setItem('likedSongs', JSON.stringify([...state.likedSongs]));
    } catch (e) {
        console.error('Error saving liked songs:', e);
    }
}

// Event Listeners
playBtn.addEventListener('click', () => {
    if (state.isPlaying) {
        audio.pause();
        state.isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        if (audio.src) {
            audio.play();
            state.isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }
});

nextBtn.addEventListener('click', async () => {
    if (state.queue.length > 0) {
        if (state.shuffle) {
            state.currentIndex = Math.floor(Math.random() * state.queue.length);
        } else {
            state.currentIndex = (state.currentIndex + 1) % state.queue.length;
        }
        await playSongById(state.queue[state.currentIndex].id);
        updateQueue();
    }
});

prevBtn.addEventListener('click', async () => {
    if (state.queue.length > 0) {
        state.currentIndex = state.currentIndex - 1 < 0 ? state.queue.length - 1 : state.currentIndex - 1;
        await playSongById(state.queue[state.currentIndex].id);
        updateQueue();
    }
});

shuffleBtn.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    shuffleBtn.classList.toggle('active', state.shuffle);
});

repeatBtn.addEventListener('click', () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeat);
    state.repeat = modes[(currentIndex + 1) % modes.length];
    
    repeatBtn.classList.toggle('active', state.repeat !== 'off');
    
    if (state.repeat === 'one') {
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="font-size: 10px; position: absolute;">1</span>';
    } else {
        repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
    }
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', async () => {
    if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
    } else if (state.queue.length > 0) {
        if (state.shuffle) {
            state.currentIndex = Math.floor(Math.random() * state.queue.length);
        } else {
            state.currentIndex = (state.currentIndex + 1) % state.queue.length;
        }
        
        if (state.repeat === 'all' || state.currentIndex !== 0) {
            await playSongById(state.queue[state.currentIndex].id);
            updateQueue();
        }
    }
});

progressBar.addEventListener('click', (e) => {
    if (audio.duration) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    }
});

volumeBar.addEventListener('click', (e) => {
    const rect = volumeBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    state.volume = Math.max(0, Math.min(1, percent));
    audio.volume = state.volume;
    volumeProgress.style.width = `${state.volume * 100}%`;
    updateVolumeIcon();
});

volumeBtn.addEventListener('click', () => {
    if (audio.volume > 0) {
        audio.dataset.prevVolume = audio.volume;
        audio.volume = 0;
        volumeProgress.style.width = '0%';
    } else {
        const prevVolume = parseFloat(audio.dataset.prevVolume) || state.volume;
        audio.volume = prevVolume;
        volumeProgress.style.width = `${prevVolume * 100}%`;
    }
    updateVolumeIcon();
});

function updateVolumeIcon() {
    const vol = audio.volume;
    if (vol === 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (vol < 0.5) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        performSearch(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    }
});

queueBtn.addEventListener('click', () => {
    queueSidebar.classList.toggle('active');
});

closeQueue.addEventListener('click', () => {
    queueSidebar.classList.remove('active');
});

likeBtn.addEventListener('click', () => {
    if (state.currentSong) {
        if (state.likedSongs.has(state.currentSong.id)) {
            state.likedSongs.delete(state.currentSong.id);
        } else {
            state.likedSongs.add(state.currentSong.id);
        }
        updatePlayerUI();
        saveLikedSongs();
    }
});

navItems.forEach(item => {
    item.addEventListener('click', async (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const page = item.dataset.page;
        state.currentPage = page;
        
        switch(page) {
            case 'home':
                await loadHomePage();
                break;
            case 'search':
                searchInput.focus();
                break;
            case 'trending':
                await loadTrendingPage();
                break;
            case 'library':
                loadLibraryPage();
                break;
        }
    });
});

function loadLibraryPage() {
    const likedSongsArray = [...state.likedSongs];
    
    if (likedSongsArray.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <i class="fas fa-heart" style="font-size: 64px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h2 style="margin-bottom: 8px;">No Liked Songs</h2>
                <p style="color: var(--text-secondary);">Start liking songs to see them here</p>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Liked Songs</h2>
                <p style="color: var(--text-secondary);">${likedSongsArray.length} songs</p>
            </div>
            <div style="text-align: center; padding: 40px;">
                <p style="color: var(--text-secondary);">Liked songs list feature coming soon!</p>
            </div>
        </div>
    `;
}

// Media Session API
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevBtn.click());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextBtn.click());
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        playBtn.click();
    }
    
    if (e.code === 'ArrowRight' && audio.duration) {
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
    }
    
    if (e.code === 'ArrowLeft' && audio.duration) {
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
    }
});
