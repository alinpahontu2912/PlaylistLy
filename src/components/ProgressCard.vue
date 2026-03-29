<template>
  <div class="progress-card">
    <div class="progress-card__phase">{{ phaseLabel }}</div>

    <q-linear-progress
      :value="percent / 100"
      size="12px"
      rounded
      color="primary"
      track-color="grey-3"
      class="q-my-md"
    />

    <div class="progress-card__stats">
      <span class="progress-card__count">{{ current }} / {{ total }}</span>
      <span class="progress-card__percent">{{ percent }}%</span>
    </div>

    <div v-if="currentItem" class="progress-card__item">
      <Loader2
        :size="16"
        color="#6C3FC5"
        class="progress-card__spinner"
      />
      <span>{{ currentItem }}</span>
    </div>
  </div>
</template>

<script setup>
import { Loader2 } from 'lucide-vue-next';

defineOptions({ name: 'ProgressCard' });

defineProps({
  phaseLabel: { type: String, default: 'Processing...' },
  current: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  percent: { type: Number, default: 0 },
  currentItem: { type: String, default: '' },
});
</script>

<style lang="scss" scoped>
.progress-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 32px;

  &__phase {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 4px;
  }

  &__stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #6b7280;
  }

  &__percent {
    font-weight: 600;
    color: #6C3FC5;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 0.9rem;
    color: #6b7280;
    padding: 10px 14px;
    background: #f9fafb;
    border-radius: 10px;
  }

  &__spinner {
    animation: spin 1s linear infinite;
    flex-shrink: 0;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
