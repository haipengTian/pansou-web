<script setup lang="ts">
import { NSwitch } from 'naive-ui';

// 开关（基于 NSwitch）。默认插槽为标签文字，点击标签同样切换。
const props = withDefaults(defineProps<{ modelValue?: boolean; disabled?: boolean }>(), { modelValue: false });

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <span class="ui-switch-wrap">
    <NSwitch :value="modelValue" :disabled="disabled" @update:value="emit('update:modelValue', $event)" />
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

.ui-switch__label {
  cursor: pointer;
  user-select: none;
}
</style>
