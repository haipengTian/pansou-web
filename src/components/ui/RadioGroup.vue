<script setup lang="ts" generic="T extends string | number">
import type { SelectOption } from './types';

// 单选组，分段按钮样式。支持方向键在选项间切换。
const props = withDefaults(
  defineProps<{
    modelValue?: T;
    options: SelectOption<T>[];
    size?: 'sm' | 'default';
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  { size: 'default' }
);

const emit = defineEmits<{ 'update:modelValue': [value: T] }>();

const select = (option: SelectOption<T>) => {
  if (props.disabled || option.disabled || option.value === props.modelValue) return;
  emit('update:modelValue', option.value);
};

const onKeydown = (event: KeyboardEvent, index: number) => {
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
  if (!step) return;
  event.preventDefault();
  const enabled = props.options.filter((o) => !o.disabled);
  if (enabled.length === 0) return;
  const current = enabled.indexOf(props.options[index]);
  const next = enabled[(current + step + enabled.length) % enabled.length];
  select(next);
  const group = (event.currentTarget as HTMLElement).parentElement;
  const nextIndex = props.options.indexOf(next);
  (group?.children[nextIndex] as HTMLElement | undefined)?.focus();
};
</script>

<template>
  <div class="ui-radio-group" :class="`ui-radio-group--${size}`" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="(option, index) in options"
      :key="String(option.value)"
      type="button"
      role="radio"
      class="ui-radio-group__item"
      :class="{ 'is-checked': option.value === modelValue }"
      :aria-checked="option.value === modelValue"
      :tabindex="option.value === modelValue ? 0 : -1"
      :disabled="disabled || option.disabled"
      @click="select(option)"
      @keydown="onKeydown($event, index)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.ui-radio-group {
  display: inline-flex;
  width: fit-content;
  padding: 0.1875rem;
  gap: 0.1875rem;
  border-radius: calc(var(--radius, 0.5rem));
  background: hsl(var(--muted));
}

.ui-radio-group__item {
  border: none;
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: transparent;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
}

.ui-radio-group--default .ui-radio-group__item { padding: 0.375rem 0.875rem; font-size: 0.875rem; }
.ui-radio-group--sm .ui-radio-group__item { padding: 0.25rem 0.625rem; font-size: 0.8125rem; }

.ui-radio-group__item.is-checked {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}

.ui-radio-group__item:disabled { opacity: 0.5; cursor: not-allowed; }

.ui-radio-group__item:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
</style>
