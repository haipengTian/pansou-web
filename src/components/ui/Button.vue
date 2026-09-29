<script setup lang="ts">
import { computed } from 'vue';
import { NButton } from 'naive-ui';

// 按钮（基于 NButton）。variant 'icon' 为旧写法，等同于 variant="ghost" + icon。
// link / danger-link 为文字按钮，适合表格操作列等需要紧凑排列的地方。
interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' | 'danger-link' | 'icon';
  size?: 'sm' | 'default' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  icon?: boolean;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  type: 'button',
  icon: false,
  block: false,
  disabled: false,
  loading: false
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const SIZES = { sm: 'small', default: 'medium', lg: 'large' } as const;

const naiveProps = computed(() => {
  const base = {
    size: SIZES[props.size],
    attrType: props.type,
    loading: props.loading,
    disabled: props.disabled,
    block: props.block
  };
  switch (props.variant) {
    case 'secondary':
      return { ...base, secondary: true };
    case 'outline':
      return base;
    case 'ghost':
    case 'icon':
      return { ...base, quaternary: true };
    case 'danger':
      return { ...base, type: 'error' as const };
    case 'link':
      return { ...base, text: true, type: 'primary' as const };
    case 'danger-link':
      return { ...base, text: true, type: 'error' as const };
    default:
      return { ...base, type: 'primary' as const };
  }
});

const onClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return;
  emit('click', event);
};
</script>

<template>
  <NButton
    v-bind="naiveProps"
    class="ui-btn"
    :class="{ 'ui-btn--icon': icon || variant === 'icon' }"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <slot />
  </NButton>
</template>

<style scoped>
/* naive 把插槽内容包在 .n-button__content 里，图标与文字的间距在这一层设置 */
.ui-btn :deep(.n-button__content) {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

/* 仅图标按钮：正方形 */
.ui-btn--icon {
  width: var(--n-height);
  padding: 0;
}
</style>
