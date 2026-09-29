<script setup lang="ts">
import { NEmpty } from 'naive-ui';

// 空状态（基于 NEmpty）
defineProps<{ title?: string; description?: string }>();
</script>

<template>
  <NEmpty class="ui-empty" :description="title || description">
    <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    <template v-if="$slots.default || $slots.action" #extra>
      <div v-if="title && (description || $slots.default)" class="ui-empty__desc"><slot>{{ description }}</slot></div>
      <slot name="action" />
    </template>
  </NEmpty>
</template>

<style scoped>
.ui-empty {
  padding: 2rem 1rem;
}

.ui-empty__desc {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}
</style>
