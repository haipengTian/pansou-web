<script setup lang="ts">
// 复选框。默认插槽为标签文字；整行可点击。
const props = withDefaults(defineProps<{ modelValue?: boolean; disabled?: boolean; indeterminate?: boolean }>(), {
  modelValue: false
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <label class="ui-checkbox" :class="{ 'ui-checkbox--disabled': disabled }">
    <input
      class="ui-checkbox__native"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :aria-checked="indeterminate ? 'mixed' : modelValue"
      @change="toggle"
    />
    <span class="ui-checkbox__box" :class="{ 'is-checked': modelValue || indeterminate }" aria-hidden="true">
      <svg v-if="indeterminate" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 12h12" /></svg>
      <svg v-else-if="modelValue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10" /></svg>
    </span>
    <span v-if="$slots.default" class="ui-checkbox__label"><slot /></span>
  </label>
</template>

<style scoped>
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.875rem;
}

.ui-checkbox--disabled { opacity: 0.5; cursor: not-allowed; }

.ui-checkbox__native {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.ui-checkbox__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border: 1px solid hsl(var(--input));
  border-radius: 0.25rem;
  background: hsl(var(--background));
  color: hsl(var(--primary-foreground));
  transition: background-color 0.15s, border-color 0.15s;
}

.ui-checkbox__box svg { width: 0.75rem; height: 0.75rem; }

.ui-checkbox__box.is-checked {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.ui-checkbox__native:focus-visible + .ui-checkbox__box {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
</style>
