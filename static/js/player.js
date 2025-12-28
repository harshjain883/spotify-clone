// Music Player Controller
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.timelineSlider = document.getElementById('timelineSlider');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');
        this.likeBtn = document.getElementById('likeBtn');
        
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 'off'; // off, one, all
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Play/Pause
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        // Previous/Next
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        
        // Shuffle
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        
        // Repeat
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Timeline
        this.timelineSlider.addEventListener('input', (e) => this.seek(e));
        
        // Volume
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e));
        
        // Like button
        this.likeBtn.addEventListener('click', () => this.toggleLike());
        
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateTime());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('ended', () => this.onSongEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        
        // Set initial volume
        this.audio.volume = this.volumeSlider.value / 100;
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    }
    
    onPlay() {
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    onPause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    playPrevious() {
        if (currentSongIndex > 0) {
            currentSongIndex--;
            playSongById(currentQueue[currentSongIndex].id);
        }
    }
    
    playNext() {
        if (currentSongIndex < currentQueue.length - 1) {
            currentSongIndex++;
            playSongById(currentQueue[currentSongIndex].id);
        } else if (this.repeatMode === 'all') {
            currentSongIndex = 0;
            playSongById(currentQueue[currentSongIndex].id);
        }
    }
    
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.style.color = this.isShuffled ? 'var(--accent-color)' : 'var(--text-secondary)';
    }
    
    toggleRepeat() {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        if (this.repeatMode === 'off') {
            this.repeatBtn.style.color = 'var(--text-secondary)';
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
        } else if (this.repeatMode === 'all') {
            this.repeatBtn.style.color = 'var(--accent-color)';
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
        } else {
            this.repeatBtn.style.color = 'var(--accent-color)';
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="font-size: 10px;">1</span>';
        }
    }
    
    seek(e) {
        const seekTime = (e.target.value / 100) * this.audio.duration;
        this.audio.currentTime = seekTime;
    }
    
    setVolume(e) {
        this.audio.volume = e.target.value / 100;
        
        const volumeBtn = document.getElementById('volumeBtn');
        if (this.audio.volume === 0) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (this.audio.volume < 0.5) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
    
    updateTime() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        
        if (!isNaN(duration)) {
            const progress = (currentTime / duration) * 100;
            this.timelineSlider.value = progress;
            
            this.currentTimeEl.textContent = this.formatTime(currentTime);
        }
    }
    
    onMetadataLoaded() {
        this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
    }
    
    onSongEnded() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.playNext();
        }
    }
    
    toggleLike() {
        const icon = this.likeBtn.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.likeBtn.style.color = 'var(--accent-color)';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.likeBtn.style.color = 'var(--text-secondary)';
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize player
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
});
