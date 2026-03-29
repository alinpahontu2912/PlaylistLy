import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as spotify from '../services/spotify';
import * as tidal from '../services/tidal';

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const spotifyUser = ref(null);
  const tidalUser = ref(null);
  const tidalPolling = ref(false);
  const tidalUserCode = ref(null);
  const tidalVerificationUrl = ref(null);
  const error = ref(null);

  // --- Getters ---
  const isSpotifyConnected = computed(() => spotify.isConnected());
  const isTidalConnected = computed(() => tidal.isConnected());
  const bothConnected = computed(
    () => isSpotifyConnected.value && isTidalConnected.value,
  );

  // --- Actions ---

  async function connectSpotify() {
    error.value = null;
    try {
      await spotify.login();
    } catch (err) {
      error.value = `Spotify login failed: ${err.message}`;
    }
  }

  async function handleSpotifyCallback(code) {
    error.value = null;
    try {
      await spotify.handleCallback(code);
      const user = await spotify.getCurrentUser();
      spotifyUser.value = user;
    } catch (err) {
      error.value = `Spotify auth failed: ${err.message}`;
    }
  }

  async function connectTidal() {
    error.value = null;
    tidalPolling.value = true;

    try {
      const deviceAuth = await tidal.startDeviceAuth();
      tidalUserCode.value = deviceAuth.userCode;
      tidalVerificationUrl.value = deviceAuth.verificationUrl;

      // Open Tidal login in new tab
      window.open(deviceAuth.verificationUrl, '_blank');

      // Poll for token
      const tokenData = await tidal.pollForToken(
        deviceAuth.deviceCode,
        deviceAuth.interval,
        deviceAuth.expiresIn,
      );

      tidalUser.value = {
        id: tokenData.userId,
        displayName: tokenData.username || `User ${tokenData.userId}`,
        countryCode: tokenData.countryCode,
      };
    } catch (err) {
      error.value = `Tidal auth failed: ${err.message}`;
    } finally {
      tidalPolling.value = false;
      tidalUserCode.value = null;
      tidalVerificationUrl.value = null;
    }
  }

  async function loadExistingSession() {
    if (spotify.isConnected()) {
      try {
        spotifyUser.value = await spotify.getCurrentUser();
      } catch {
        spotify.disconnect();
      }
    }
    if (tidal.isConnected()) {
      try {
        tidalUser.value = await tidal.getCurrentUser();
      } catch {
        tidal.disconnect();
      }
    }
  }

  function disconnectSpotify() {
    spotify.disconnect();
    spotifyUser.value = null;
  }

  function disconnectTidal() {
    tidal.disconnect();
    tidalUser.value = null;
  }

  return {
    spotifyUser,
    tidalUser,
    tidalPolling,
    tidalUserCode,
    tidalVerificationUrl,
    error,
    isSpotifyConnected,
    isTidalConnected,
    bothConnected,
    connectSpotify,
    handleSpotifyCallback,
    connectTidal,
    loadExistingSession,
    disconnectSpotify,
    disconnectTidal,
  };
});
