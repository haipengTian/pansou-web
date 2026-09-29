<script setup lang="ts">
import { NDatePicker } from 'naive-ui';

// 日期范围选择（基于 NDatePicker type=daterange）。值为 ['YYYY-MM-DD', 'YYYY-MM-DD']，未选择为 null。
withDefaults(
  defineProps<{ modelValue?: [string, string] | null; size?: 'sm' | 'default'; clearable?: boolean; placeholder?: [string, string] }>(),
  { modelValue: null, size: 'default', clearable: true, placeholder: () => ['开始日期', '结束日期'] }
);

const emit = defineEmits<{ 'update:modelValue': [value: [string, string] | null] }>();
</script>

<template>
  <NDatePicker
    class="ui-date-range"
    type="daterange"
    value-format="yyyy-MM-dd"
    :formatted-value="modelValue"
    :size="size === 'sm' ? 'small' : 'medium'"
    :clearable="clearable"
    :start-placeholder="placeholder[0]"
    :end-placeholder="placeholder[1]"
    @update:formatted-value="emit('update:modelValue', $event as [string, string] | null)"
  />
</template>
