<template>
  <div class="stat-card" :class="variant">
    <div class="stat-card__content">
      <span class="stat-card__label">{{ label }}</span>
      <span class="stat-card__value">{{ value }}</span>
    </div>
    <div class="stat-card__icon">
      <component :is="icon" :size="32" :color="iconColor" :stroke-width="1.5" />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'StatCard' });

defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: Object, required: true },
  iconColor: { type: String, default: '#9ca3af' },
  variant: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'success', 'error'].includes(v),
  },
});
</script>

<style lang="scss" scoped>
.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px 24px;

  &.success {
    border-color: #86efac;
  }

  &.error {
    border-color: #fca5a5;
    background: #fef2f2;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 4px;

    .error & {
      color: #dc2626;
    }

    .success & {
      color: #16a34a;
    }
  }

  &__value {
    font-size: 2.25rem;
    font-weight: 700;
    color: #1a1a2e;
  }

  &__icon {
    opacity: 0.8;
  }
}
</style>
