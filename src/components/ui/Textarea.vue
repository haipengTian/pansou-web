<script setup lang="ts">
import { computed } from 'vue';
import { NInput } from 'naive-ui';

// 多行输入框（基于 NInput type=textarea）。
interface Props {
  modelValue?: string;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  monospace?: boolean;
  resize?: 'none' | 'vertical' | 'both';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
  resize: 'vertical'
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const inputProps = computed(() => ({ 'aria-invalid': props.invalid || undefined }));
</script>

<template>
  <NInput
    type="textarea"
    :class="['ui-textarea', { 'ui-textarea--mono': monospace }]"
    :value="modelValue"
    :rows="rows"
    :placeholder="placeholder ?? ''"
    :disabled="disabled"
    :readonly="readonly"
    :resizable="resize !== 'none'"
    :status="invalid ? 'error' : undefined"
    :input-props="inputProps"
    @update:value="emit('update:modelValue', $event)"
  />
</template>

<style scoped>
.ui-textarea--mono :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
}
</style>
