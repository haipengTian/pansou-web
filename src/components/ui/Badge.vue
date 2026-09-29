<script setup lang="ts">
import type { Tone } from './types';

// 状态徽标
withDefaults(defineProps<{ tone?: Tone; size?: 'sm' | 'default'; solid?: boolean }>(), {
  tone: 'default',
  size: 'default',
  solid: false
});
</script>

<template>
  <span class="ui-badge" :class="[`ui-badge--tone-${tone}`, `ui-badge--size-${size}`, { 'ui-badge--solid': solid }]">
    <slot />
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  border: 1px solid;
  border-radius: 999px;
  font-weight: 500;
  line-height: 1.4;
}

.ui-badge--size-default { padding: 0.05rem 0.55rem; font-size: 0.75rem; }
.ui-badge--size-sm { padding: 0 0.4rem; font-size: 0.6875rem; }

.ui-badge--tone-default { color: hsl(var(--muted-foreground)); border-color: hsl(var(--border)); }
.ui-badge--tone-primary { color: hsl(var(--primary)); border-color: hsl(var(--primary) / 0.4); }
.ui-badge--tone-success { color: #059669; border-color: rgb(5 150 105 / 0.4); }
.ui-badge--tone-warning { color: #d97706; border-color: rgb(217 119 6 / 0.4); }
.ui-badge--tone-danger { color: hsl(var(--destructive)); border-color: hsl(var(--destructive) / 0.4); }

.ui-badge--solid { border-color: transparent; }
.ui-badge--solid.ui-badge--tone-default { background: hsl(var(--muted)); }
.ui-badge--solid.ui-badge--tone-primary { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
.ui-badge--solid.ui-badge--tone-success { background: #059669; color: #fff; }
.ui-badge--solid.ui-badge--tone-warning { background: #d97706; color: #fff; }
.ui-badge--solid.ui-badge--tone-danger { background: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); }
</style>
