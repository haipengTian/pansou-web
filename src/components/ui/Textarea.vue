<script setup lang="ts">
import { computed } from 'vue';

// 多行输入框。class/style 作用在控件本身，其余原生属性一并透传。
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

const classes = computed(() => [
  'ui-textarea',
  `ui-textarea--resize-${props.resize}`,
  { 'ui-textarea--invalid': props.invalid, 'ui-textarea--mono': props.monospace }
]);
</script>

<template>
  <textarea
    :class="classes"
    :value="modelValue"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :aria-invalid="invalid || undefined"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<style scoped>
.ui-textarea {
  display: block;
  width: 100%;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.ui-textarea::placeholder { color: hsl(var(--muted-foreground)); }

.ui-textarea:focus {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.ui-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

.ui-textarea--invalid,
.ui-textarea--invalid:focus {
  border-color: hsl(var(--destructive));
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.12);
}

.ui-textarea--mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
}

.ui-textarea--resize-none { resize: none; }
.ui-textarea--resize-vertical { resize: vertical; }
.ui-textarea--resize-both { resize: both; }
</style>
