import { boot } from 'quasar/wrappers';
import { useAuthStore } from '../stores/auth';

export default boot(async ({ store }) => {
  const authStore = useAuthStore(store);

  // Spotify PKCE returns code in query params:
  // ...?code=xxx&state=spotify
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  if (code && state === 'spotify') {
    try {
      await authStore.handleSpotifyCallback(code);
    } catch (err) {
      console.error('Spotify callback failed:', err);
    }

    // Clean URL — remove query params, keep hash for router
    const cleanUrl =
      window.location.origin +
      window.location.pathname +
      window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
  }

  // Restore existing sessions from sessionStorage
  await authStore.loadExistingSession();
});
