<script setup lang="ts">
import { computed } from 'vue';
import Spinner from './Spinner.vue';

// 按钮。variant 'icon' 为旧写法，等同于 variant="ghost" + icon。
interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' | 'icon';
  size?: 'sm' | 'default' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  icon?: boolean;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  type: 'button',
  icon: false,
  block: false,
  disabled: false,
  loading: false
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const classes = computed(() => {
  const variant = props.variant === 'icon' ? 'ghost' : props.variant === 'primary' ? 'default' : props.variant;
  return [
    'ui-btn',
    `ui-btn--v-${variant}`,
    `ui-btn--s-${props.size}`,
    { 'ui-btn--icon': props.icon || props.variant === 'icon', 'ui-btn--block': props.block }
  ];
});

const onClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return;
  emit('click', event);
};
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <Spinner v-if="loading" size="sm" />
    <slot />
  </button>
</template>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s, opacity 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.ui-btn:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.ui-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 尺寸 */
.ui-btn--s-sm { height: 2rem; padding: 0 0.75rem; font-size: 0.8125rem; }
.ui-btn--s-default { height: 2.5rem; padding: 0 1rem; font-size: 0.875rem; }
.ui-btn--s-lg { height: 2.75rem; padding: 0 1.5rem; font-size: 0.9375rem; }
.ui-btn--icon.ui-btn--s-sm { width: 2rem; padding: 0; }
.ui-btn--icon.ui-btn--s-default { width: 2.5rem; padding: 0; }
.ui-btn--icon.ui-btn--s-lg { width: 2.75rem; padding: 0; }
.ui-btn--block { display: flex; width: 100%; }

/* 变体 */
.ui-btn--v-default {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  box-shadow: 0 1px 2px hsl(var(--primary) / 0.25);
}
.ui-btn--v-default:hover:not(:disabled) { background: hsl(var(--primary) / 0.9); }

.ui-btn--v-secondary {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border-color: hsl(var(--border));
}
.ui-btn--v-secondary:hover:not(:disabled) { background: hsl(var(--secondary) / 0.8); }

.ui-btn--v-outline {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}
.ui-btn--v-outline:hover:not(:disabled) {
  background: hsl(var(--muted));
  border-color: hsl(var(--border-hover, var(--border)));
}

.ui-btn--v-ghost {
  background: transparent;
  color: hsl(var(--foreground));
}
.ui-btn--v-ghost:hover:not(:disabled) {
  background: hsl(var(--muted));
}

.ui-btn--v-danger {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}
.ui-btn--v-danger:hover:not(:disabled) { background: hsl(var(--destructive) / 0.9); }

.ui-btn--v-link {
  height: auto;
  padding: 0;
  background: transparent;
  color: hsl(var(--primary));
}
.ui-btn--v-link:hover:not(:disabled) { text-decoration: underline; }
</style>
