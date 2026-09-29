<script setup lang="ts">
// 卡片。title/description 可用属性或 header 插槽提供。
defineProps<{ title?: string; description?: string; padding?: 'none' | 'sm' | 'default' }>();
</script>

<template>
  <div class="card" :class="padding ? `card--pad-${padding}` : undefined">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div class="ui-card__title-row">
          <div>
            <div class="ui-card__title">{{ title }}</div>
            <div v-if="description" class="card-description">{{ description }}</div>
          </div>
          <div v-if="$slots.actions" class="ui-card__actions"><slot name="actions" /></div>
        </div>
      </slot>
    </div>
    <div class="card-content">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.ui-card__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.ui-card__title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.ui-card__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.card--pad-none > .card-header,
.card--pad-none > .card-content,
.card--pad-none > .card-footer { padding: 0; }

.card--pad-sm > .card-header { padding: 1rem 1rem 0.5rem; }
.card--pad-sm > .card-content { padding: 0 1rem 1rem; }
.card--pad-sm > .card-content:first-child { padding-top: 1rem; }
.card--pad-sm > .card-footer { padding: 0 1rem 1rem; }
</style>
