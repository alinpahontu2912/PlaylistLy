<template>
  <div class="song-list-card" :class="variant">
    <!-- Header -->
    <div class="song-list-card__header">
      <div class="song-list-card__header-left">
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
        <div class="song-list-card__title-block">
          <span class="song-list-card__title">{{ title }}</span>
          <span class="song-list-card__subtitle">{{ subtitle }}</span>
        </div>
      </div>
      <slot name="header-action" />
    </div>

    <!-- Scrollable list -->
    <div class="song-list-card__list">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2, XCircle } from 'lucide-vue-next';

defineOptions({ name: 'SongListCard' });

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  variant: {
    type: String,
    default: 'success',
    validator: (v) => ['success', 'error'].includes(v),
  },
});
</script>

<style lang="scss" scoped>
.song-list-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.success {
    border-left: 4px solid #16a34a;
  }

  &.error {
    border-left: 4px solid #dc2626;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 24px 16px;
  }

  &__header-left {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  &__title-block {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a1a2e;
  }

  &__subtitle {
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: 4px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 24px 24px;
    max-height: 420px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #9ca3af;
      border-radius: 3px;
    }
  }
}
</style>
