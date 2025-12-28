from flask import Flask, jsonify, request
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

API_BASE = "https://jiosaavnapi-nu.vercel.app"

@app.route('/')
def home():
    return jsonify({
        "message": "MusicStream API is running!",
        "endpoints": {
            "home": "/api/home",
            "search_songs": "/api/search/songs?query=YOUR_QUERY",
            "trending": "/api/trending"
        }
    })

@app.route('/api/home')
def get_home():
    try:
        r1 = requests.get(f"{API_BASE}/api/search/songs?query=trending&limit=10", timeout=10)
        r2 = requests.get(f"{API_BASE}/api/search/albums?query=bollywood&limit=10", timeout=10)
        r3 = requests.get(f"{API_BASE}/api/search/playlists?query=hindi&limit=10", timeout=10)
        
        return jsonify({
            "success": True,
            "data": {
                "trending_songs": r1.json().get("data", {}).get("results", []),
                "popular_albums": r2.json().get("data", {}).get("results", []),
                "featured_playlists": r3.json().get("data", {}).get("results", [])
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search/songs')
def search_songs():
    try:
        query = request.args.get('query', '')
        if not query:
            return jsonify({"error": "Query required"}), 400
        
        r = requests.get(f"{API_BASE}/api/search/songs", params={
            "query": query,
            "limit": request.args.get('limit', 20)
        }, timeout=10)
        
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search/albums')
def search_albums():
    try:
        query = request.args.get('query', '')
        if not query:
            return jsonify({"error": "Query required"}), 400
        
        r = requests.get(f"{API_BASE}/api/search/albums", params={
            "query": query,
            "limit": request.args.get('limit', 20)
        }, timeout=10)
        
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search/playlists')
def search_playlists():
    try:
        query = request.args.get('query', '')
        if not query:
            return jsonify({"error": "Query required"}), 400
        
        r = requests.get(f"{API_BASE}/api/search/playlists", params={
            "query": query,
            "limit": request.args.get('limit', 20)
        }, timeout=10)
        
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/songs/<song_id>')
def get_song(song_id):
    try:
        r = requests.get(f"{API_BASE}/api/songs/{song_id}", timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/albums')
def get_album():
    try:
        album_id = request.args.get('id', '')
        if not album_id:
            return jsonify({"error": "Album ID required"}), 400
        
        r = requests.get(f"{API_BASE}/api/albums", params={"id": album_id}, timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/playlists')
def get_playlist():
    try:
        playlist_id = request.args.get('id', '')
        if not playlist_id:
            return jsonify({"error": "Playlist ID required"}), 400
        
        r = requests.get(f"{API_BASE}/api/playlists", params={"id": playlist_id}, timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trending')
def get_trending():
    try:
        r = requests.get(f"{API_BASE}/api/search/songs?query=trending&limit=30", timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run()
