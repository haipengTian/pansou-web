<script setup lang="ts" generic="T extends string | number">
import { NRadioButton, NRadioGroup } from 'naive-ui';
import type { SelectOption } from './types';

// 单选组（基于 NRadioGroup + NRadioButton），分段按钮样式。
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

const onUpdate = (value: T) => {
  if (value !== props.modelValue) emit('update:modelValue', value);
};
</script>

<template>
  <NRadioGroup
    class="ui-radio-group"
    :value="modelValue"
    :size="size === 'sm' ? 'small' : 'medium'"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @update:value="onUpdate"
  >
    <NRadioButton
      v-for="option in options"
      :key="String(option.value)"
      :value="option.value"
      :label="option.label"
      :disabled="option.disabled"
    />
  </NRadioGroup>
</template>

<style scoped>
/* naive 在任意聚焦时都画焦点框；弹窗自动聚焦第一项时看起来像"已选中"，只在键盘聚焦时显示 */
.ui-radio-group :deep(.n-radio-button--focus:not(:has(.n-radio-input:focus-visible)) .n-radio-button__state-border) {
  box-shadow: none;
}
</style>
