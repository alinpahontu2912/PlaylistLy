<template>
  <q-page class="landing-page flex flex-center">
    <div class="landing-content">
      <!-- Music note icon -->
      <div class="text-center" style="margin-bottom: 12px">
        <Music2 :size="52" color="#6C3FC5" :stroke-width="2" />
      </div>

      <!-- Title -->
      <h1 class="landing-title text-center">PlaylistLy</h1>
      <p class="landing-subtitle text-center">
        Transfer your playlists between Spotify and Tidal
      </p>

      <!-- Connection card -->
      <q-card class="connect-card" flat bordered>
        <q-card-section class="card-top-section">
          <p class="connect-text text-center">
            Connect your music streaming services to start transferring
            playlists
          </p>

          <!-- Spotify button -->
          <q-btn
            class="connect-btn spotify-btn"
            :class="{ 'btn-connected': authStore.isSpotifyConnected }"
            unelevated
            no-caps
            :disable="authStore.isSpotifyConnected"
            @click="authStore.connectSpotify"
          >
            <div class="btn-inner">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                  fill="white"
                />
              </svg>
              <span v-if="authStore.isSpotifyConnected">
                <CheckCircle2 :size="18" class="q-mr-xs" />
                Connected as {{ authStore.spotifyUser?.displayName }}
              </span>
              <span v-else>Connect with Spotify</span>
            </div>
          </q-btn>

          <!-- Tidal button -->
          <q-btn
            class="connect-btn tidal-btn"
            :class="{ 'btn-connected': authStore.isTidalConnected }"
            unelevated
            no-caps
            :disable="authStore.isTidalConnected || authStore.tidalPolling"
            :loading="authStore.tidalPolling"
            @click="authStore.connectTidal"
          >
            <div class="btn-inner">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004L8.008 8l4.004 4 4.004-4-4.004-4.004zm0 8.008l-4.004 4.004L12.012 20l4.004-4.004-4.004-4.004z"
                  fill="white"
                />
                <path
                  d="M20 3.992l-4.004 4.004L20 12l4-4.004L20 3.992z"
                  fill="white"
                />
              </svg>
              <span v-if="authStore.isTidalConnected">
                <CheckCircle2 :size="18" class="q-mr-xs" />
                Connected as {{ authStore.tidalUser?.displayName }}
              </span>
              <span v-else-if="authStore.tidalPolling">
                Waiting for authorization...
              </span>
              <span v-else>Connect with Tidal</span>
            </div>
          </q-btn>

          <!-- Tidal user code display -->
          <div
            v-if="authStore.tidalPolling && authStore.tidalUserCode"
            class="tidal-code"
          >
            <p>
              A Tidal login page has opened in a new tab.
              <br />
              If prompted, enter code:
              <strong>{{ authStore.tidalUserCode }}</strong>
            </p>
          </div>
        </q-card-section>

        <!-- Error display -->
        <q-banner
          v-if="authStore.error"
          class="q-mx-md q-mb-md bg-negative text-white"
          rounded
          dense
        >
          {{ authStore.error }}
        </q-banner>

        <!-- Continue button (both connected) -->
        <q-card-section
          v-if="authStore.bothConnected"
          class="text-center q-pt-none"
        >
          <q-btn
            class="continue-btn"
            unelevated
            no-caps
            rounded
            color="primary"
            size="lg"
            @click="$router.push('/select')"
          >
            <ArrowRight :size="20" class="q-mr-sm" />
            Continue to Transfer
          </q-btn>
        </q-card-section>

        <q-separator class="separator" />

        <q-card-section class="card-bottom-section">
          <p class="consent-text">
            By connecting, you agree to grant access to your playlists and
            library
          </p>
        </q-card-section>
      </q-card>

      <!-- Footer tagline -->
      <p class="tagline text-center">Free &bull; Fast &bull; Secure</p>
    </div>
  </q-page>
</template>

<script setup>
import { Music2, CheckCircle2, ArrowRight } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';

defineOptions({
  name: 'IndexPage',
});

const authStore = useAuthStore();
</script>

<style lang="scss" scoped>
.landing-page {
  background: linear-gradient(145deg, #f3f0ff 0%, #f9fafb 40%, #f0f7ff 100%);
  min-height: 100vh;
}

.landing-content {
  width: 100%;
  max-width: 560px;
  padding: 60px 20px 40px;
}

.landing-title {
  font-size: 2.75rem;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.5px;
  margin: 0 0 8px 0;
}

.landing-subtitle {
  font-size: 1.15rem;
  color: #6b7280;
  margin: 0 0 40px 0;
  line-height: 1.5;
}

.connect-card {
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: white;
}

.card-top-section {
  padding: 36px 32px 32px;
}

.connect-text {
  font-size: 1.05rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 28px 0;
}

.connect-btn {
  width: 100%;
  border-radius: 14px;
  min-height: 60px;

  :deep(.q-btn__content) {
    width: 100%;
  }
}

.btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;

  span {
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
}

.spotify-btn {
  background-color: #6abe45 !important;
  color: white;
  margin-bottom: 16px;
}

.tidal-btn {
  background-color: #000000 !important;
  color: white;
}

.btn-connected {
  opacity: 0.85;
}

.tidal-code {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 10px;
  text-align: center;

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #6b7280;
    line-height: 1.5;
  }

  strong {
    font-size: 1.2rem;
    color: #1a1a2e;
    letter-spacing: 2px;
  }
}

.continue-btn {
  width: 100%;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 14px;
}

.separator {
  margin: 0 28px;
}

.card-bottom-section {
  padding: 20px 32px 24px;
}

.consent-text {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.tagline {
  font-size: 1rem;
  color: #9ca3af;
  letter-spacing: 0.5px;
  margin: 28px 0 0 0;
}
</style>
