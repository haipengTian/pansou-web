<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { NInput } from 'naive-ui';

// 单行输入框（基于 NInput）。class/style 作用在外层，其余原生属性（autocomplete、maxlength、
// name、required…）透传给内部 input。type="number" 时回传数字（空值回传空字符串）。
defineOptions({ inheritAttrs: false });

interface Props {
  modelValue?: string | number;
  type?: 'text' | 'password' | 'email' | 'search' | 'number' | 'url';
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'search';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  autofocus?: boolean;
  align?: 'left' | 'center';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  size: 'default',
  variant: 'default',
  align: 'left'
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  enter: [event: KeyboardEvent];
}>();

const attrs = useAttrs();
const inputRef = ref<InstanceType<typeof NInput> | null>(null);

const SIZES = { sm: 'small', default: 'medium', lg: 'large' } as const;
const naiveSize = computed(() => (props.variant === 'search' ? 'large' : SIZES[props.size]));

const onKeydown = (event: KeyboardEvent) => {
  // 输入法组合输入时的回车只是确认候选词，不能当作提交。
  if (event.key === 'Enter' && !event.isComposing) emit('enter', event);
};

// 透传给内部 <input> 的属性
const inputProps = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return {
    ...rest,
    inputmode: props.type === 'number' ? 'decimal' : undefined,
    'aria-invalid': props.invalid || undefined,
    style: props.align === 'center' ? 'text-align: center' : undefined,
    onKeydown
  };
});

const onUpdate = (raw: string) => {
  if (props.type === 'number') {
    const trimmed = raw.trim();
    emit('update:modelValue', trimmed === '' || Number.isNaN(Number(trimmed)) ? '' : Number(trimmed));
    return;
  }
  emit('update:modelValue', raw);
};

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
});
</script>

<template>
  <NInput
    ref="inputRef"
    :class="['ui-input', { 'ui-input--search': variant === 'search' }, attrs.class]"
    :style="(attrs.style as any)"
    :value="modelValue === undefined || modelValue === null ? '' : String(modelValue)"
    :type="type === 'password' ? 'password' : 'text'"
    :size="naiveSize"
    :placeholder="placeholder ?? ''"
    :disabled="disabled"
    :readonly="readonly"
    :autofocus="autofocus"
    :status="invalid ? 'error' : undefined"
    :input-props="(inputProps as any)"
    @update:value="onUpdate"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
    <template v-if="$slots.suffix" #suffix><slot name="suffix" /></template>
  </NInput>
</template>

<style scoped>
.ui-input--search {
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}
</style>
