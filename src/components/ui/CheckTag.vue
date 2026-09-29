<script setup lang="ts">
// 可勾选的标签卡片：用于插件、频道、网盘类型等"从一组选项里多选"的场景。
const props = withDefaults(
  defineProps<{ modelValue?: boolean; disabled?: boolean; size?: 'sm' | 'default' }>(),
  { modelValue: false, size: 'default' }
);

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <button
    type="button"
    role="checkbox"
    class="ui-check-tag"
    :class="[`ui-check-tag--${size}`, { 'is-checked': modelValue }]"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="ui-check-tag__mark" aria-hidden="true">
      <svg v-if="modelValue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10" /></svg>
    </span>
    <span class="ui-check-tag__content"><slot /></span>
  </button>
</template>

<style scoped>
.ui-check-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
  text-align: left;
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.ui-check-tag--default { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
.ui-check-tag--sm { padding: 0.3rem 0.6rem; font-size: 0.8125rem; }

.ui-check-tag:hover:not(:disabled) { border-color: hsl(var(--primary) / 0.5); }

.ui-check-tag.is-checked {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.06);
}

.ui-check-tag:disabled { opacity: 0.5; cursor: not-allowed; }

.ui-check-tag:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.ui-check-tag__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border: 1px solid hsl(var(--input));
  border-radius: 0.25rem;
  color: hsl(var(--primary-foreground));
}

.is-checked .ui-check-tag__mark {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.ui-check-tag__mark svg { width: 0.75rem; height: 0.75rem; }

.ui-check-tag__content {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
