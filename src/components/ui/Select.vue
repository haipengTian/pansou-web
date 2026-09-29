<script setup lang="ts" generic="T extends string | number">
// 下拉选择。内部使用原生 select 以保留移动端的系统选择器与无障碍支持，外观统一。
// 回传选项原本的值类型（数字选项回传数字）。
import type { SelectOption } from './types';

const props = withDefaults(
  defineProps<{
    modelValue?: T;
    options: SelectOption<T>[];
    placeholder?: string;
    size?: 'sm' | 'default' | 'lg';
    disabled?: boolean;
    invalid?: boolean;
  }>(),
  { size: 'default' }
);

const emit = defineEmits<{ 'update:modelValue': [value: T] }>();

const onChange = (event: Event) => {
  const raw = (event.target as HTMLSelectElement).value;
  const option = props.options.find((o) => String(o.value) === raw);
  if (option) emit('update:modelValue', option.value);
};
</script>

<template>
  <div class="ui-select" :class="[`ui-select--${size}`, { 'ui-select--invalid': invalid, 'ui-select--disabled': disabled }]">
    <select
      class="ui-select__control"
      :value="modelValue === undefined ? '' : String(modelValue)"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      @change="onChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="String(option.value)"
        :value="String(option.value)"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <svg class="ui-select__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
</template>

<style scoped>
.ui-select {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.ui-select__control {
  appearance: none;
  width: 100%;
  height: 100%;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  padding: 0 2rem 0 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.ui-select__control:focus {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.ui-select--invalid .ui-select__control { border-color: hsl(var(--destructive)); }
.ui-select--disabled { opacity: 0.5; }
.ui-select--disabled .ui-select__control { cursor: not-allowed; }

.ui-select--sm { height: 2rem; }
.ui-select--default { height: 2.5rem; }
.ui-select--lg { height: 2.75rem; }

.ui-select__arrow {
  position: absolute;
  right: 0.625rem;
  width: 1rem;
  height: 1rem;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}
</style>
