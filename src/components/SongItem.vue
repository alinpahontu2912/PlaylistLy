<template>
  <div class="song-item" :class="variant">
    <div class="song-item__icon">
      <CheckCircle2
        v-if="variant === 'success'"
        :size="24"
        color="#16a34a"
        :stroke-width="2"
      />
      <XCircle
        v-else
        :size="24"
        color="#dc2626"
        :stroke-width="2"
      />
    </div>
    <div class="song-item__info">
      <span class="song-item__title">{{ title }}</span>
      <span class="song-item__artist">{{ artist }}</span>
      <span v-if="reason" class="song-item__reason">{{ reason }}</span>
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2, XCircle } from 'lucide-vue-next';

defineOptions({ name: 'SongItem' });

defineProps({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  reason: { type: String, default: '' },
  variant: {
    type: String,
    default: 'success',
    validator: (v) => ['success', 'error'].includes(v),
  },
});
</script>

<style lang="scss" scoped>
.song-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;

  &.success {
    border-color: #d1fae5;
  }

  &.error {
    border-color: #fecaca;
  }

  &__icon {
    flex-shrink: 0;
    padding-top: 2px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a1a2e;
  }

  &__artist {
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: 2px;
  }

  &__reason {
    font-size: 0.8rem;
    color: #dc2626;
    margin-top: 6px;
    font-weight: 500;
  }
}
</style>
