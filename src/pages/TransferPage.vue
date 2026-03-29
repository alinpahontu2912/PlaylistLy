<template>
  <q-page class="transfer-page flex flex-center">
    <div class="transfer-content">
      <!-- Header -->
      <div class="text-center" style="margin-bottom: 12px">
        <Music2 :size="48" color="#6C3FC5" :stroke-width="2" />
      </div>
      <h1 class="transfer-title text-center">Transferring...</h1>
      <p class="transfer-subtitle text-center">
        {{ sourceLabel }} → {{ targetLabel }}
      </p>

      <!-- Progress card -->
      <ProgressCard
        :phase-label="phaseLabel"
        :current="transferStore.progress.current"
        :total="transferStore.progress.total"
        :percent="transferStore.progressPercent"
        :current-item="transferStore.progress.currentItem"
      />

      <!-- Error display -->
      <q-banner
        v-if="transferStore.status === 'error'"
        class="q-mt-md bg-negative text-white"
        rounded
      >
        {{ transferStore.error }}
        <template v-slot:action>
          <q-btn flat label="Back" @click="goBack" />
        </template>
      </q-banner>

      <p class="transfer-hint text-center q-mt-lg">
        Please keep this tab open while the transfer is in progress.
      </p>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Music2 } from 'lucide-vue-next';
import ProgressCard from '../components/ProgressCard.vue';
import { useTransferStore } from '../stores/transfer';

defineOptions({ name: 'TransferPage' });

const router = useRouter();
const transferStore = useTransferStore();

const sourceLabel = computed(() =>
  transferStore.source === 'spotify' ? 'Spotify' : 'Tidal',
);
const targetLabel = computed(() =>
  transferStore.target === 'spotify' ? 'Spotify' : 'Tidal',
);

const phaseLabel = computed(() => {
  switch (transferStore.progress.phase) {
    case 'fetching':
      return `Fetching songs from ${sourceLabel.value}...`;
    case 'matching':
      return `Matching songs on ${targetLabel.value}...`;
    case 'saving':
      return `Saving to ${targetLabel.value}...`;
    default:
      return 'Preparing...';
  }
});

function goBack() {
  transferStore.reset();
  router.replace('/select');
}

onMounted(async () => {
  if (!transferStore.source || !transferStore.target) {
    router.replace('/select');
    return;
  }

  await transferStore.startTransfer();

  if (transferStore.status === 'complete') {
    router.replace('/results');
  }
});
</script>

<style lang="scss" scoped>
.transfer-page {
  background: linear-gradient(145deg, #f3f0ff 0%, #f9fafb 40%, #f0f7ff 100%);
  min-height: 100vh;
}

.transfer-content {
  width: 100%;
  max-width: 500px;
  padding: 60px 20px 40px;
}

.transfer-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.transfer-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0 0 32px 0;
}

.transfer-hint {
  font-size: 0.85rem;
  color: #9ca3af;
}
</style>
