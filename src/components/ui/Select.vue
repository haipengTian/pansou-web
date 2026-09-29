<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue';
import { NSelect } from 'naive-ui';
import type { SelectOption } from './types';

// 下拉选择（基于 NSelect）。回传选项原本的值类型（数字选项回传数字）。
const props = withDefaults(
  defineProps<{
    modelValue?: T;
    options: SelectOption<T>[];
    placeholder?: string;
    size?: 'sm' | 'default' | 'lg';
    disabled?: boolean;
    invalid?: boolean;
    filterable?: boolean;
    clearable?: boolean;
  }>(),
  { size: 'default', filterable: false, clearable: false }
);

const emit = defineEmits<{ 'update:modelValue': [value: T] }>();

const SIZES = { sm: 'small', default: 'medium', lg: 'large' } as const;

const onUpdate = (value: T | null) => {
  if (value !== null) emit('update:modelValue', value);
};

// naive 以 null 表示未选择（显示占位文字）
const current = computed(() => (props.modelValue === undefined ? null : props.modelValue));
</script>

<template>
  <NSelect
    class="ui-select"
    :value="current"
    :options="options"
    :placeholder="placeholder"
    :size="SIZES[size]"
    :disabled="disabled"
    :filterable="filterable"
    :clearable="clearable"
    :status="invalid ? 'error' : undefined"
    @update:value="onUpdate"
  />
</template>
