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

# Try multiple JioSaavn API endpoints (in order of preference)
API_ENDPOINTS = [
    "https://saavn.dev/api",  # Most reliable
    "https://jiosaavn-api-privatecvc.vercel.app/api",
    "https://saavnapi.vercel.app",
]

# Current working API
CURRENT_API = None

def find_working_api():
    """Find a working API endpoint"""
    global CURRENT_API
    
    if CURRENT_API:
        return CURRENT_API
    
    for api in API_ENDPOINTS:
        try:
            logger.info(f"Testing API: {api}")
            response = requests.get(f"{api}/search/songs?query=test&limit=1", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    CURRENT_API = api
                    logger.info(f"✅ Found working API: {api}")
                    return api
        except Exception as e:
            logger.error(f"❌ API {api} failed: {str(e)}")
            continue
    
    # Default fallback
    CURRENT_API = API_ENDPOINTS[0]
    return CURRENT_API

def make_request(endpoint, params=None):
    """Make API request with error handling"""
    try:
        api_base = find_working_api()
        
        # Remove leading slash from endpoint
        endpoint = endpoint.lstrip('/')
        url = f"{api_base}/{endpoint}"
        
        logger.info(f"Requesting: {url} | Params: {params}")
        
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        logger.info(f"Response success: {data.get('success', 'N/A')}")
        return data
        
    except requests.Timeout:
        logger.error("Request timeout")
        return {"success": False, "error": "Request timeout"}
    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return {"success": False, "error": str(e)}
    except ValueError as e:
        logger.error(f"JSON parse error: {str(e)}")
        return {"success": False, "error": "Invalid JSON response"}
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
    """Health check - finds and tests working API"""
    try:
        api_base = find_working_api()
        test = make_request('search/songs', {'query': 'test', 'limit': '1'})
        
        return jsonify({
            "success": True,
            "api_working": test.get('success', False),
            "api_url": api_base,
            "test_response": test
        })
    except Exception as e:
        return jsonify({
            "success": False, 
            "error": str(e),
            "tried_apis": API_ENDPOINTS
        })

@app.route('/api/modules')
def get_modules():
    """Get home modules - using search for trending content"""
    # Search for popular albums
    albums = make_request('search/albums', {'query': 'bollywood', 'limit': '20'})
    
    if albums.get('success'):
        return jsonify({
            "success": True,
            "data": {
                "albums": albums.get('data', {}).get('results', [])
            }
        })
    
    # Fallback
    return jsonify({
        "success": False,
        "error": "Failed to load modules"
    })

@app.route('/api/trending')
def get_trending():
    """Get trending songs"""
    data = make_request('search/songs', {'query': 'trending bollywood', 'limit': '20'})
    return jsonify(data)

@app.route('/api/charts')
def get_charts():
    """Get top charts"""
    data = make_request('search/playlists', {'query': 'top charts', 'limit': '20'})
    return jsonify(data)

# ==================== SEARCH ====================

@app.route('/api/search/all')
def search_all():
    """Search all"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    data = make_request('search/all', {'query': query})
    return jsonify(data)

@app.route('/api/search/songs')
def search_songs():
    """Search songs"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_request('search/songs', {
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
    
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_request('search/albums', {
        'query': query,
        'page': page,
        'limit': limit
    })
    return jsonify(data)

@app.route('/api/search/artists')
def search_artists():
    """Search artists"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_request('search/artists', {
        'query': query,
        'page': page,
        'limit': limit
    })
    return jsonify(data)

@app.route('/api/search/playlists')
def search_playlists():
    """Search playlists"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_request('search/playlists', {
        'query': query,
        'page': page,
        'limit': limit
    })
    return jsonify(data)

# ==================== DETAILS ====================

@app.route('/api/songs/<song_id>')
def get_song(song_id):
    """Get song by ID"""
    data = make_request(f'songs/{song_id}')
    return jsonify(data)

@app.route('/api/albums/<album_id>')
def get_album(album_id):
    """Get album by ID"""
    data = make_request(f'albums/{album_id}')
    return jsonify(data)

@app.route('/api/playlists/<playlist_id>')
def get_playlist(playlist_id):
    """Get playlist by ID"""
    data = make_request(f'playlists/{playlist_id}')
    return jsonify(data)

