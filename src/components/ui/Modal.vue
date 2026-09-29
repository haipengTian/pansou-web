<script setup lang="ts">
import { computed } from 'vue';
import { NModal } from 'naive-ui';

// 模态框（基于 NModal preset=card）。v-model:open 控制显示；Esc、点击遮罩（closeOnOverlay）、
// 右上角关闭按钮都会关闭。滚动锁定与焦点管理由 naive 负责。
interface Props {
  open: boolean;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  closeOnEsc: true
});

const emit = defineEmits<{ 'update:open': [value: boolean]; close: [] }>();

const WIDTHS = { sm: '24rem', md: '32rem', lg: '44rem', xl: '60rem' };
const style = computed(() => ({ width: WIDTHS[props.size], maxWidth: 'calc(100vw - 2rem)' }));

const onUpdateShow = (show: boolean) => {
  if (show) return;
  emit('update:open', false);
  emit('close');
};
</script>

<template>
  <NModal
    :show="open"
    preset="card"
    class="ui-modal"
    :style="style"
    :title="title"
    :closable="closable"
    :mask-closable="closable && closeOnOverlay"
    :close-on-esc="closable && closeOnEsc"
    :auto-focus="true"
    :bordered="false"
    size="medium"
    role="dialog"
    :aria-label="title"
    @update:show="onUpdateShow"
  >
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <div v-if="description" class="ui-modal__desc">{{ description }}</div>
    <slot />
    <template v-if="$slots.footer" #footer>
      <div class="ui-modal__footer"><slot name="footer" /></div>
    </template>
  </NModal>
</template>

<style scoped>
.ui-modal__desc {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.ui-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
