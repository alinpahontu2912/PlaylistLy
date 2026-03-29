import axios from 'axios';
import { saveToken, loadToken, removeToken } from './token-store';

const CLIENT_ID = 'zU4XHVVkc2tDPo4t';
const AUTH_BASE = 'https://auth.tidal.com/v1/oauth2';
const API_BASE = 'https://api.tidal.com/v1';
const SCOPES = 'r_usr w_usr w_sub';

// Public CORS proxy — change this if the service goes down
const CORS_PROXY = 'https://corsproxy.io/?';

function proxied(url) {
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

// --- Auth (Device Authorization Flow) ---

export async function startDeviceAuth() {
  const { data } = await axios.post(
    proxied(`${AUTH_BASE}/device_authorization`),
    new URLSearchParams({
      client_id: CLIENT_ID,
      scope: SCOPES,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  return {
    deviceCode: data.deviceCode,
    userCode: data.userCode,
    verificationUrl: data.verificationUriComplete || data.verificationUri,
    expiresIn: data.expiresIn,
    interval: data.interval || 5,
  };
}

export async function pollForToken(deviceCode, interval = 5, expiresIn = 300) {
  const deadline = Date.now() + expiresIn * 1000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, interval * 1000));

    try {
      const { data } = await axios.post(
        proxied(`${AUTH_BASE}/token`),
        new URLSearchParams({
          client_id: CLIENT_ID,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          scope: SCOPES,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      // Success — save token
      const tokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        userId: data.user?.userId || null,
        countryCode: data.user?.countryCode || 'US',
        username: data.user?.username || null,
      };

      saveToken('tidal', tokenData);
      return tokenData;
    } catch (err) {
      const errData = err.response?.data;
      if (
        errData?.error === 'authorization_pending' ||
        errData?.sub_status === 1002
      ) {
        continue; // Keep polling
      }
      if (errData?.error === 'expired_token') {
        throw new Error('Tidal authorization timed out. Please try again.');
      }
      throw err;
    }
  }

  throw new Error('Tidal authorization timed out.');
}

export function disconnect() {
  removeToken('tidal');
}

export function isConnected() {
  const data = loadToken('tidal');
  return !!data && Date.now() < data.expiresAt;
}

// --- Internal helpers ---

function getTokenData() {
  const data = loadToken('tidal');
  if (!data) throw new Error('Not authenticated with Tidal');
  if (Date.now() > data.expiresAt) throw new Error('Tidal token expired');
  return data;
}

function headers() {
  return { Authorization: `Bearer ${getTokenData().accessToken}` };
}

function getUserId() {
  return getTokenData().userId;
}

function getCountryCode() {
  return getTokenData().countryCode || 'US';
}

async function tidalGet(path, params = {}) {
  const url = `${API_BASE}${path}`;
  const { data } = await axios.get(proxied(url), {
    headers: headers(),
    params: { countryCode: getCountryCode(), ...params },
  });
  return data;
}

async function tidalPost(path, body, extraHeaders = {}) {
  const url = `${API_BASE}${path}`;
  const { data } = await axios.post(proxied(url), body, {
    headers: { ...headers(), ...extraHeaders },
  });
  return data;
}

// --- API methods ---

export async function getCurrentUser() {
  const tokenData = getTokenData();
  if (tokenData.userId && tokenData.username) {
    return {
      id: tokenData.userId,
      displayName: tokenData.username,
      countryCode: tokenData.countryCode,
    };
  }
  // Fallback: fetch from sessions endpoint
  const data = await tidalGet('/sessions');
  return {
    id: data.userId,
    displayName: data.userId.toString(),
    countryCode: data.countryCode,
  };
}

export async function getLikedSongs(onProgress) {
  const userId = getUserId();
  const songs = [];
  let offset = 0;
  const limit = 50;
  let total = null;

  do {
    const data = await tidalGet(`/users/${userId}/favorites/tracks`, {
      limit,
      offset,
      order: 'NAME',
      orderDirection: 'ASC',
    });
    total = data.totalNumberOfItems;

    for (const entry of data.items) {
      const item = entry.item;
      songs.push({
        title: item.title,
        artists: item.artists.map((a) => a.name),
        id: item.id,
      });
    }

    offset += limit;
    if (onProgress) onProgress(songs.length, total);
  } while (offset < total);

  return songs;
}

export async function getPlaylists() {
  const userId = getUserId();
  const playlists = [];
  let offset = 0;
  const limit = 50;
  let total = null;

  do {
    const data = await tidalGet(`/users/${userId}/playlists`, {
      limit,
      offset,
    });
    total = data.totalNumberOfItems;

    for (const item of data.items) {
      playlists.push({
        id: item.uuid,
        name: item.title,
        trackCount: item.numberOfTracks,
        imageUrl: item.squareImage
          ? `https://resources.tidal.com/images/${item.squareImage.replace(/-/g, '/')}/320x320.jpg`
          : null,
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
    const data = await tidalGet(`/playlists/${playlistId}/tracks`, {
      limit,
      offset,
    });
    total = data.totalNumberOfItems;

    for (const item of data.items) {
      songs.push({
        title: item.title,
        artists: item.artists.map((a) => a.name),
        id: item.id,
      });
    }

    offset += limit;
    if (onProgress) onProgress(songs.length, total);
  } while (offset < total);

  return songs;
}

export async function searchTrack(title, artists) {
  const query = `${title} ${artists[0]}`;
  const data = await tidalGet('/search/tracks', { query, limit: 5 });

  if (!data.items?.length) return null;

  const track = data.items[0];
  return {
    title: track.title,
    artists: track.artists.map((a) => a.name),
    id: track.id,
  };
}

export async function saveTracks(trackIds) {
  const userId = getUserId();
  for (let i = 0; i < trackIds.length; i += 50) {
    const batch = trackIds.slice(i, i + 50);
    await tidalPost(
      `/users/${userId}/favorites/tracks`,
      new URLSearchParams({ trackIds: batch.join(',') }),
      { 'Content-Type': 'application/x-www-form-urlencoded' },
    );
  }
}

export async function createPlaylist(userId, name, description = '') {
  const id = userId || getUserId();
  const data = await tidalPost(`/users/${id}/playlists`, {
    title: name,
    description,
  });
  return data.uuid;
}

export async function addTracksToPlaylist(playlistId, trackIds) {
  for (let i = 0; i < trackIds.length; i += 50) {
    const batch = trackIds.slice(i, i + 50);
    await tidalPost(
      `/playlists/${playlistId}/items`,
      new URLSearchParams({
        trackIds: batch.join(','),
        onDupes: 'SKIP',
      }),
      {
        'Content-Type': 'application/x-www-form-urlencoded',
        'If-None-Match': '*',
      },
    );
  }
}
