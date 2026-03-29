<template>
  <q-page class="landing-page flex flex-center">
    <div class="landing-content">
      <!-- Music note icon -->
      <div class="text-center q-mb-md">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"
            fill="#6C3FC5"
          />
        </svg>
      </div>

      <!-- Title -->
      <h1 class="landing-title text-center q-mb-none">
        PlaylistLy
      </h1>
      <p class="landing-subtitle text-center q-mt-sm q-mb-xl">
        Transfer your playlists between Spotify and Tidal
      </p>

      <!-- Connection card -->
      <q-card class="connect-card" flat bordered>
        <q-card-section class="text-center">
          <p class="connect-text q-mb-lg">
            Connect your music streaming services to start transferring
            playlists
          </p>

          <!-- Spotify button -->
          <q-btn
            class="connect-btn spotify-btn q-mb-md"
            unelevated
            no-caps
            size="lg"
          >
            <svg
              class="q-mr-sm"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                fill="white"
              />
            </svg>
            Connect with Spotify
          </q-btn>

          <!-- Tidal button -->
          <q-btn
            class="connect-btn tidal-btn"
            unelevated
            no-caps
            size="lg"
          >
            <svg
              class="q-mr-sm"
              width="24"
              height="24"
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
            Connect with Tidal
          </q-btn>
        </q-card-section>

        <q-separator class="q-mx-md" />

        <q-card-section class="text-center">
          <p class="consent-text q-mb-none">
            By connecting, you agree to grant access to your playlists and
            library
          </p>
        </q-card-section>
      </q-card>

      <!-- Footer tagline -->
      <p class="tagline text-center q-mt-lg">Free • Fast • Secure</p>
    </div>
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'IndexPage',
});
</script>

<style lang="scss" scoped>
.landing-page {
  background: linear-gradient(135deg, #f5f3ff 0%, #f9fafb 50%, #f0f9ff 100%);
  min-height: 100vh;
}

.landing-content {
  width: 100%;
  max-width: 480px;
  padding: 48px 16px;
}

.landing-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.5px;
}

.landing-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

.connect-card {
  border-radius: 16px;
  border-color: #e5e7eb;
}

.connect-text {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
}

.connect-btn {
  width: 100%;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 24px;
  letter-spacing: 0.2px;
}

.spotify-btn {
  background-color: #65b944 !important;
  color: white;
}

.tidal-btn {
  background-color: #000000 !important;
  color: white;
}

.consent-text {
  font-size: 0.85rem;
  color: #9ca3af;
}

.tagline {
  font-size: 0.95rem;
  color: #9ca3af;
  letter-spacing: 1px;
}
</style>
