// utils/spotifyClient.js
const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config.json');

const spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.client_id,
    clientSecret: config.spotify.client_secret,
});

let accessTokenExpires = 0; // Timestamp when token expires

async function refreshAccessToken() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        console.log('[Spotify] Access token refreshed. Expires in:', data.body['expires_in'], 'seconds.');
        spotifyApi.setAccessToken(data.body['access_token']);
        accessTokenExpires = Date.now() + (data.body['expires_in'] * 1000); // Convert to milliseconds
    } catch (err) {
        console.error('[Spotify] Gagal mendapatkan access token Spotify:', err);
        throw new Error('Could not authenticate with Spotify API.');
    }
}

/**
 * Mendapatkan informasi track dari URL Spotify.
 * Mendukung hanya URL track untuk saat ini.
 * @param {string} spotifyUrl - URL track Spotify.
 * @returns {Promise<{title: string, artist: string, album: string}|null>}
 */
async function getTrackInfo(spotifyUrl) {
    // Pastikan token valid atau refresh jika sudah kedaluwarsa
    if (!spotifyApi.getAccessToken() || Date.now() >= accessTokenExpires) {
        await refreshAccessToken();
    }

    const trackIdMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
    if (!trackIdMatch) {
        console.warn('[Spotify] URL bukan track Spotify yang valid:', spotifyUrl);
        return null;
    }
    const trackId = trackIdMatch[1];

    try {
        const data = await spotifyApi.getTrack(trackId);
        const track = data.body;
        return {
            title: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            album: track.album.name,
            // Anda bisa menambahkan info lain seperti thumbnail, duration, dll.
        };
    } catch (err) {
        console.error(`[Spotify] Gagal mendapatkan info track untuk ID ${trackId}:`, err);
        throw new Error('Failed to retrieve track info from Spotify.');
    }
}

// Initial token fetch on module load
refreshAccessToken().catch(() => {}); // Handle initial error quietly

module.exports = {
    getTrackInfo,
};