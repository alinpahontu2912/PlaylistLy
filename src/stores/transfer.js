import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { transferContent } from '../services/transfer-engine';

export const useTransferStore = defineStore('transfer', () => {
  // --- State ---
  const source = ref(null); // 'spotify' | 'tidal'
  const target = ref(null);
  const selectedContent = ref({
    likedSongs: false,
    playlists: [],
  });
  const progress = ref({
    phase: '',
    current: 0,
    total: 0,
    currentItem: '',
  });
  const results = ref({
    success: [],
    failed: [],
    total: 0,
  });
  const status = ref('idle'); // idle | running | complete | error
  const error = ref(null);

  // --- Getters ---
  const hasSelection = computed(
    () =>
      selectedContent.value.likedSongs ||
      selectedContent.value.playlists.length > 0,
  );

  const progressPercent = computed(() => {
    if (!progress.value.total) return 0;
    return Math.round(
      (progress.value.current / progress.value.total) * 100,
    );
  });

  // --- Actions ---

  function setDirection(src, tgt) {
    source.value = src;
    target.value = tgt;
  }

  function setSelection(content) {
    selectedContent.value = content;
  }

  async function startTransfer() {
    if (!source.value || !target.value) {
      error.value = 'Source and target must be set';
      return;
    }

    status.value = 'running';
    error.value = null;

    try {
      const transferResults = await transferContent(
        source.value,
        target.value,
        selectedContent.value,
        (prog) => {
          progress.value = { ...prog };
        },
      );

      results.value = transferResults;
      status.value = 'complete';
    } catch (err) {
      error.value = err.message;
      status.value = 'error';
    }
  }

  function reset() {
    source.value = null;
    target.value = null;
    selectedContent.value = { likedSongs: false, playlists: [] };
    progress.value = { phase: '', current: 0, total: 0, currentItem: '' };
    results.value = { success: [], failed: [], total: 0 };
    status.value = 'idle';
    error.value = null;
  }

  return {
    source,
    target,
    selectedContent,
    progress,
    results,
    status,
    error,
    hasSelection,
    progressPercent,
    setDirection,
    setSelection,
    startTransfer,
    reset,
  };
});
