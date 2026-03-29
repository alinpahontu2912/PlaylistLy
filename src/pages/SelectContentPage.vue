<template>
  <q-page class="select-page">
    <div class="select-content">
      <!-- Header -->
      <div class="select-header">
        <div class="select-header__title-row">
          <Music2 :size="32" color="#6C3FC5" :stroke-width="2" />
          <h1 class="select-header__title">Select Content</h1>
        </div>
        <p class="select-header__subtitle">
          Choose what to transfer between your platforms
        </p>
      </div>

      <!-- Direction selector -->
      <div class="direction-card">
        <div class="direction-card__row">
          <q-btn-toggle
            v-model="source"
            toggle-color="primary"
            no-caps
            rounded
            unelevated
            :options="[
              { label: 'Spotify', value: 'spotify' },
              { label: 'Tidal', value: 'tidal' },
            ]"
          />
          <ArrowRight :size="24" color="#9ca3af" />
          <q-badge
            class="direction-card__target"
            :class="target === 'tidal' ? 'badge-tidal' : 'badge-spotify'"
            rounded
          >
            {{ target === 'tidal' ? 'Tidal' : 'Spotify' }}
          </q-badge>
        </div>
      </div>

      <!-- Liked songs toggle -->
      <div class="content-section">
        <q-item tag="label" clickable class="content-item">
          <q-item-section avatar>
            <q-checkbox v-model="likedSongs" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="content-item__title">
              <Heart :size="18" color="#dc2626" :stroke-width="2" />
              Liked Songs
            </q-item-label>
            <q-item-label caption>
              All your saved/favorite tracks
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>

      <!-- Playlists -->
      <div class="content-section">
        <div class="section-header">
          <h3 class="section-header__title">Playlists</h3>
          <q-btn
            flat
            dense
            no-caps
            :label="allSelected ? 'Deselect All' : 'Select All'"
            color="primary"
            size="sm"
            @click="toggleAll"
          />
        </div>

        <div v-if="loadingPlaylists" class="text-center q-pa-lg">
          <q-spinner color="primary" size="32px" />
          <p class="q-mt-sm text-grey">Loading playlists...</p>
        </div>

        <div v-else class="playlist-list">
          <q-item
            v-for="pl in playlists"
            :key="pl.id"
            tag="label"
            clickable
            class="content-item"
          >
            <q-item-section avatar>
              <q-checkbox
                :model-value="isSelected(pl)"
                color="primary"
                @update:model-value="togglePlaylist(pl)"
              />
            </q-item-section>
            <q-item-section avatar v-if="pl.imageUrl">
              <q-avatar rounded size="40px">
                <img :src="pl.imageUrl" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="content-item__title">
                {{ pl.name }}
              </q-item-label>
              <q-item-label caption>
                {{ pl.trackCount }} tracks
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>

      <!-- Start button -->
      <q-btn
        class="start-btn"
        unelevated
        no-caps
        rounded
        color="primary"
        size="lg"
        :disable="!hasSelection"
        @click="startTransfer"
      >
        <ArrowRight :size="20" class="q-mr-sm" />
        Start Transfer
      </q-btn>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Music2, ArrowRight, Heart } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useTransferStore } from '../stores/transfer';
import * as spotify from '../services/spotify';
import * as tidal from '../services/tidal';

defineOptions({ name: 'SelectContentPage' });

const router = useRouter();
const authStore = useAuthStore();
const transferStore = useTransferStore();

const source = ref('spotify');
const likedSongs = ref(false);
const playlists = ref([]);
const selectedPlaylists = ref([]);
const loadingPlaylists = ref(false);

const target = computed(() => (source.value === 'spotify' ? 'tidal' : 'spotify'));

const allSelected = computed(
  () =>
    playlists.value.length > 0 &&
    selectedPlaylists.value.length === playlists.value.length,
);

const hasSelection = computed(
  () => likedSongs.value || selectedPlaylists.value.length > 0,
);

function isSelected(pl) {
  return selectedPlaylists.value.some((s) => s.id === pl.id);
}

function togglePlaylist(pl) {
  if (isSelected(pl)) {
    selectedPlaylists.value = selectedPlaylists.value.filter(
      (s) => s.id !== pl.id,
    );
  } else {
    selectedPlaylists.value.push(pl);
  }
}

function toggleAll() {
  if (allSelected.value) {
    selectedPlaylists.value = [];
  } else {
    selectedPlaylists.value = [...playlists.value];
  }
}

async function loadPlaylists() {
  loadingPlaylists.value = true;
  try {
    const service = source.value === 'spotify' ? spotify : tidal;
    playlists.value = await service.getPlaylists();
  } catch (err) {
    console.error('Failed to load playlists:', err);
    playlists.value = [];
  } finally {
    loadingPlaylists.value = false;
  }
}

function startTransfer() {
  transferStore.setDirection(source.value, target.value);
  transferStore.setSelection({
    likedSongs: likedSongs.value,
    playlists: selectedPlaylists.value,
  });
  router.push('/transfer');
}

watch(source, () => {
  selectedPlaylists.value = [];
  loadPlaylists();
});

onMounted(() => {
  if (!authStore.isSpotifyConnected || !authStore.isTidalConnected) {
    router.replace('/');
    return;
  }
  loadPlaylists();
});
</script>

<style lang="scss" scoped>
.select-page {
  background: linear-gradient(145deg, #f3f0ff 0%, #f9fafb 40%, #f0f7ff 100%);
  min-height: 100vh;
}

.select-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.select-header {
  margin-bottom: 28px;

  &__title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0;
  }

  &__subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
  }
}

.direction-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;

  &__row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__target {
    font-size: 0.9rem;
    font-weight: 600;
    padding: 8px 18px;
  }
}

.badge-tidal {
  background-color: #1a1a2e !important;
}

.badge-spotify {
  background-color: #16a34a !important;
}

.content-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  margin-bottom: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 8px;

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
  }
}

.content-item {
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
}

.playlist-list {
  max-height: 400px;
  overflow-y: auto;
}

.start-btn {
  width: 100%;
  margin-top: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 14px;
}
</style>
