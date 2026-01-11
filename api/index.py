from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get correct paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__,
            template_folder=os.path.join(BASE_DIR, 'templates'),
            static_folder=os.path.join(BASE_DIR, 'static'))

CORS(app)

# JioSaavn API
API_BASE = "https://jiosaavnapi-nu.vercel.app"

def make_request(endpoint, params=None):
    """Make API request with error handling"""
    try:
        url = f"{API_BASE}{endpoint}"
        logger.info(f"Requesting: {url} | Params: {params}")
        
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        logger.info(f"Response: {data.get('success', 'N/A')}")
        return data
        
    except requests.Timeout:
        logger.error("Request timeout")
        return {"success": False, "error": "Request timeout"}
    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"success": False, "error": str(e)}

# ==================== PAGES ====================

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search')
def search_page():
    return render_template('search.html')

@app.route('/album/<album_id>')
def album_page(album_id):
    return render_template('album.html', album_id=album_id)

@app.route('/artist/<artist_id>')
def artist_page(artist_id):
    return render_template('artist.html', artist_id=artist_id)

@app.route('/playlist/<playlist_id>')
def playlist_page(playlist_id):
    return render_template('playlist.html', playlist_id=playlist_id)

# ==================== API ENDPOINTS ====================

@app.route('/api/health')
def health():
    """Health check"""
    try:
        test = make_request('/modules')
        return jsonify({
            "success": True,
            "api_working": test.get('success', False),
            "api_url": API_BASE
        })
    except:
        return jsonify({"success": False, "error": "API not responding"})

@app.route('/api/modules')
def get_modules():
    """Get home modules"""
    data = make_request('/modules')
    return jsonify(data)

@app.route('/api/trending')
def get_trending():
    """Get trending"""
    # Use modules as fallback
    data = make_request('/modules')
    return jsonify(data)

@app.route('/api/charts')
def get_charts():
    """Get charts"""
    data = make_request('/modules')
    return jsonify(data)

# ==================== SEARCH ====================

@app.route('/api/search/all')
def search_all():
    """Search all"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    data = make_request('/search/all', {'query': query})
    return jsonify(data)

@app.route('/api/search/songs')
def search_songs():
    """Search songs"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_request('/search/songs', {
        'query': query,
        'page': page,
        'limit': limit
    })
    return jsonify(data)

@app.route('/api/search/albums')
def search_albums():
    """Search albums"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    data = make_request('/search/albums', {'query': query})
    return jsonify(data)

@app.route('/api/search/artists')
def search_artists():
    """Search artists"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    data = make_request('/search/artists', {'query': query})
    return jsonify(data)

@app.route('/api/search/playlists')
def search_playlists():
    """Search playlists"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    data = make_request('/search/playlists', {'query': query})
    return jsonify(data)

# ==================== DETAILS ====================

@app.route('/api/songs/<song_id>')
def get_song(song_id):
    """Get song by ID"""
    data = make_request(f'/songs/{song_id}')
    return jsonify(data)

@app.route('/api/albums/<album_id>')
def get_album(album_id):
    """Get album by ID"""
    data = make_request(f'/albums/{album_id}')
    return jsonify(data)

@app.route('/api/playlists/<playlist_id>')
def get_playlist(playlist_id):
    """Get playlist by ID"""
    data = make_request(f'/playlists/{playlist_id}')
    return jsonify(data)

@app.route('/api/artists/<artist_id>')
def get_artist(artist_id):
    """Get artist by ID"""
    data = make_request(f'/artists/{artist_id}')
    return jsonify(data)

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"success": False, "error": "Not found"}), 404
    return render_template('index.html')

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Server error: {str(e)}")
    return jsonify({"success": False, "error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
