<script setup lang="ts">
// 开关。默认插槽为标签文字。
const props = withDefaults(defineProps<{ modelValue?: boolean; disabled?: boolean }>(), { modelValue: false });

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <span class="ui-switch-wrap" :class="{ 'is-disabled': disabled }">
    <button
      type="button"
      role="switch"
      class="ui-switch"
      :class="{ 'is-on': modelValue }"
      :aria-checked="modelValue"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="ui-switch__thumb" />
    </button>
    <span v-if="$slots.default" class="ui-switch__label" @click="toggle"><slot /></span>
  </span>
</template>

<style scoped>
.ui-switch-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.ui-switch-wrap.is-disabled { opacity: 0.5; }

.ui-switch {
  position: relative;
  width: 2.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  background: hsl(var(--input));
  cursor: pointer;
  transition: background-color 0.2s;
}

.ui-switch.is-on { background: hsl(var(--primary)); }
.ui-switch:disabled { cursor: not-allowed; }

.ui-switch:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.ui-switch__thumb {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
  transition: transform 0.2s;
}

.ui-switch.is-on .ui-switch__thumb { transform: translateX(1rem); }

.ui-switch__label { cursor: pointer; user-select: none; }
</style>
