<script setup lang="ts">
import { computed } from 'vue';
import { NCard } from 'naive-ui';

// 卡片（基于 NCard）。title/description 可用属性或 header 插槽提供，actions 插槽放在标题右侧。
const props = defineProps<{ title?: string; description?: string; padding?: 'none' | 'sm' | 'default' }>();

const size = computed(() => (props.padding === 'sm' ? 'small' : 'medium'));
const contentStyle = computed(() => (props.padding === 'none' ? { padding: 0 } : undefined));
</script>

<template>
  <NCard class="ui-card" :size="size" :content-style="contentStyle" :bordered="true">
    <template v-if="$slots.header || title" #header>
      <slot name="header">
        <div class="ui-card__title">{{ title }}</div>
        <div v-if="description" class="ui-card__desc">{{ description }}</div>
      </slot>
    </template>
    <template v-if="$slots.actions" #header-extra><slot name="actions" /></template>
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </NCard>
</template>

<style scoped>
.ui-card__title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.ui-card__desc {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}
</style>
