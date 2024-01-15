from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import sqlite3


app = Flask(__name__)
CORS(app)
load_dotenv()

def init_db():
    conn = sqlite3.connect('spotify_tokens.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY,
            access_token TEXT NOT NULL,
            token_type TEXT,
            expires_in INTEGER,
            refresh_token TEXT,
            scope TEXT,
            obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )      
    ''')
    
    conn.commit()
    conn.close()

def store_token(access_token, token_type, expires_in, refresh_token, scope):
    conn = sqlite3.connect('spotify_tokens.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO tokens (access_token, token_type, expires_in, refresh_token, scope)
        VALUES (?, ?, ?, ?, ?)
    ''', (access_token, token_type, expires_in, refresh_token, scope))
    
    conn.commit()
    conn.close()

def get_token():
    # Get the most recent token, but that is fine since we only store one for now
    conn = sqlite3.connect('spotify_tokens.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tokens ORDER BY obtained_at DESC LIMIT 1')
    
    token_data = cursor.fetchone()
    
    conn.close()
    return token_data

@app.route("/callback", methods=['POST'])
def createToken():
    # client_id = "a3bb5d38c9e74401b2419ddf61cc4900"
    # client_secret = "828655be211448b880d4bec5cd426252"
    # encoded = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode('utf-8')
    # print(encoded)
    auth_code = request.json.get('code')
    if not auth_code:
        return jsonify({'error': 'Authorization code needed'}), 400

    print(auth_code)
    # Make the API request to spotify
    # print(os.environ.get('CLIENT_CREDENTIALS'))
    response = requests.post('https://accounts.spotify.com/api/token', 
                             headers={
                                        'Authorization': 'Basic ' + os.environ.get('CLIENT_CREDENTIALS')
                                    },
                             data={
                                        'grant_type': 'authorization_code', 
                                        'code': auth_code,
                                        'redirect_uri': os.environ.get("REDIRECT_URI")
                                    })
    
    print(response.json())
    print(response.status_code)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to retrieve access token'}), response.status_code
    
    access_token = response.json()['access_token']
    token_type = response.json()['token_type']
    expires_in = response.json()['expires_in']
    refresh_token = response.json()['refresh_token']
    scope = response.json()['scope']
    
    store_token(access_token, token_type, expires_in, refresh_token, scope)    
    return jsonify(response.json())

@app.route("/top-artists", methods=['GET'])
def getTopArtists():
    token_data = get_token()
    access_token = token_data[1]
    token_type = token_data[2]
    number_artists = 5
    
    response = requests.get(
        f'https://api.spotify.com/v1/me/top/artists?limit={number_artists}',
        headers= {
            'Authorization': f'{token_type} {access_token}'
        }
    )
    if response.status_code == 200:
        top_artists = response.json()
        return jsonify(top_artists)
    return jsonify({'error': 'failed to fetch top artists'}), response.status_code

@app.route("/recommended-artists", methods=['GET'])
def getRecommendedArtists():
    token_data = get_token()
    access_token = token_data[1]
    token_type = token_data[2]
    artistID = request.args.get('artistID')
    response = requests.get(
        f'https://api.spotify.com/v1/artists/{artistID}/related-artists',
        headers= {
            'Authorization': f'{token_type} {access_token}'
        }
    )
    if response.status_code == 200:
        data = response.json()
        similar_artists = data.get('artists', [])

        least_popular_artist = min(similar_artists, key=lambda x: x['popularity'])
        return jsonify(least_popular_artist)    
    return jsonify({'error': 'failed to fetch similar artists'}), response.status_code

init_db()
if __name__ == '__main__':
    app.run(debug=True)

# client_id = os.getenv('CLIENT_ID')
# client_secret = os.getenv('CLIENT_SECRET')

# print(client_id)
# print(client_secret)