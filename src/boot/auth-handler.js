import { boot } from 'quasar/wrappers';
import { useAuthStore } from '../stores/auth';

export default boot(async ({ store }) => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  const authStore = useAuthStore(store);

  if (code && state === 'spotify') {
    await authStore.handleSpotifyCallback(code);

    // Clean URL — remove query params, keep hash
    const cleanUrl =
      window.location.origin +
      window.location.pathname +
      window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
  }

  // Restore existing sessions from sessionStorage
  await authStore.loadExistingSession();
});
