import { boot } from 'quasar/wrappers';
import { useAuthStore } from '../stores/auth';

export default boot(async ({ store, router }) => {
  const authStore = useAuthStore(store);

  // Spotify Implicit Grant returns token in the URL hash:
  // .../#access_token=xxx&token_type=Bearer&expires_in=3600&state=spotify
  // But with hash-mode router, the hash is like:
  // .../#/access_token=xxx&...  or  .../#access_token=xxx&...
  const fullHash = window.location.hash;

  if (fullHash.includes('access_token') && fullHash.includes('state=spotify')) {
    // Extract the fragment after the first '#' (skip router '#/')
    const fragment = fullHash.replace(/^#\/?/, '');
    try {
      authStore.handleSpotifyImplicitCallback(fragment);
    } catch (err) {
      console.error('Spotify callback failed:', err);
    }

    // Clean URL — go back to root
    window.history.replaceState(
      {},
      '',
      window.location.origin + window.location.pathname + '#/',
    );
  }

  // Restore existing sessions from sessionStorage
  await authStore.loadExistingSession();
});
