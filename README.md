# 🎵 Spotify Clone with JioSaavn API

A full-featured music streaming website clone built with Flask and vanilla JavaScript, integrating the JioSaavn API.

## ✨ Features

- 🎵 Browse trending songs and top charts
- 🔍 Search songs, albums, artists, and playlists
- ▶️ Music player with play/pause, next/previous controls
- 🔀 Shuffle and repeat functionality
- 🎚️ Volume control
- 📱 Responsive design
- 🎨 Spotify-inspired UI

## 🚀 API Endpoints Implemented

### Search
- `/api/search/all` - Search all categories
- `/api/search/songs` - Search songs
- `/api/search/albums` - Search albums
- `/api/search/artists` - Search artists
- `/api/search/playlists` - Search playlists

### Content
- `/api/songs/{id}` - Get song details
- `/api/albums/{id}` - Get album details
- `/api/artists/{id}` - Get artist details
- `/api/playlists/{id}` - Get playlist details

### Discovery
- `/api/trending` - Get trending songs
- `/api/charts` - Get top charts
- `/api/modules` - Get home page modules

## 📦 Installation

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd spotify-clone
