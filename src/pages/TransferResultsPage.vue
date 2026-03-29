<template>
  <q-page class="results-page">
    <div class="results-content">
      <!-- Page header -->
      <div class="results-header">
        <div class="results-header__title-row">
          <Music2 :size="32" color="#6C3FC5" :stroke-width="2" />
          <h1 class="results-header__title">Transfer Complete</h1>
        </div>
        <div class="results-header__badges">
          <q-badge class="badge-source" rounded>{{ sourceLabel }}</q-badge>
          <span class="badge-arrow">→</span>
          <q-badge class="badge-target" rounded>{{ targetLabel }}</q-badge>
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <StatCard
          label="Total Songs"
          :value="totalSongs"
          :icon="Music2Icon"
          icon-color="#9ca3af"
          variant="neutral"
        />
        <StatCard
          label="Successfully Transferred"
          :value="successSongs.length"
          :icon="CheckCircle2Icon"
          icon-color="#16a34a"
          variant="success"
        />
        <StatCard
          label="Not Found"
          :value="failedSongs.length"
          :icon="XCircleIcon"
          icon-color="#dc2626"
          variant="error"
        />
      </div>

      <!-- Song lists -->
      <div class="lists-row">
        <!-- Successfully transferred -->
        <SongListCard
          title="Successfully Transferred"
          subtitle="These songs are now in your new playlist."
          variant="success"
        >
          <SongItem
            v-for="(song, idx) in successSongs"
            :key="idx"
            :title="song.title"
            :artist="song.artist"
            variant="success"
          />
        </SongListCard>

        <!-- Songs not found -->
        <SongListCard
          title="Songs Not Found"
          subtitle="Manual search required for these items."
          variant="error"
        >
          <template #header-action>
            <q-btn
              outline
              no-caps
              rounded
              color="negative"
              size="sm"
              class="download-btn"
              @click="downloadFailedList"
            >
              <Download :size="16" class="q-mr-xs" />
              Download list
            </q-btn>
          </template>
          <SongItem
            v-for="(song, idx) in failedSongs"
            :key="idx"
            :title="song.title"
            :artist="song.artist"
            :reason="song.reason"
            variant="error"
          />
        </SongListCard>
      </div>

      <!-- Actions -->
      <div class="results-actions">
        <q-btn
          outline
          no-caps
          rounded
          color="primary"
          @click="startOver"
        >
          <ArrowLeft :size="18" class="q-mr-sm" />
          Transfer More
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Music2,
  CheckCircle2,
  XCircle,
  Download,
  ArrowLeft,
} from 'lucide-vue-next';
import StatCard from 'components/StatCard.vue';
import SongListCard from 'components/SongListCard.vue';
import SongItem from 'components/SongItem.vue';
import { useTransferStore } from '../stores/transfer';

defineOptions({ name: 'TransferResultsPage' });

const router = useRouter();
const transferStore = useTransferStore();

const Music2Icon = Music2;
const CheckCircle2Icon = CheckCircle2;
const XCircleIcon = XCircle;

const sourceLabel = computed(() =>
  transferStore.source === 'spotify' ? 'Spotify' : 'Tidal',
);
const targetLabel = computed(() =>
  transferStore.target === 'spotify' ? 'Spotify' : 'Tidal',
);

const successSongs = computed(() => transferStore.results.success);
const failedSongs = computed(() => transferStore.results.failed);
const totalSongs = computed(() => transferStore.results.total);

function downloadFailedList() {
  const lines = failedSongs.value.map(
    (s) => `${s.title} — ${s.artist} (${s.reason})`,
  );
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'not-found-songs.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function startOver() {
  transferStore.reset();
  router.push('/select');
}
</script>

<style lang="scss" scoped>
.results-page {
  background: linear-gradient(145deg, #f3f0ff 0%, #f9fafb 40%, #f0f7ff 100%);
  min-height: 100vh;
}

.results-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
}

// Header
.results-header {
  margin-bottom: 32px;

  &__title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0;
  }

  &__badges {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.badge-source,
.badge-target {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 16px;
  background-color: #16a34a !important;
}

.badge-target {
  background-color: #1a1a2e !important;
}

.badge-arrow {
  color: #9ca3af;
  font-size: 1.1rem;
}

// Stats row
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

// Lists row
.lists-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.download-btn {
  font-weight: 600;
}

.results-actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
}

// Responsive
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .lists-row {
    grid-template-columns: 1fr;
  }
}
</style>
