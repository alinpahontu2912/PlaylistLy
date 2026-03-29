import axios from 'axios';
import {
  saveToken,
  loadToken,
  removeToken,
  savePKCE,
  loadPKCE,
  removePKCE,
} from './token-store';

const CLIENT_ID = '7b41f3c80d47464c8556abed5c66a7d3';
const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';
const CORS_PROXY = 'https://corsproxy.io/?';
const SCOPES = [
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
].join(' ');

function getRedirectUri() {
  return window.location.origin + window.location.pathname;
}

function proxied(url) {
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

// --- PKCE helpers ---

function generateRandomString(length) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// --- Auth (PKCE) ---

export async function login() {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);
  savePKCE('spotify', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state: 'spotify',
  });

  window.location.href = `${AUTH_URL}?${params}`;
}

export async function handleCallback(code) {
  const verifier = loadPKCE('spotify');
  removePKCE('spotify');

  const { data } = await axios.post(
    proxied(TOKEN_URL),
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  const tokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  saveToken('spotify', tokenData);
  return tokenData;
}

export function disconnect() {
  removeToken('spotify');
}

export function isConnected() {
  const data = loadToken('spotify');
  return !!data && Date.now() < data.expiresAt;
}

// --- Internal helpers ---

function getAccessToken() {
  const data = loadToken('spotify');
  if (!data) throw new Error('Not authenticated with Spotify');
  if (Date.now() > data.expiresAt) throw new Error('Spotify token expired');
  return data.accessToken;
}

function headers() {
  return { Authorization: `Bearer ${getAccessToken()}` };
}

async function spotifyGet(url, params = {}) {
  const { data } = await axios.get(proxied(url), {
    headers: headers(),
    params,
  });
  return data;
}

async function spotifyPost(url, body) {
  const { data } = await axios.post(proxied(url), body, {
    headers: headers(),
  });
  return data;
}

async function spotifyPut(url, body) {
  const { data } = await axios.put(proxied(url), body, {
    headers: headers(),
  });
  return data;
}

// --- API methods ---

export async function getCurrentUser() {
  const data = await spotifyGet(`${API_BASE}/me`);
  return { id: data.id, displayName: data.display_name };
}

export async function getLikedSongs(onProgress) {
  const songs = [];
  let offset = 0;
  const limit = 50;
  let total = null;

  do {
    const data = await spotifyGet(`${API_BASE}/me/tracks`, { limit, offset });
    total = data.total;

    for (const item of data.items) {
      songs.push({
        title: item.track.name,
        artists: item.track.artists.map((a) => a.name),
        id: item.track.id,
        uri: item.track.uri,
      });
    }

    offset += limit;
    if (onProgress) onProgress(songs.length, total);
  } while (offset < total);

  return songs;
}

export async function getPlaylists() {
  const playlists = [];
  let offset = 0;
  const limit = 50;
  let total = null;

  do {
    const data = await spotifyGet(`${API_BASE}/me/playlists`, {
      limit,
      offset,
    });
    total = data.total;

    for (const item of data.items) {
      playlists.push({
        id: item.id,
        name: item.name,
        trackCount: item.tracks.total,
        imageUrl: item.images?.[0]?.url || null,
      });
    }

    offset += limit;
  } while (offset < total);

  return playlists;
}

export async function getPlaylistTracks(playlistId, onProgress) {
  const songs = [];
  let offset = 0;
  const limit = 50;
  let total = null;

  do {
    const data = await spotifyGet(
      `${API_BASE}/playlists/${playlistId}/tracks`,
      { limit, offset },
    );
    total = data.total;

    for (const item of data.items) {
      if (item.track) {
        songs.push({
          title: item.track.name,
          artists: item.track.artists.map((a) => a.name),
          id: item.track.id,
          uri: item.track.uri,
        });
      }
    }

    offset += limit;
    if (onProgress) onProgress(songs.length, total);
  } while (offset < total);

  return songs;
}

export async function searchTrack(title, artists) {
  const query = `track:${title} artist:${artists[0]}`;
  const data = await spotifyGet(`${API_BASE}/search`, {
    q: query,
    type: 'track',
    limit: 5,
    market: 'US',
  });

  if (!data.tracks.items.length) return null;

  const track = data.tracks.items[0];
  return {
    title: track.name,
    artists: track.artists.map((a) => a.name),
    id: track.id,
    uri: track.uri,
  };
}

export async function saveTracks(trackIds) {
  for (let i = 0; i < trackIds.length; i += 50) {
    const batch = trackIds.slice(i, i + 50);
    await spotifyPut(`${API_BASE}/me/tracks`, { ids: batch });
  }
}

export async function createPlaylist(userId, name, description = '') {
  const data = await spotifyPost(
    `${API_BASE}/users/${userId}/playlists`,
    { name, description, public: false },
  );
  return data.id;
}

export async function addTracksToPlaylist(playlistId, trackUris) {
  for (let i = 0; i < trackUris.length; i += 100) {
    const batch = trackUris.slice(i, i + 100);
    await spotifyPost(`${API_BASE}/playlists/${playlistId}/tracks`, {
      uris: batch,
    });
  }
}