@app.route('/api/artists/<artist_id>')
def get_artist(artist_id):
    """Get artist by ID"""
    data = make_request(f'artists/{artist_id}')
    return jsonify(data)

@app.route('/api/lyrics/<song_id>')
def get_lyrics(song_id):
    """Get lyrics"""
    data = make_request(f'songs/{song_id}/lyrics')
    return jsonify(data)

# ==================== TEST PAGE ====================

@app.route('/test-api')
def test_api_page():
    """Test API page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>API Test - Auto Detect</title>
        <style>
            body { 
                font-family: Arial; 
                padding: 20px; 
                background: #121212; 
                color: #fff; 
                max-width: 1200px;
                margin: 0 auto;
            }
            h1 { color: #1db954; }
            button { 
                background: #1db954; 
                color: #000; 
                border: none; 
                padding: 12px 24px; 
                margin: 10px 5px; 
                cursor: pointer; 
                border-radius: 20px;
                font-weight: bold;
            }
            button:hover { background: #1ed760; }
            pre { 
                background: #282828; 
                padding: 15px; 
                border-radius: 8px; 
                overflow-x: auto;
                max-height: 500px;
                overflow-y: auto;
            }
            .status { 
                padding: 10px; 
                border-radius: 5px; 
                margin: 10px 0;
            }
            .success { background: #1db954; color: #000; }
            .error { background: #f44336; color: #fff; }
            .info { background: #2196F3; color: #fff; }
        </style>
    </head>
    <body>
        <h1>🎵 JioSaavn API Test (Auto-Detect)</h1>
        <div id="api-status" class="status info">Detecting API...</div>
        
        <div id="status"></div>
        
        <h2>Test Endpoints:</h2>
        <button onclick="testHealth()">🔍 Check API Health</button>
        <button onclick="testSearch('songs', 'dilbar')">🎵 Search Songs</button>
        <button onclick="testSearch('albums', 'bollywood')">💿 Search Albums</button>
        <button onclick="testSong('JGaRKE44')">🎵 Get Song</button>
        
        <h2>Response:</h2>
        <pre id="results">Click a button to test...</pre>
        
        <script>
            async function testHealth() {
                try {
                    showStatus(true, 'Testing API health...');
                    const res = await fetch('/api/health');
                    const data = await res.json();
                    
                    const apiStatus = document.getElementById('api-status');
                    if (data.api_working) {
                        apiStatus.className = 'status success';
                        apiStatus.textContent = '✅ API Working: ' + data.api_url;
                        showStatus(true, '✅ API is working!');
                    } else {
                        apiStatus.className = 'status error';
                        apiStatus.textContent = '❌ API Not Working';
                        showStatus(false, '❌ API test failed');
                    }
                    
                    document.getElementById('results').textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    showStatus(false, '❌ Error: ' + error.message);
                }
            }
            
            function showStatus(success, message) {
                const status = document.getElementById('status');
                status.className = 'status ' + (success ? 'success' : 'error');
                status.textContent = message;
            }
            
            async function testSearch(type, query) {
                try {
                    showStatus(true, `Searching ${type}...`);
                    const res = await fetch(`/api/search/${type}?query=${query}&limit=5`);
                    const data = await res.json();
                    
                    if (data.success) {
                        showStatus(true, `✅ Found results!`);
                    } else {
                        showStatus(false, `❌ Failed: ${data.error}`);
                    }
                    
                    document.getElementById('results').textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    showStatus(false, '❌ Error: ' + error.message);
                }
            }
            
            async function testSong(id) {
                try {
                    showStatus(true, 'Fetching song...');
                    const res = await fetch(`/api/songs/${id}`);
                    const data = await res.json();
                    
                    if (data.success) {
                        showStatus(true, '✅ Song loaded!');
                    } else {
                        showStatus(false, `❌ Failed: ${data.error}`);
                    }
                    
                    document.getElementById('results').textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    showStatus(false, '❌ Error: ' + error.message);
                }
            }
            
            // Auto-test on load
            window.onload = () => testHealth();
        </script>
    </body>
    </html>
    """

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"success": False, "error": "Endpoint not found"}), 404
    return render_template('index.html')

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Server error: {str(e)}")
    return jsonify({"success": False, "error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
