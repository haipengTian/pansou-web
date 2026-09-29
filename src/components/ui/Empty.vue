<script setup lang="ts">
// 空状态
defineProps<{ title?: string; description?: string }>();
</script>

<template>
  <div class="ui-empty">
    <div v-if="$slots.icon" class="ui-empty__icon"><slot name="icon" /></div>
    <div v-if="title" class="ui-empty__title">{{ title }}</div>
    <div v-if="description || $slots.default" class="ui-empty__desc"><slot>{{ description }}</slot></div>
    <div v-if="$slots.action" class="ui-empty__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  text-align: center;
}

.ui-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.ui-empty__title { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); }
.ui-empty__desc { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
.ui-empty__action { margin-top: 0.5rem; }
</style>
