<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

// 模态框。v-model:open 控制显示；Esc、点击遮罩（closeOnOverlay）、右上角关闭按钮都会关闭。
// 打开时锁定页面滚动并把焦点移入对话框，关闭后恢复原焦点。
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

const panelRef = ref<HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;
let previousOverflow = '';

const close = () => {
  emit('update:open', false);
  emit('close');
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEsc && props.closable) {
    event.stopPropagation();
    close();
  }
};

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget && props.closeOnOverlay && props.closable) close();
};

const activate = async () => {
  previousFocus = document.activeElement as HTMLElement | null;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKeydown);
  await nextTick();
  const target = panelRef.value?.querySelector<HTMLElement>('[autofocus], input, textarea, select, button:not(.ui-modal__close)');
  (target || panelRef.value)?.focus();
};

const deactivate = () => {
  document.body.style.overflow = previousOverflow;
  document.removeEventListener('keydown', onKeydown);
  previousFocus?.focus?.();
  previousFocus = null;
};

watch(
  () => props.open,
  (open, wasOpen) => {
    if (open) activate();
    else if (wasOpen) deactivate();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (props.open) deactivate();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal">
      <div v-if="open" class="ui-modal__overlay" @mousedown.self="onOverlayClick">
        <div
          ref="panelRef"
          class="ui-modal__panel"
          :class="`ui-modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <div v-if="title || $slots.header || closable" class="ui-modal__header">
            <slot name="header">
              <div>
                <div v-if="title" class="ui-modal__title">{{ title }}</div>
                <div v-if="description" class="ui-modal__desc">{{ description }}</div>
              </div>
            </slot>
            <button v-if="closable" type="button" class="ui-modal__close" aria-label="关闭" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="ui-modal__body"><slot /></div>
          <div v-if="$slots.footer" class="ui-modal__footer"><slot name="footer" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ui-modal__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgb(0 0 0 / 0.45);
  backdrop-filter: blur(2px);
}

.ui-modal__panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100dvh - 2rem);
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.5rem) + 4px);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.18);
  outline: none;
}

.ui-modal__panel--sm { max-width: 24rem; }
.ui-modal__panel--md { max-width: 32rem; }
.ui-modal__panel--lg { max-width: 44rem; }
.ui-modal__panel--xl { max-width: 60rem; }

.ui-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0;
}

.ui-modal__title { font-size: 1.0625rem; font-weight: 600; line-height: 1.4; }
.ui-modal__desc { margin-top: 0.25rem; font-size: 0.875rem; color: hsl(var(--muted-foreground)); }

.ui-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin: -0.25rem -0.5rem 0 0;
  flex-shrink: 0;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}

.ui-modal__close:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
.ui-modal__close svg { width: 1.125rem; height: 1.125rem; }

.ui-modal__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.25rem;
}

.ui-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem;
}

.ui-modal-enter-active,
.ui-modal-leave-active { transition: opacity 0.15s ease; }
.ui-modal-enter-active .ui-modal__panel,
.ui-modal-leave-active .ui-modal__panel { transition: transform 0.15s ease; }
.ui-modal-enter-from,
.ui-modal-leave-to { opacity: 0; }
.ui-modal-enter-from .ui-modal__panel,
.ui-modal-leave-to .ui-modal__panel { transform: translateY(8px) scale(0.98); }
</style>
