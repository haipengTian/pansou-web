<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';

// 单行输入框。class/style 作用在外层容器，其余原生属性（placeholder、autocomplete、
// maxlength、name…）透传给内部 input。type="number" 时回传数字（空值回传空字符串）。
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
const inputRef = ref<HTMLInputElement | null>(null);

const wrapperAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const onInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value;
  if (props.type === 'number') {
    emit('update:modelValue', raw === '' ? '' : Number(raw));
    return;
  }
  emit('update:modelValue', raw);
};

const onKeydown = (event: KeyboardEvent) => {
  // 输入法组合输入时的回车只是确认候选词，不能当作提交。
  if (event.key === 'Enter' && !event.isComposing) emit('enter', event);
};

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
});
</script>

<template>
  <div
    v-bind="wrapperAttrs"
    class="ui-input"
    :class="[
      `ui-input--${size}`,
      {
        'ui-input--search': variant === 'search',
        'ui-input--invalid': invalid,
        'ui-input--disabled': disabled,
        'ui-input--has-prefix': $slots.prefix,
        'ui-input--has-suffix': $slots.suffix
      }
    ]"
  >
    <span v-if="$slots.prefix" class="ui-input__prefix"><slot name="prefix" /></span>
    <input
      ref="inputRef"
      v-bind="inputAttrs"
      class="ui-input__control"
      :class="{ 'ui-input__control--center': align === 'center' }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autofocus="autofocus"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @keydown="onKeydown"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <span v-if="$slots.suffix" class="ui-input__suffix"><slot name="suffix" /></span>
  </div>
</template>

<style scoped>
.ui-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius, 0.5rem) - 2px);
  background: hsl(var(--background));
  transition: border-color 0.15s, box-shadow 0.15s;
}

.ui-input:focus-within {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.ui-input--invalid,
.ui-input--invalid:focus-within {
  border-color: hsl(var(--destructive));
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.12);
}

.ui-input--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-input__control {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: hsl(var(--foreground));
  padding: 0 0.75rem;
  font-size: 0.875rem;
}

.ui-input__control::placeholder { color: hsl(var(--muted-foreground)); }
.ui-input__control--center { text-align: center; }
.ui-input__control:disabled { cursor: not-allowed; }

.ui-input--sm { height: 2rem; }
.ui-input--default { height: 2.5rem; }
.ui-input--lg { height: 2.75rem; }
.ui-input--lg .ui-input__control { font-size: 0.9375rem; }

.ui-input--search {
  height: 3rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}
.ui-input--search .ui-input__control { font-size: 1rem; padding-left: 1rem; }

.ui-input--has-prefix .ui-input__control { padding-left: 0.25rem; }
.ui-input--has-suffix .ui-input__control { padding-right: 0.25rem; }

.ui-input__prefix,
.ui-input__suffix {
  display: inline-flex;
  align-items: center;
  color: hsl(var(--muted-foreground));
  flex-shrink: 0;
}
.ui-input__prefix { padding-left: 0.75rem; }
.ui-input__suffix { padding-right: 0.5rem; }
</style>
