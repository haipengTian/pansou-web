<script setup lang="ts">
import { NCheckbox } from 'naive-ui';

// 复选框（基于 NCheckbox）。默认插槽为标签文字。
withDefaults(defineProps<{ modelValue?: boolean; disabled?: boolean; indeterminate?: boolean }>(), {
  modelValue: false
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <NCheckbox
    class="ui-checkbox"
    :checked="modelValue"
    :disabled="disabled"
    :indeterminate="indeterminate"
    @update:checked="emit('update:modelValue', $event)"
  >
    <slot />
  </NCheckbox>
</template>
